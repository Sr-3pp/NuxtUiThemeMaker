<script setup lang="ts">
import type { PaletteModeKey } from '~/types/palette'
import type {
  WorkbenchEditorEmits,
  WorkbenchEditorProps
} from '~/types/theme-builder'

const props = defineProps<WorkbenchEditorProps>()

const emit = defineEmits<WorkbenchEditorEmits>()

const colorMode = useColorMode()
const editorSection = ref<'colors' | 'semantic' | 'components' | 'states'>('colors')
const editorSections = [
  { label: 'Colors', value: 'colors', slot: 'colors' },
  { label: 'Semantic', value: 'semantic', slot: 'semantic' },
  { label: 'Components', value: 'components', slot: 'components' },
  { label: 'States', value: 'states', slot: 'states' },
]
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
    <UTabs
      v-model="editorSection"
      :items="editorSections"
      color="neutral"
      variant="link"
      :ui="{ root: 'mb-4', list: 'w-full border-b border-default/60' }"
    >
      <template #colors>
        <WorkbenchEditorColorScalesPanel
          :active-mode="activeMode"
          :palette="props.palette"
          @update-color-scale="emit('update-color-scale', $event)"
        />
      </template>

      <template #semantic>
        <WorkbenchEditorTokensPanel
          :active-mode="activeMode"
          :palette="props.palette"
          :source-palette="props.sourcePalette"
          @update-token="emit('update-token', $event)"
        />
      </template>

      <template #components>
        <WorkbenchEditorComponentOverridesPanel
          :palette="props.palette"
          @update-component-token="emit('update-component-token', $event)"
        />
      </template>

      <template #states>
        <WorkbenchEditorComponentOverridesPanel
          mode="states"
          :palette="props.palette"
          @update-component-token="emit('update-component-token', $event)"
        />
      </template>
    </UTabs>
  </template>

  <WorkbenchEditorExportPanel v-else :palette="props.palette" />
</template>
