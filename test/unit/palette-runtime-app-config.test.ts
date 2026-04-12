import { describe, expect, it } from 'vitest'
import {
  applyPaletteRuntimeUi,
  restorePaletteRuntimeUi,
  snapshotPaletteRuntimeUi,
} from '../../app/utils/palette-runtime-app-config'

describe('palette runtime app config', () => {
  it('preserves unrelated ui config while updating generated keys', () => {
    const uiConfig: Record<string, unknown> = {
      card: { slots: { root: 'rounded-md' } },
      button: { slots: { base: 'px-4' } },
      input: { slots: { base: 'border-default' } },
    }

    const snapshot = snapshotPaletteRuntimeUi(uiConfig)

    const firstKeys = applyPaletteRuntimeUi(uiConfig, {
      card: { slots: { root: 'rounded-xl shadow-lg' } },
      modal: { slots: { content: 'border border-default' } },
    }, snapshot, [])

    expect(firstKeys).toEqual(['card', 'modal'])
    expect(uiConfig).toEqual({
      card: { slots: { root: 'rounded-xl shadow-lg' } },
      button: { slots: { base: 'px-4' } },
      input: { slots: { base: 'border-default' } },
      modal: { slots: { content: 'border border-default' } },
    })

    const secondKeys = applyPaletteRuntimeUi(uiConfig, {
      button: { slots: { base: 'px-6 py-3 rounded-full' } },
    }, snapshot, firstKeys)

    expect(secondKeys).toEqual(['button'])
    expect(uiConfig).toEqual({
      card: { slots: { root: 'rounded-md' } },
      button: { slots: { base: 'px-6 py-3 rounded-full' } },
      input: { slots: { base: 'border-default' } },
    })
  })

  it('restores the original ui config snapshot on reset', () => {
    const uiConfig: Record<string, unknown> = {
      card: { slots: { root: 'rounded-md' } },
      button: { slots: { base: 'px-4' } },
    }

    const snapshot = snapshotPaletteRuntimeUi(uiConfig)

    applyPaletteRuntimeUi(uiConfig, {
      card: { slots: { root: 'rounded-2xl ring ring-primary' } },
      modal: { slots: { content: 'bg-elevated' } },
    }, snapshot, [])

    restorePaletteRuntimeUi(uiConfig, snapshot)

    expect(uiConfig).toEqual({
      card: { slots: { root: 'rounded-md' } },
      button: { slots: { base: 'px-4' } },
    })
  })
})
