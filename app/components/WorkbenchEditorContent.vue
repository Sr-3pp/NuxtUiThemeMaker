<script setup lang="ts">
import type { PaletteModeKey } from '~/types/palette'
import type {
  WorkbenchEditorEmits,
  WorkbenchEditorProps
} from '~/types/theme-builder'

const props = defineProps<WorkbenchEditorProps>()

const emit = defineEmits<WorkbenchEditorEmits>()

const colorMode = useColorMode()
const activeMode = computed<PaletteModeKey>(() => {
  if (colorMode.value === 'dark') {
    return 'dark'
  }

  if (colorMode.value === 'light') {
    return 'light'
  }

  return props.defaultMode ?? 'light'
})
</script>

<template>
  <template v-if="props.tab === 'tokens'">
    <WorkbenchEditorModeBanner :active-mode="activeMode" />
    <WorkbenchEditorTokensPanel
      :active-mode="activeMode"
      :palette="props.palette"
      :source-palette="props.sourcePalette"
      @update-token="emit('update-token', $event)"
    />
  </template>

  <WorkbenchEditorExportPanel v-else :palette="props.palette" />
</template>
