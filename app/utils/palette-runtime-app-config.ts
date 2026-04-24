import type { PaletteUiConfig } from '~/types/palette'

type UiSnapshot = Record<string, unknown>

function cloneValue<T>(value: T): T {
  try {
    if (typeof structuredClone === 'function') {
      return structuredClone(value)
    }
  } catch {
    return value
  }

  try {
    return JSON.parse(JSON.stringify(value)) as T
  } catch {
    return value
  }
}

export function snapshotPaletteRuntimeUi(uiConfig: Record<string, unknown>): UiSnapshot {
  return Object.keys(uiConfig).reduce<UiSnapshot>((snapshot, key) => {
    snapshot[key] = uiConfig[key] === undefined ? undefined : cloneValue(uiConfig[key])
    return snapshot
  }, {})
}

export function applyPaletteRuntimeUi(
  uiConfig: Record<string, unknown>,
  generatedUi: PaletteUiConfig,
  snapshot: UiSnapshot,
  appliedKeys: string[],
) {
  for (const key of appliedKeys) {
    if (key in snapshot) {
      uiConfig[key] = cloneValue(snapshot[key])
      continue
    }

    delete uiConfig[key]
  }

  for (const [key, value] of Object.entries(generatedUi)) {
    uiConfig[key] = cloneValue(value)
  }

  return Object.keys(generatedUi)
}

export function restorePaletteRuntimeUi(uiConfig: Record<string, unknown>, snapshot: UiSnapshot) {
  for (const key of Object.keys(uiConfig)) {
    if (!(key in snapshot)) {
      delete uiConfig[key]
    }
  }

  for (const key of Object.keys(snapshot)) {
    const previousValue = snapshot[key]
    uiConfig[key] = cloneValue(previousValue)
  }
}
