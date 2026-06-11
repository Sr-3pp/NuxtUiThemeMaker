import { createError } from 'h3'
import { GoogleGenAI, type ContentListUnion } from '@google/genai'
import { ZodError, type ZodSchema } from 'zod'

const GEMINI_MODEL_FALLBACKS = [
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
] as const
const TRANSIENT_AI_STATUS_CODES = new Set([429, 500, 502, 503, 504])
const TRANSIENT_AI_STATUS_TEXTS = new Set(['RESOURCE_EXHAUSTED', 'UNAVAILABLE'])
const AI_RETRY_DELAYS_MS = [250, 750]
const AI_MAX_OUTPUT_TOKENS = 8192
const DEFAULT_AI_RETRY_AFTER_SECONDS = 60

class IncompleteAiJsonError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'IncompleteAiJsonError'
  }
}

class AiModelsUnavailableError extends Error {
  retryAfterSeconds: number

  constructor(retryAfterSeconds: number, cause: unknown) {
    super('All AI models are temporarily unavailable')
    this.name = 'AiModelsUnavailableError'
    this.retryAfterSeconds = retryAfterSeconds
    this.cause = cause
  }
}

function extractJsonPayload(text: string) {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const raw = (fencedMatch?.[1] ?? text).trim()
  const objectStart = raw.indexOf('{')
  const objectEnd = raw.lastIndexOf('}')
  const arrayStart = raw.indexOf('[')
  const arrayEnd = raw.lastIndexOf(']')

  const useObject = objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart
  const useArray = arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart

  if (!useObject && !useArray) {
    return raw
  }

  if (useObject && (!useArray || objectStart < arrayStart)) {
    return raw.slice(objectStart, objectEnd + 1)
  }

  return raw.slice(arrayStart, arrayEnd + 1)
}

function hasBalancedJsonDelimiters(text: string) {
  const stack: string[] = []
  let inString = false
  let escaped = false

  for (const char of text) {
    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === '"') {
      inString = !inString
      continue
    }

    if (inString) {
      continue
    }

    if (char === '{' || char === '[') {
      stack.push(char)
      continue
    }

    if (char === '}' || char === ']') {
      const expected = char === '}' ? '{' : '['

      if (stack.pop() !== expected) {
        return false
      }
    }
  }

  return stack.length === 0 && !inString
}

function parseStructuredResponse(text: string) {
  const payload = extractJsonPayload(text)

  if (!hasBalancedJsonDelimiters(payload)) {
    throw new IncompleteAiJsonError('Gemini returned incomplete JSON output')
  }

  try {
    return JSON.parse(payload)
  } catch (initialError) {
    const repaired = payload
      .replace(/^\s*\/\/.*$/gm, '')
      .replace(/^\s*\/\*[\s\S]*?\*\/\s*$/gm, '')
      .replace(/([{,]\s*)([A-Za-z_][\w-]*)(\s*:)/g, '$1"$2"$3')
      .replace(/:\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, value: string) => `:${JSON.stringify(value)}`)
      .replace(/,\s*([}\]])/g, '$1')

    try {
      return JSON.parse(repaired)
    } catch (repairError) {
      console.error('AI parse failed. Raw response:', text)
      console.error('AI parse failed. Extracted payload:', payload)
      console.error('AI parse failed. Repaired payload:', repaired)
      throw repairError instanceof Error ? repairError : initialError
    }
  }
}

function formatSchemaError(error: ZodError) {
  return error.issues
    .map(issue => `${issue.path.join('.') || 'root'}: ${issue.message}`)
    .join('; ')
}

function getAiRetryDelay(delayMs: number) {
  if (process.env.VITEST) {
    return 0
  }

  return delayMs
}

async function waitForAiRetry(delayMs: number) {
  const effectiveDelay = getAiRetryDelay(delayMs)

  if (!effectiveDelay) {
    return
  }

  await new Promise(resolve => setTimeout(resolve, effectiveDelay))
}

function extractAiErrorDetails(error: unknown) {
  if (!error || typeof error !== 'object') {
    return {
      statusCode: null,
      statusText: '',
      message: '',
    }
  }

  const candidate = error as {
    message?: unknown
    statusCode?: unknown
    code?: unknown
    status?: unknown
    statusMessage?: unknown
    error?: {
      code?: unknown
      status?: unknown
      message?: unknown
    }
  }

  const nestedError = candidate.error
  const statusCode = [
    candidate.statusCode,
    candidate.code,
    typeof candidate.status === 'number' ? candidate.status : null,
    nestedError?.code,
  ]
    .find(value => typeof value === 'number')

  const statusText = [
    typeof candidate.status === 'string' ? candidate.status : null,
    nestedError?.status,
  ]
    .find(value => typeof value === 'string') ?? ''

  const message = [candidate.message, candidate.statusMessage, nestedError?.message]
    .find(value => typeof value === 'string') ?? ''

  return {
    statusCode: statusCode ?? null,
    statusText,
    message,
  }
}

