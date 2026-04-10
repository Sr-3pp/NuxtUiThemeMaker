import { createError, createEvent, type H3Event } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const getOptionalAuthSessionMock = vi.fn()
const assertPaletteGenerationAllowedMock = vi.fn()
const incrementPaletteGenerationUsageIfNeededMock = vi.fn()
const generateContentMock = vi.fn()

vi.mock('~~/server/utils/auth-session', () => ({
  getOptionalAuthSession: getOptionalAuthSessionMock,
}))

vi.mock('~~/server/services/palette-generation-access', () => ({
  assertPaletteGenerationAllowed: assertPaletteGenerationAllowedMock,
  incrementPaletteGenerationUsageIfNeeded: incrementPaletteGenerationUsageIfNeededMock,
}))

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = {
      generateContent: generateContentMock,
    }
  },
}))

function createPostEvent(body: Record<string, unknown>, headers?: Record<string, string>) {
  const responseHeaders = new Map<string, string>()

  return createEvent({
    method: 'POST',
    url: '/api/palettes/generate',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body,
  } as never, {
    writableEnded: false,
    headersSent: false,
    setHeader(name: string, value: string) {
      responseHeaders.set(name.toLowerCase(), value)
    },
    getHeader(name: string) {
      return responseHeaders.get(name.toLowerCase())
    },
  } as never)
}

