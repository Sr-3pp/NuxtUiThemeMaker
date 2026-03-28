import { createError, defineEventHandler, readBody } from 'h3'
import { GoogleGenAI } from '@google/genai'
import { paletteDefinitionSchema, paletteResponseSchema } from '~~/server/domain/palette-schema'
import {
  assertPaletteGenerationAllowed,
  incrementPaletteGenerationUsageIfNeeded,
} from '~~/server/services/palette-generation-access'
import { getOptionalAuthSession } from '~~/server/utils/auth-session'

function extractJsonPayload(text: string) {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const raw = (fencedMatch?.[1] ?? text).trim()
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')

  if (start === -1 || end === -1 || end <= start) {
    return raw
  }

  return raw.slice(start, end + 1)
}

function hasBalancedJsonBraces(text: string) {
  let depth = 0
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

    if (char === '{') {
      depth += 1
    } else if (char === '}') {
      depth -= 1
    }
  }

  return depth === 0 && !inString
}

function parsePaletteResponse(text: string) {
  const payload = extractJsonPayload(text)

  if (!hasBalancedJsonBraces(payload)) {
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
      console.error('Palette parse failed. Raw Gemini response:', text)
      console.error('Palette parse failed. Extracted payload:', payload)
      console.error('Palette parse failed. Repaired payload:', repaired)
      throw repairError instanceof Error ? repairError : initialError
    }
  }
}

const paletteGenerationInstructions = [
  'Return only structured JSON for a palette.',
  'Match the app palette format exactly.',
  'This palette will be used by Nuxt UI semantic theme tokens.',
  'The generated values map to CSS variables such as --ui-primary, --ui-secondary, --ui-success, --ui-info, --ui-warning, --ui-error, --ui-text, --ui-text-muted, --ui-bg, --ui-bg-muted, --ui-border, --ui-border-accented, and --ui-ring.',
  'Choose colors with common Nuxt UI combinations in mind: primary actions on default and elevated surfaces, body text on default and muted backgrounds, highlighted text on accented surfaces, borders between layered surfaces, and focus rings around interactive controls.',
  'Include a creative palette name in the "name" field.',
  'The name should be short, distinctive, and fit the palette mood.',
  'Include name, modes.light, and modes.dark.',
  'Each mode must include color, text, bg, ui, and radius groups.',
  'Use all expected token keys in every group.',
  'The ui group must use the keys "border", "border-muted", "border-accented", and "ring".',
  'All values must be strings.',
  'Choose colors that are accessible and WCAG-conscious.',
  'Ensure text tokens are readable against their intended background tokens in both light and dark modes.',
  'Target at least WCAG AA contrast for normal text where applicable, and avoid low-contrast foreground/background pairs.',
  'Treat text.default on bg.default and bg.elevated as primary reading pairs, and keep text.dimmed/text.muted readable on bg.muted.',
  'Ensure text.highlighted remains readable when used with bg.accented and brand-colored UI states.',
  'Keep muted, accented, border, and ring colors visibly distinct without reducing readability.',
  'Do not include markdown fences or extra commentary.',
  'Use valid JSON with double-quoted property names.',
].join(' ')

export default defineEventHandler(async (event) => {
  const session = await getOptionalAuthSession(event)
  const access = assertPaletteGenerationAllowed(session)
  const { geminiApiKey: configuredGeminiApiKey } = useRuntimeConfig()
  const geminiApiKey = configuredGeminiApiKey || process.env.NUXT_GEMINI_API_KEY || ''

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }

  if (!geminiApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Gemini API key is not configured.',
    })
  }

  const body = await readBody<{ prompt?: string }>(event)
  const prompt = body.prompt?.trim()

  if (!prompt) {
    throw createError({
      statusCode: 400,
      message: 'Prompt is required.',
    })
  }

  try {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey })
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [[prompt, paletteGenerationInstructions].join(' ')],
      config: {
        responseMimeType: 'application/json',
        responseSchema: paletteResponseSchema,
        maxOutputTokens: 4096,
      },
    })

    if (!response.text) {
      throw new Error('Gemini returned an empty response')
    }

    const generatedPalette = paletteDefinitionSchema.parse(parsePaletteResponse(response.text))
    await incrementPaletteGenerationUsageIfNeeded(session, access)

    return generatedPalette
  } catch (error) {
    console.error('Error generating content:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to generate content.',
    })
  }
})
