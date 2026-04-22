import type { PaletteComponentThemeSection, PaletteComponentThemes } from '~/types/palette'
import type { ComponentEditorArea } from '~/utils/component-theme-editor'

export interface ComponentEditorFocusTarget {
  component: string
  area: ComponentEditorArea
  slot?: string
  state?: string
}

interface ComponentEditorFocusState extends ComponentEditorFocusTarget {
  requestId: number
}

function getFirstKey(record?: Record<string, unknown>) {
  return record ? Object.keys(record)[0] : undefined
}

function getFocusTargetForComponent(
  component: string,
  theme?: PaletteComponentThemeSection,
): ComponentEditorFocusTarget {
  if (theme?.base) {
    return {
      component,
      area: 'base',
    }
  }

  const slot = getFirstKey(theme?.slots)
  if (slot) {
    return {
      component,
      area: 'slot',
      slot,
    }
  }

  const state = getFirstKey(theme?.states)
  if (state) {
    return {
      component,
      area: 'state',
      state,
    }
  }

  return {
    component,
    area: 'base',
  }
}

export function getFocusTargetForGeneratedComponents(components?: PaletteComponentThemes | null) {
  const component = components ? Object.keys(components)[0] : undefined

  if (!component) {
    return null
  }

  return getFocusTargetForComponent(component, components?.[component])
}

export function useComponentEditorFocus() {
  const focusTarget = useState<ComponentEditorFocusState>('component-editor-focus', () => ({
    component: 'button',
    area: 'base',
    requestId: 0,
  }))

  function focusComponentEditor(target: ComponentEditorFocusTarget) {
    focusTarget.value = {
      ...target,
      requestId: focusTarget.value.requestId + 1,
    }
  }

  return {
    focusTarget,
    focusComponentEditor,
  }
}
