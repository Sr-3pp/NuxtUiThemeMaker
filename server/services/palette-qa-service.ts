import { createError } from 'h3'
import type { PaletteDefinition } from '~/types/palette'
import type { StoredPaletteQaReport } from '~/types/theme-qa'
import { auditPaletteTheme } from '../../app/utils/palette-qa'
import { findPaletteById } from '~~/server/db/repositories/palette-repository'
import { parsePaletteObjectId } from '~~/server/services/palette-helpers'

function hasPaletteAccess(
  palette: {
    userId: string
    collaborators?: Array<{ userId: string }>
  },
  userId: string,
) {
  return palette.userId === userId || Boolean(palette.collaborators?.some(collaborator => collaborator.userId === userId))
}

export function getPaletteQaReport(palette: PaletteDefinition) {
  return auditPaletteTheme(palette)
}

export async function getPaletteQaReportForUser(id: string, userId: string): Promise<StoredPaletteQaReport> {
  const objectId = parsePaletteObjectId(id)
  const palette = await findPaletteById(objectId)

  if (!palette) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Palette not found',
    })
  }

  if (!hasPaletteAccess(palette, userId)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  }

  return {
    paletteId: palette._id.toHexString(),
    report: getPaletteQaReport(palette.palette),
  }
}

export function assertPalettePublishReady(palette: PaletteDefinition) {
  const report = getPaletteQaReport(palette)
  const isPublishReady = report.readiness.every(item => item.passed)

  if (isPublishReady) {
    return report
  }

  const blockingIssues = report.issues
    .filter(issue => issue.severity === 'critical')
    .slice(0, 3)
    .map(issue => issue.title)

  const blockingSummary = blockingIssues.length
    ? ` Blocking issues: ${blockingIssues.join(', ')}.`
    : ''

  throw createError({
    statusCode: 422,
    statusMessage: `Palette is not ready to publish.${blockingSummary}`,
    data: {
      report,
    },
  })
}
