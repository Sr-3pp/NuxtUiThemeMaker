import type { LandingGeneratedPaletteState, LandingPaletteSessionPayload } from '~/types/landing-demo'
import {
  createLandingSessionPayload,
  LANDING_DEMO_STORAGE_KEY,
  normalizeLandingGeneratedState,
} from './landing-demo-state'

export function persistLandingDemoSession(input: {
  generated: LandingGeneratedPaletteState
  prompt: string
}) {
  if (!import.meta.client) {
    return
  }

  const payload = createLandingSessionPayload(input)
  sessionStorage.setItem(LANDING_DEMO_STORAGE_KEY, JSON.stringify(payload))
}

export function restoreLandingDemoSession(): Partial<LandingPaletteSessionPayload> | null {
  if (!import.meta.client) {
    return null
  }

  const serialized = sessionStorage.getItem(LANDING_DEMO_STORAGE_KEY)

  if (!serialized) {
    return null
  }

  try {
    const payload = JSON.parse(serialized) as Partial<LandingPaletteSessionPayload>

    return {
      prompt: typeof payload.prompt === 'string' ? payload.prompt : undefined,
      generated: payload.generated && typeof payload.generated === 'object'
        ? normalizeLandingGeneratedState(payload.generated)
        : undefined,
    }
  } catch {
    sessionStorage.removeItem(LANDING_DEMO_STORAGE_KEY)
    return null
  }
}
