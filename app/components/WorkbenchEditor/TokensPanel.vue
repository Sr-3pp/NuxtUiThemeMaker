<script setup lang="ts">
import type { PaletteDefinition, PaletteModeKey } from '~/types/palette'
import type { UpdatePaletteTokenPayload } from '~/types/theme-builder'
import { formatPaletteLabel, normalizePaletteTokenValue } from '~/utils/paletteEditor'

const props = defineProps<{
  activeMode: PaletteModeKey
  palette: PaletteDefinition
  sourcePalette: PaletteDefinition
}>()

const emit = defineEmits<{
  'update-token': [payload: UpdatePaletteTokenPayload]
}>()

const paletteSections = computed(() => {
  const mode = props.palette.modes[props.activeMode]

  return Object.entries(mode).map(([sectionKey, tokens]) => ({
    label: formatPaletteLabel(sectionKey),
    value: sectionKey,
    tokens,
  }))
})

const defaultOpenSectionGroups = ['color']

function updateTokenValue(sectionKey: string, tokenKey: string, value: string | number | undefined) {
  emit('update-token', {
    mode: props.activeMode,
    section: sectionKey,
    token: tokenKey,
    value: normalizePaletteTokenValue(value),
  })
}

function resetTokenValue(sectionKey: string, tokenKey: string) {
  updateTokenValue(
    sectionKey,
    tokenKey,
    props.sourcePalette.modes[props.activeMode]?.[sectionKey]?.[tokenKey] ?? undefined
  )
}

function isColorSection(sectionKey: string) {
  return ['color', 'text', 'bg', 'ui', 'border', 'ring', 'divide', 'outline', 'fill', 'stroke'].includes(sectionKey)
}

function isRadiusSection(sectionKey: string) {
  return sectionKey === 'radius'
}
</script>

<template>
  <UAccordion
    :items="paletteSections"
    type="multiple"
    :default-value="defaultOpenSectionGroups"
    :ui="{
      item: 'mb-4 overflow-hidden rounded-2xl border shadow-none dark:border-white/10 dark:bg-black/40',
      header: 'flex',
      trigger: 'w-full px-4 py-4 text-sm font-medium hover:bg-white/5 dark:hover:bg-white/5',
      content: 'px-4 pb-4',
      body: 'space-y-4'
    }"
  >
    <template #body="{ item }">
      <WorkbenchEditorTokenField
        v-for="(token, tokenKey) in item.tokens"
        :key="`${activeMode}-${item.value}-${tokenKey}`"
        :section-key="item.value"
        :token-key="tokenKey"
        :token-value="token"
        :tokens="item.tokens"
        :is-color-section="isColorSection(item.value)"
        :is-radius-section="isRadiusSection(item.value)"
        @update-value="updateTokenValue(item.value, tokenKey, $event)"
        @reset="resetTokenValue(item.value, tokenKey)"
      />
    </template>
  </UAccordion>
</template>
