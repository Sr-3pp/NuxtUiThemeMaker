import { beforeEach, describe, expect, it, vi } from 'vitest'

const findPaletteByIdMock = vi.fn()
const parsePaletteObjectIdMock = vi.fn((id: string) => `object:${id}`)

vi.mock('h3', () => ({
  createError: (input: { statusCode: number, statusMessage: string, data?: unknown }) =>
    Object.assign(new Error(input.statusMessage), input),
}))

vi.mock('~~/server/db/repositories/palette-repository', () => ({
  findPaletteById: findPaletteByIdMock,
}))

vi.mock('~~/server/services/palette-helpers', () => ({
  parsePaletteObjectId: parsePaletteObjectIdMock,
}))

describe('palette QA service access', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    findPaletteByIdMock.mockReset()
    parsePaletteObjectIdMock.mockReset()
    parsePaletteObjectIdMock.mockImplementation((id: string) => `object:${id}`)
  })

  it('returns QA data for the owner', async () => {
    findPaletteByIdMock.mockResolvedValueOnce({
      _id: 'palette-id',
      userId: 'user-1',
      palette: {
        name: 'Publish Candidate',
        modes: {
          light: {
            color: {
              primary: '#2563eb',
              secondary: '#d97706',
              success: '#15803d',
              info: '#0284c7',
              warning: '#a16207',
              error: '#dc2626',
            },
            text: {
              default: '#0f172a',
              dimmed: '#64748b',
              muted: '#475569',
              highlighted: '#020617',
              inverted: '#ffffff',
            },
            bg: {
              default: '#f8fafc',
              muted: '#f1f5f9',
              elevated: '#ffffff',
              inverted: '#020617',
            },
            ui: {
              border: '#cbd5e1',
              ring: '#0f172a',
            },
          },
          dark: {
            color: {
              primary: '#60a5fa',
              secondary: '#facc15',
              success: '#4ade80',
              info: '#38bdf8',
              warning: '#fbbf24',
              error: '#f87171',
            },
            text: {
              default: '#f1f5f9',
              dimmed: '#94a3b8',
              muted: '#cbd5e1',
              highlighted: '#ffffff',
              inverted: '#020617',
            },
            bg: {
              default: '#020617',
              muted: '#0b1220',
              elevated: '#111827',
              inverted: '#f8fafc',
            },
            ui: {
              border: '#334155',
              ring: '#f1f5f9',
            },
          },
        },
      },
    })

    const { getPaletteQaReportForUser } = await import('../../server/services/palette-qa-service')

    const result = await getPaletteQaReportForUser('69af8b6940280b9bc83c3c07', 'user-1')

    expect(parsePaletteObjectIdMock).toHaveBeenCalledWith('69af8b6940280b9bc83c3c07')
    expect(result.paletteId).toBe('palette-id')
    expect(result.report.score).toBeGreaterThan(0)
  })

  it('throws forbidden for non-owners', async () => {
    findPaletteByIdMock.mockResolvedValueOnce({
      _id: 'palette-id',
      userId: 'user-2',
      palette: {
        name: 'Other Palette',
        modes: {
          light: {},
          dark: {},
        },
      },
    })

    const { getPaletteQaReportForUser } = await import('../../server/services/palette-qa-service')

    await expect(getPaletteQaReportForUser('69af8b6940280b9bc83c3c07', 'user-1')).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  })

  it('returns QA data for collaborators on private palettes', async () => {
    findPaletteByIdMock.mockResolvedValueOnce({
      _id: 'palette-id',
      userId: 'user-2',
      collaborators: [
        { userId: 'user-1', email: 'designer@example.com', name: 'Designer' },
      ],
      palette: {
        name: 'Shared Palette',
        modes: {
          light: {},
          dark: {},
        },
      },
    })

    const { getPaletteQaReportForUser } = await import('../../server/services/palette-qa-service')

    const result = await getPaletteQaReportForUser('69af8b6940280b9bc83c3c07', 'user-1')

    expect(result.paletteId).toBe('palette-id')
  })
})
