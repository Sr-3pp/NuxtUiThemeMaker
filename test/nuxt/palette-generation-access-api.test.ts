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
      freeRemaining: 5,
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
      freeLimit: 60,
      freeRemaining: 56,
      freeUsed: 4,
      reason: 'allowed',
    })
  })

  it('returns capped paid access for active teams users', async () => {
    getOptionalAuthSessionMock.mockResolvedValueOnce({
      user: {
        id: 'user-1',
        isAdmin: false,
        plan: 'teams',
        planStatus: 'active',
        aiPaletteGenerationsUsed: 299,
      },
    })

    const { default: handler } = await import('~~/server/api/palettes/generation-access.get')
    const result = await handler(createGetEvent() as H3Event)

    expect(result).toMatchObject({
      canGenerate: true,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: 300,
      freeRemaining: 1,
      freeUsed: 299,
      reason: 'allowed',
    })
  })
})
