<script setup lang="ts">
import type { PaletteModeKey } from '~/types/palette'
import type {
  EditorEmits,
  EditorProps
} from '~/types/theme-builder'

const props = defineProps<EditorProps>()

const emit = defineEmits<EditorEmits>()

const colorMode = useColorMode()
const editorSection = ref<'colors' | 'semantic' | 'components' | 'states' | 'ai-ui'>('colors')
const editorSections = [
  { label: 'Colors', value: 'colors', slot: 'colors' },
  { label: 'Semantic', value: 'semantic', slot: 'semantic' },
  { label: 'Components', value: 'components', slot: 'components' },
  { label: 'States', value: 'states', slot: 'states' }
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
    <EditorModeBanner :active-mode="activeMode" />
    <UTabs
      v-model="editorSection"
      class="mb-4"
      :items="editorSections"
      color="neutral"
      variant="link"
    >
      <template #colors>
        <EditorColorScalesPanel
          :active-mode="activeMode"
          :palette="props.palette"
          @update-color-scale="emit('update-color-scale', $event)"
        />
      </template>

      <template #semantic>
        <EditorTokensPanel
          :active-mode="activeMode"
          :palette="props.palette"
          :source-palette="props.sourcePalette"
          @update-token="emit('update-token', $event)"
        />
      </template>

      <template #components>
        <EditorComponentOverridesPanel
          :palette="props.palette"
          @update-component-token="emit('update-component-token', $event)"
        />
      </template>

      <template #states>
        <EditorComponentOverridesPanel
          mode="states"
          :palette="props.palette"
          @update-component-token="emit('update-component-token', $event)"
        />
      </template>
    </UTabs>
  </template>

  <EditorExportPanel v-else :palette="props.palette" />
</template>
