import { createError } from 'h3'
import { GoogleGenAI, type ContentListUnion } from '@google/genai'
import { ZodError, type ZodSchema } from 'zod'
import {
  assertPaletteGenerationAllowed,
  incrementPaletteGenerationUsageIfNeeded,
} from '~~/server/services/palette-generation-access'
import type { AuthSession } from '~~/server/types/auth-session'

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
    throw new Error('Gemini returned incomplete JSON output')
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

export async function assertPaletteAiAccess(session: AuthSession | null) {
  const access = assertPaletteGenerationAllowed(session)

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }

  return {
    session,
    access,
  }
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
  try {
    const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() })
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents ?? [prompt],
      config: {
        responseMimeType: 'application/json',
        responseSchema,
        maxOutputTokens: 4096,
      },
    })

    if (!response.text) {
      throw new Error('Gemini returned an empty response')
    }

    return schema.parse(parseStructuredResponse(response.text))
  } catch (error) {
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 422,
        statusMessage: `AI response failed validation: ${formatSchemaError(error)}`,
      })
    }

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Error generating AI content:', error)

    throw createError({
      statusCode: 500,
      message: 'Failed to generate content.',
    })
  }
}

export async function finalizePaletteAiUsage(session: AuthSession, access: ReturnType<typeof assertPaletteGenerationAllowed>) {
  await incrementPaletteGenerationUsageIfNeeded(session, access)
}