function extractAiRetryAfterSeconds(error: unknown) {
  if (!error || typeof error !== 'object') {
    return DEFAULT_AI_RETRY_AFTER_SECONDS
  }

  const candidate = error as {
    retryAfter?: unknown
    retryAfterSeconds?: unknown
    data?: {
      retryAfter?: unknown
      retryAfterSeconds?: unknown
    }
    message?: unknown
    error?: {
      message?: unknown
    }
  }

  const explicitRetryAfter = [
    candidate.retryAfter,
    candidate.retryAfterSeconds,
    candidate.data?.retryAfter,
    candidate.data?.retryAfterSeconds,
  ].find(value => typeof value === 'number' && Number.isFinite(value) && value > 0)

  if (typeof explicitRetryAfter === 'number') {
    return Math.ceil(explicitRetryAfter)
  }

  const message = [candidate.message, candidate.error?.message]
    .find(value => typeof value === 'string') ?? ''

  const retryAfterMatch = message.match(/(\d+)\s*s(?:ec(?:ond)?s?)?/i)
  const retryAfterSeconds = Number.parseInt(retryAfterMatch?.[1] ?? '', 10)

  return Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
    ? retryAfterSeconds
    : DEFAULT_AI_RETRY_AFTER_SECONDS
}

function isRetryableAiError(error: unknown) {
  if (error instanceof IncompleteAiJsonError || error instanceof AiModelsUnavailableError) {
    return true
  }

  const { statusCode, statusText, message } = extractAiErrorDetails(error)

  if (statusCode !== null && TRANSIENT_AI_STATUS_CODES.has(statusCode)) {
    return true
  }

  if (TRANSIENT_AI_STATUS_TEXTS.has(statusText)) {
    return true
  }

  return /high demand|try again later|temporar(?:ily)? unavailable/i.test(message)
}

function isAiModelFallbackError(error: unknown) {
  const { statusCode, statusText, message } = extractAiErrorDetails(error)

  if (statusCode === 429 || statusCode === 503) {
    return true
  }

  if (TRANSIENT_AI_STATUS_TEXTS.has(statusText)) {
    return true
  }

  return /high demand|try again later|temporar(?:ily)? unavailable/i.test(message)
}

async function requestStructuredPaletteAiContent(
  ai: GoogleGenAI,
  contents: ContentListUnion,
  responseSchema?: Record<string, unknown>,
) {
  let lastError: unknown
  let retryAfterSeconds = DEFAULT_AI_RETRY_AFTER_SECONDS

  for (const model of GEMINI_MODEL_FALLBACKS) {
    try {
      return await ai.models.generateContent({
        model,
        contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
          maxOutputTokens: AI_MAX_OUTPUT_TOKENS,
        },
      })
    } catch (error) {
      lastError = error

      if (!isAiModelFallbackError(error)) {
        throw error
      }

      retryAfterSeconds = extractAiRetryAfterSeconds(error)
      const { statusCode, statusText } = extractAiErrorDetails(error)

      console.warn('AI model fallback after transient provider error:', {
        model,
        statusCode,
        statusText,
      })
    }
  }

  throw new AiModelsUnavailableError(retryAfterSeconds, lastError)
}

export function getGeminiApiKey() {
  const { geminiApiKey: configuredGeminiApiKey } = useRuntimeConfig()
  const geminiApiKey = configuredGeminiApiKey || process.env.NUXT_GEMINI_API_KEY || ''

  if (!geminiApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Gemini API key is not configured.',
    })
  }

  return geminiApiKey
}

export async function generateStructuredPaletteAiResult<T>({
  prompt,
  contents,
  schema,
  responseSchema,
}: {
  prompt: string
  contents?: ContentListUnion
  schema: ZodSchema<T>
  responseSchema?: Record<string, unknown>
}) {
  const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() })
  let lastError: unknown

  for (let attempt = 0; attempt <= AI_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await requestStructuredPaletteAiContent(ai, contents ?? [prompt], responseSchema)

      if (!response?.text) {
        throw new IncompleteAiJsonError('Gemini returned an empty response')
      }

      return schema.parse(parseStructuredResponse(response.text))
    } catch (error) {
      lastError = error

      if (error instanceof ZodError) {
        throw createError({
          statusCode: 422,
          statusMessage: `AI response failed validation: ${formatSchemaError(error)}`,
        })
      }

      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error
      }

      if (error instanceof AiModelsUnavailableError) {
        console.error('AI provider temporarily unavailable:', error)

        throw createError({
          statusCode: 429,
          statusMessage: 'All AI models are at capacity right now. Please try again shortly.',
          data: {
            retryAfter: error.retryAfterSeconds,
          },
        })
      }

      if (!isRetryableAiError(error) || attempt === AI_RETRY_DELAYS_MS.length) {
        if (isRetryableAiError(error)) {
          console.error('AI provider temporarily unavailable:', error)

          throw createError({
            statusCode: 503,
            statusMessage: 'AI provider is temporarily unavailable. Please try again shortly.',
          })
        }

        console.error('Error generating AI content:', error)

        throw createError({
          statusCode: 500,
          message: 'Failed to generate content.',
        })
      }

      await waitForAiRetry(AI_RETRY_DELAYS_MS[attempt]!)
    }
  }

  throw lastError
}