describe('palette generate api handler', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    getOptionalAuthSessionMock.mockReset()
    assertPaletteGenerationAllowedMock.mockReset()
    incrementPaletteGenerationUsageIfNeededMock.mockReset()
    generateContentMock.mockReset()
    process.env.NUXT_GEMINI_API_KEY = 'test-key'
  })

  it('returns the auth error for unauthenticated requests', async () => {
    const authError = createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })

    getOptionalAuthSessionMock.mockResolvedValueOnce(null)
    assertPaletteGenerationAllowedMock.mockImplementationOnce(() => {
      throw authError
    })

    const { default: handler } = await import('~~/server/api/palettes/generate')

    await expect(handler(createPostEvent({ prompt: 'Ocean dashboard' }) as H3Event)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })

    expect(generateContentMock).not.toHaveBeenCalled()
  })

  it('rejects untrusted browser origins before calling Gemini', async () => {
    const session = {
      user: {
        id: 'user-1',
        isAdmin: false,
        plan: 'free',
        planStatus: 'inactive',
        aiPaletteGenerationsUsed: 0,
      },
    }

    getOptionalAuthSessionMock.mockResolvedValueOnce(session)
    assertPaletteGenerationAllowedMock.mockReturnValueOnce({
      canGenerate: true,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: 5,
      freeUsed: 0,
      freeRemaining: 5,
      reason: 'allowed',
    })

    const { default: handler } = await import('~~/server/api/palettes/generate')

    await expect(handler(createPostEvent(
      { prompt: 'Ocean dashboard' },
      { origin: 'https://evil.example' },
    ) as H3Event)).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: 'Untrusted request origin',
    })

    expect(generateContentMock).not.toHaveBeenCalled()
    expect(incrementPaletteGenerationUsageIfNeededMock).not.toHaveBeenCalled()
  })

  it('increments usage after a successful free generation', async () => {
    const session = {
      user: {
        id: 'user-1',
        isAdmin: false,
        plan: 'free',
        planStatus: 'inactive',
        aiPaletteGenerationsUsed: 1,
      },
    }
    const access = {
      canGenerate: true,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: 3,
      freeUsed: 1,
      freeRemaining: 2,
      reason: 'allowed',
    }

    getOptionalAuthSessionMock.mockResolvedValueOnce(session)
    assertPaletteGenerationAllowedMock.mockReturnValueOnce(access)
    generateContentMock.mockResolvedValueOnce({
      text: JSON.stringify({
        name: 'Coastal Ledger',
        modes: {
          light: {
            color: { primary: '#0056B3', secondary: '#6C757D', success: '#28A745', info: '#17A2B8', warning: '#FFC107', error: '#DC3545' },
            text: { default: '#212529', dimmed: '#6C757D', muted: '#ADB5BD', toned: '#495057', highlighted: '#0056B3', inverted: '#FFFFFF' },
            bg: { default: '#F8F9FA', muted: '#E9ECEF', elevated: '#FFFFFF', accented: '#DEE2E6', inverted: '#002D62' },
            ui: { border: '#CED4DA', 'border-muted': '#E0E0E0', 'border-accented': '#0056B3', ring: '#80BDFF' },
            radius: { default: '4px', sm: '2px', md: '6px', lg: '8px', xl: '12px' },
          },
          dark: {
            color: { primary: '#4DA6FF', secondary: '#A0AEC0', success: '#69F0AE', info: '#4DD0E1', warning: '#FFD54F', error: '#EF5350' },
            text: { default: '#E2E8F0', dimmed: '#CBD5E0', muted: '#A0AEC0', toned: '#718096', highlighted: '#4DA6FF', inverted: '#1A202C' },
            bg: { default: '#1A202C', muted: '#2D3748', elevated: '#4A5568', accented: '#2C3E50', inverted: '#F8F9FA' },
            ui: { border: '#4A5568', 'border-muted': '#2D3748', 'border-accented': '#4DA6FF', ring: '#80BDFF' },
            radius: { default: '4px', sm: '2px', md: '6px', lg: '8px', xl: '12px' },
          },
        },
      }),
    })

    const { default: handler } = await import('~~/server/api/palettes/generate')
    const result = await handler(createPostEvent({ prompt: 'Ocean dashboard' }) as H3Event)

    expect(result).toMatchObject({ name: 'Coastal Ledger' })
    expect(incrementPaletteGenerationUsageIfNeededMock).toHaveBeenCalledWith(session, access)
  })

  it('sends WCAG accessibility instructions to Gemini', async () => {
    const session = {
      user: {
        id: 'user-1',
        isAdmin: false,
        plan: 'free',
        planStatus: 'inactive',
        aiPaletteGenerationsUsed: 0,
      },
    }

    getOptionalAuthSessionMock.mockResolvedValueOnce(session)
    assertPaletteGenerationAllowedMock.mockReturnValueOnce({
      canGenerate: true,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: 3,
      freeUsed: 0,
      freeRemaining: 3,
      reason: 'allowed',
    })
    generateContentMock.mockResolvedValueOnce({
      text: JSON.stringify({
        name: 'Harbor Signal',
        modes: {
          light: {
            color: { primary: '#0056B3', secondary: '#6C757D', success: '#28A745', info: '#17A2B8', warning: '#FFC107', error: '#DC3545' },
            text: { default: '#212529', dimmed: '#6C757D', muted: '#ADB5BD', toned: '#495057', highlighted: '#0056B3', inverted: '#FFFFFF' },
            bg: { default: '#F8F9FA', muted: '#E9ECEF', elevated: '#FFFFFF', accented: '#DEE2E6', inverted: '#002D62' },
            ui: { border: '#CED4DA', 'border-muted': '#E0E0E0', 'border-accented': '#0056B3', ring: '#80BDFF' },
            radius: { default: '4px', sm: '2px', md: '6px', lg: '8px', xl: '12px' },
          },
          dark: {
            color: { primary: '#4DA6FF', secondary: '#A0AEC0', success: '#69F0AE', info: '#4DD0E1', warning: '#FFD54F', error: '#EF5350' },
            text: { default: '#E2E8F0', dimmed: '#CBD5E0', muted: '#A0AEC0', toned: '#718096', highlighted: '#4DA6FF', inverted: '#1A202C' },
            bg: { default: '#1A202C', muted: '#2D3748', elevated: '#4A5568', accented: '#2C3E50', inverted: '#F8F9FA' },
            ui: { border: '#4A5568', 'border-muted': '#2D3748', 'border-accented': '#4DA6FF', ring: '#80BDFF' },
            radius: { default: '4px', sm: '2px', md: '6px', lg: '8px', xl: '12px' },
          },
        },
      }),
    })

    const { default: handler } = await import('~~/server/api/palettes/generate')

    await handler(createPostEvent({ prompt: 'Accessible fintech dashboard' }) as H3Event)

    expect(generateContentMock).toHaveBeenCalledWith(expect.objectContaining({
      contents: [expect.stringContaining('Choose colors that are accessible and WCAG-conscious.')],
    }))
    expect(generateContentMock).toHaveBeenCalledWith(expect.objectContaining({
      contents: [expect.stringContaining('Target at least WCAG AA contrast for normal text where applicable')],
    }))
    expect(generateContentMock).toHaveBeenCalledWith(expect.objectContaining({
      contents: [expect.stringContaining('This palette will be used by Nuxt UI semantic theme tokens.')],
    }))
    expect(generateContentMock).toHaveBeenCalledWith(expect.objectContaining({
      contents: [expect.stringContaining('Choose colors with common Nuxt UI combinations in mind')],
    }))
  })

  it('includes brand colors and style references in the AI prompt when provided', async () => {
    const session = {
      user: {
        id: 'user-1',
        isAdmin: false,
        plan: 'free',
        planStatus: 'inactive',
        aiPaletteGenerationsUsed: 0,
      },
    }

    getOptionalAuthSessionMock.mockResolvedValueOnce(session)
    assertPaletteGenerationAllowedMock.mockReturnValueOnce({
      canGenerate: true,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: 3,
      freeUsed: 0,
      freeRemaining: 3,
      reason: 'allowed',
    })
    generateContentMock.mockResolvedValueOnce({
      text: JSON.stringify({
        name: 'Signal Harbor',
        modes: {
          light: {
            color: { primary: '#0056B3', secondary: '#6C757D', success: '#28A745', info: '#17A2B8', warning: '#FFC107', error: '#DC3545' },
            text: { default: '#212529', dimmed: '#6C757D', muted: '#ADB5BD', toned: '#495057', highlighted: '#0056B3', inverted: '#FFFFFF' },
            bg: { default: '#F8F9FA', muted: '#E9ECEF', elevated: '#FFFFFF', accented: '#DEE2E6', inverted: '#002D62' },
            ui: { border: '#CED4DA', 'border-muted': '#E0E0E0', 'border-accented': '#0056B3', ring: '#80BDFF' },
            radius: { default: '4px', sm: '2px', md: '6px', lg: '8px', xl: '12px' },
          },
          dark: {
            color: { primary: '#4DA6FF', secondary: '#A0AEC0', success: '#69F0AE', info: '#4DD0E1', warning: '#FFD54F', error: '#EF5350' },
            text: { default: '#E2E8F0', dimmed: '#CBD5E0', muted: '#A0AEC0', toned: '#718096', highlighted: '#4DA6FF', inverted: '#1A202C' },
            bg: { default: '#1A202C', muted: '#2D3748', elevated: '#4A5568', accented: '#2C3E50', inverted: '#F8F9FA' },
            ui: { border: '#4A5568', 'border-muted': '#2D3748', 'border-accented': '#4DA6FF', ring: '#80BDFF' },
            radius: { default: '4px', sm: '2px', md: '6px', lg: '8px', xl: '12px' },
          },
        },
      }),
    })

    const { default: handler } = await import('~~/server/api/palettes/generate')

    await handler(createPostEvent({
      prompt: 'Convert this fintech screenshot into a starter theme',
      brandColors: ['#0ea5e9', '#1d4ed8'],
      referenceSummary: 'Clean trading dashboard with cool neutrals and high-contrast data accents',
    }) as H3Event)

    expect(generateContentMock).toHaveBeenCalledWith(expect.objectContaining({
      contents: [expect.stringContaining('Anchor the palette to these brand colors: #0ea5e9, #1d4ed8.')],
    }))
    expect(generateContentMock).toHaveBeenCalledWith(expect.objectContaining({
      contents: [expect.stringContaining('Style reference: Clean trading dashboard with cool neutrals and high-contrast data accents.')],
    }))
  })

  it('sends an attached reference image as multimodal input when provided', async () => {
    const session = {
      user: {
        id: 'user-1',
        isAdmin: false,
        plan: 'free',
        planStatus: 'inactive',
        aiPaletteGenerationsUsed: 0,
      },
    }

    getOptionalAuthSessionMock.mockResolvedValueOnce(session)
    assertPaletteGenerationAllowedMock.mockReturnValueOnce({
      canGenerate: true,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: 3,
      freeUsed: 0,
      freeRemaining: 3,
      reason: 'allowed',
    })
    generateContentMock.mockResolvedValueOnce({
      text: JSON.stringify({
        name: 'Reference Studio',
        modes: {
          light: {
            color: { primary: '#0056B3', secondary: '#6C757D', success: '#28A745', info: '#17A2B8', warning: '#FFC107', error: '#DC3545' },
            text: { default: '#212529', dimmed: '#6C757D', muted: '#ADB5BD', toned: '#495057', highlighted: '#0056B3', inverted: '#FFFFFF' },
            bg: { default: '#F8F9FA', muted: '#E9ECEF', elevated: '#FFFFFF', accented: '#DEE2E6', inverted: '#002D62' },
            ui: { border: '#CED4DA', 'border-muted': '#E0E0E0', 'border-accented': '#0056B3', ring: '#80BDFF' },
            radius: { default: '4px', sm: '2px', md: '6px', lg: '8px', xl: '12px' },
          },
          dark: {
            color: { primary: '#4DA6FF', secondary: '#A0AEC0', success: '#69F0AE', info: '#4DD0E1', warning: '#FFD54F', error: '#EF5350' },
            text: { default: '#E2E8F0', dimmed: '#CBD5E0', muted: '#A0AEC0', toned: '#718096', highlighted: '#4DA6FF', inverted: '#1A202C' },
            bg: { default: '#1A202C', muted: '#2D3748', elevated: '#4A5568', accented: '#2C3E50', inverted: '#F8F9FA' },
            ui: { border: '#4A5568', 'border-muted': '#2D3748', 'border-accented': '#4DA6FF', ring: '#80BDFF' },
            radius: { default: '4px', sm: '2px', md: '6px', lg: '8px', xl: '12px' },
          },
        },
      }),
    })

    const { default: handler } = await import('~~/server/api/palettes/generate')

    await handler(createPostEvent({
      prompt: 'Turn this screenshot into a starter theme',
      referenceImage: {
        data: 'ZmFrZS1pbWFnZS1iYXNlNjQ=',
        mimeType: 'image/png',
      },
    }) as H3Event)

    expect(generateContentMock).toHaveBeenCalledWith(expect.objectContaining({
      contents: [
        expect.objectContaining({ type: 'text' }),
        expect.objectContaining({ type: 'image', data: 'ZmFrZS1pbWFnZS1iYXNlNjQ=', mime_type: 'image/png' }),
      ],
    }))
  })

  it('rejects oversized reference images before calling Gemini', async () => {
    const session = {
      user: {
        id: 'user-1',
        isAdmin: false,
        plan: 'free',
        planStatus: 'inactive',
        aiPaletteGenerationsUsed: 0,
      },
    }

    getOptionalAuthSessionMock.mockResolvedValueOnce(session)
    assertPaletteGenerationAllowedMock.mockReturnValueOnce({
      canGenerate: true,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: 5,
      freeUsed: 0,
      freeRemaining: 5,
      reason: 'allowed',
    })

    const { default: handler } = await import('~~/server/api/palettes/generate')

    await expect(handler(createPostEvent({
      prompt: 'Turn this screenshot into a starter theme',
      referenceImage: {
        data: 'a'.repeat(3_000_001),
        mimeType: 'image/png',
      },
    }) as H3Event)).rejects.toMatchObject({
      name: 'ZodError',
    })

    expect(generateContentMock).not.toHaveBeenCalled()
    expect(incrementPaletteGenerationUsageIfNeededMock).not.toHaveBeenCalled()
  })

  it('does not increment usage when Gemini generation fails', async () => {
    const session = {
      user: {
        id: 'user-1',
        isAdmin: false,
        plan: 'free',
        planStatus: 'inactive',
        aiPaletteGenerationsUsed: 2,
      },
    }

    getOptionalAuthSessionMock.mockResolvedValueOnce(session)
    assertPaletteGenerationAllowedMock.mockReturnValueOnce({
      canGenerate: true,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: 3,
      freeUsed: 2,
      freeRemaining: 1,
      reason: 'allowed',
    })
    generateContentMock.mockRejectedValueOnce(new Error('Gemini unavailable'))

    const { default: handler } = await import('~~/server/api/palettes/generate')

    await expect(handler(createPostEvent({ prompt: 'Ocean dashboard' }) as H3Event)).rejects.toMatchObject({
      statusCode: 500,
      message: 'Failed to generate content.',
    })

    expect(incrementPaletteGenerationUsageIfNeededMock).not.toHaveBeenCalled()
  })

  it('retries transient Gemini overload errors before succeeding', async () => {
    const session = {
      user: {
        id: 'user-1',
        isAdmin: false,
        plan: 'free',
        planStatus: 'inactive',
        aiPaletteGenerationsUsed: 1,
      },
    }
    const access = {
      canGenerate: true,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: 3,
      freeUsed: 1,
      freeRemaining: 2,
      reason: 'allowed',
    }

    getOptionalAuthSessionMock.mockResolvedValueOnce(session)
    assertPaletteGenerationAllowedMock.mockReturnValueOnce(access)
    generateContentMock
      .mockRejectedValueOnce({
        error: {
          code: 503,
          message: 'This model is currently experiencing high demand. Please try again later.',
          status: 'UNAVAILABLE',
        },
      })
      .mockRejectedValueOnce({
        error: {
          code: 503,
          message: 'This model is currently experiencing high demand. Please try again later.',
          status: 'UNAVAILABLE',
        },
      })
      .mockResolvedValueOnce({
        text: JSON.stringify({
          name: 'Coastal Ledger',
          modes: {
            light: {
              color: { primary: '#0056B3', secondary: '#6C757D', success: '#28A745', info: '#17A2B8', warning: '#FFC107', error: '#DC3545' },
              text: { default: '#212529', dimmed: '#6C757D', muted: '#ADB5BD', toned: '#495057', highlighted: '#0056B3', inverted: '#FFFFFF' },
              bg: { default: '#F8F9FA', muted: '#E9ECEF', elevated: '#FFFFFF', accented: '#DEE2E6', inverted: '#002D62' },
              ui: { border: '#CED4DA', 'border-muted': '#E0E0E0', 'border-accented': '#0056B3', ring: '#80BDFF' },
              radius: { default: '4px', sm: '2px', md: '6px', lg: '8px', xl: '12px' },
            },
            dark: {
              color: { primary: '#4DA6FF', secondary: '#A0AEC0', success: '#69F0AE', info: '#4DD0E1', warning: '#FFD54F', error: '#EF5350' },
              text: { default: '#E2E8F0', dimmed: '#CBD5E0', muted: '#A0AEC0', toned: '#718096', highlighted: '#4DA6FF', inverted: '#1A202C' },
              bg: { default: '#1A202C', muted: '#2D3748', elevated: '#4A5568', accented: '#2C3E50', inverted: '#F8F9FA' },
              ui: { border: '#4A5568', 'border-muted': '#2D3748', 'border-accented': '#4DA6FF', ring: '#80BDFF' },
              radius: { default: '4px', sm: '2px', md: '6px', lg: '8px', xl: '12px' },
            },
          },
        }),
      })

    const { default: handler } = await import('~~/server/api/palettes/generate')
    const result = await handler(createPostEvent({ prompt: 'Ocean dashboard' }) as H3Event)

    expect(result).toMatchObject({ name: 'Coastal Ledger' })
    expect(generateContentMock).toHaveBeenCalledTimes(3)
    expect(incrementPaletteGenerationUsageIfNeededMock).toHaveBeenCalledWith(session, access)
  })

  it('returns 503 after transient Gemini overload errors exhaust retries', async () => {
    const session = {
      user: {
        id: 'user-1',
        isAdmin: false,
        plan: 'free',
        planStatus: 'inactive',
        aiPaletteGenerationsUsed: 2,
      },
    }

    getOptionalAuthSessionMock.mockResolvedValueOnce(session)
    assertPaletteGenerationAllowedMock.mockReturnValueOnce({
      canGenerate: true,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: 3,
      freeUsed: 2,
      freeRemaining: 1,
      reason: 'allowed',
    })
    generateContentMock
      .mockRejectedValueOnce({
        error: {
          code: 503,
          message: 'This model is currently experiencing high demand. Please try again later.',
          status: 'UNAVAILABLE',
        },
      })
      .mockRejectedValueOnce({
        error: {
          code: 503,
          message: 'This model is currently experiencing high demand. Please try again later.',
          status: 'UNAVAILABLE',
        },
      })
      .mockRejectedValueOnce({
        error: {
          code: 503,
          message: 'This model is currently experiencing high demand. Please try again later.',
          status: 'UNAVAILABLE',
        },
      })

    const { default: handler } = await import('~~/server/api/palettes/generate')

    await expect(handler(createPostEvent({ prompt: 'Ocean dashboard' }) as H3Event)).rejects.toMatchObject({
      statusCode: 503,
      statusMessage: 'AI provider is temporarily unavailable. Please try again shortly.',
    })

    expect(generateContentMock).toHaveBeenCalledTimes(3)
    expect(incrementPaletteGenerationUsageIfNeededMock).not.toHaveBeenCalled()
  })
})
