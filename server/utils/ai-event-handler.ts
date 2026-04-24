import type { H3Event } from 'h3'
import { assertPaletteGenerationAllowed, incrementPaletteGenerationUsageIfNeeded } from '~~/server/services/palette-generation-access'
import type { AuthSession } from '~~/server/types/auth-session'
import { getOptionalAuthSession } from '~~/server/utils/auth-session'
import { enforceAiRateLimit } from '~~/server/utils/rate-limit'
import { assertTrustedBrowserOrigin } from '~~/server/utils/request-origin'

/**
 * Handles common AI endpoint setup: origin check, auth, access control, and rate limiting.
 * Returns session and access for use in the endpoint.
 */
export async function setupAiEndpoint(event: H3Event) {
  assertTrustedBrowserOrigin(event)

  const session = await getOptionalAuthSession(event)
  const access = assertPaletteGenerationAllowed(session)
  
  enforceAiRateLimit(event, session?.user.id ?? null)

  return { session, access }
}

/**
 * Finalizes AI generation by tracking usage.
 */
export async function finalizeAiEndpoint(
  session: AuthSession | null,
  access: ReturnType<typeof assertPaletteGenerationAllowed>,
) {
  await incrementPaletteGenerationUsageIfNeeded(session, access)
}
