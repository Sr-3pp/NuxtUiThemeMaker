import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvent, type H3Event } from 'h3'

const getOptionalAuthSessionMock = vi.fn()

vi.mock('~~/server/utils/auth-session', () => ({
  getOptionalAuthSession: getOptionalAuthSessionMock,
}))

function createGetEvent() {
  return createEvent({
    method: 'GET',
    url: '/api/palettes/generation-access',
    headers: {},
  } as never, {
    writableEnded: false,
    headersSent: false,
  } as never)
}

describe('palette generation access api handler', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    getOptionalAuthSessionMock.mockReset()
  })

  it('returns unauthenticated access metadata for guests', async () => {
    getOptionalAuthSessionMock.mockResolvedValueOnce(null)

    const { default: handler } = await import('~~/server/api/palettes/generation-access.get')
    const result = await handler(createGetEvent() as H3Event)

    expect(result).toMatchObject({
      canGenerate: false,
      isAdminUnlimited: false,
      reason: 'unauthenticated',
      freeRemaining: 3,
    })
  })

  it('returns capped paid access for active pro users', async () => {
    getOptionalAuthSessionMock.mockResolvedValueOnce({
      user: {
        id: 'user-1',
        isAdmin: false,
        plan: 'pro',
        planStatus: 'active',
        aiPaletteGenerationsUsed: 4,
      },
    })

    const { default: handler } = await import('~~/server/api/palettes/generation-access.get')
    const result = await handler(createGetEvent() as H3Event)

    expect(result).toMatchObject({
      canGenerate: true,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: 30,
      freeRemaining: 26,
      freeUsed: 4,
      reason: 'allowed',
    })
  })

  it('returns capped paid access for active studio users', async () => {
    getOptionalAuthSessionMock.mockResolvedValueOnce({
      user: {
        id: 'user-1',
        isAdmin: false,
        plan: 'studio',
        planStatus: 'active',
        aiPaletteGenerationsUsed: 99,
      },
    })

    const { default: handler } = await import('~~/server/api/palettes/generation-access.get')
    const result = await handler(createGetEvent() as H3Event)

    expect(result).toMatchObject({
      canGenerate: true,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: 100,
      freeRemaining: 1,
      freeUsed: 99,
      reason: 'allowed',
    })
  })
})
