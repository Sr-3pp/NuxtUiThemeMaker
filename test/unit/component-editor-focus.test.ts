import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getFocusTargetForGeneratedComponents, useComponentEditorFocus } from '../../app/composables/useComponentEditorFocus'

describe('component editor focus', () => {
  beforeEach(() => {
    const stateMap = new Map<string, { value: unknown }>()

    vi.stubGlobal('useState', (key: string, init: () => unknown) => {
      if (!stateMap.has(key)) {
        stateMap.set(key, { value: init() })
      }

      return stateMap.get(key)
    })
  })

  it('falls back to base when a generated component only has variants', () => {
    expect(getFocusTargetForGeneratedComponents({
      button: {
        variants: {
          solid: {
            primary: {
              bg: 'var(--ui-primary)',
            },
          },
        },
      },
    })).toEqual({
      component: 'button',
      area: 'base',
    })
  })

  it('falls back to base when a generated component has no variants', () => {
    expect(getFocusTargetForGeneratedComponents({
      input: {
        base: {
          bg: 'var(--ui-bg)',
        },
      },
    })).toEqual({
      component: 'input',
      area: 'base',
    })
  })

  it('increments the focus request id when a new focus target is pushed', () => {
    const { focusTarget, focusComponentEditor } = useComponentEditorFocus()

    expect(focusTarget.value.requestId).toBe(0)

    focusComponentEditor({
      component: 'button',
      area: 'base',
    })

    expect(focusTarget.value).toEqual({
      component: 'button',
      area: 'base',
      requestId: 1,
    })
  })
})
