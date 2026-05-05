<script setup lang="ts">
import type { PaletteDefinition, PaletteModeKey, PaletteTokenGroup, PaletteTokenValue } from '~/types/palette'
import type { UpdatePaletteTokenPayload } from '~/types/theme-builder'
import { formatPaletteLabel, normalizePaletteTokenValue } from '~/utils/paletteEditor'

interface PaletteSectionItem {
  label: string
  value: string
  tokens: PaletteTokenGroup
}

const props = defineProps<{
  activeMode: PaletteModeKey
  palette: PaletteDefinition
  sourcePalette: PaletteDefinition
}>()

const emit = defineEmits<{
  'update-token': [payload: UpdatePaletteTokenPayload]
}>()

const searchQuery = ref('')

const paletteSections = computed<PaletteSectionItem[]>(() => {
  const mode = props.palette.modes[props.activeMode]
  const query = searchQuery.value.trim().toLowerCase()

  return Object.entries(mode)
    .reduce<PaletteSectionItem[]>((sections, [sectionKey, tokens]) => {
      if (!query) {
        sections.push({
          label: formatPaletteLabel(sectionKey),
          value: sectionKey,
          tokens,
        })

        return sections
      }

      const filteredTokens = Object.fromEntries(
        Object.entries(tokens).filter(([tokenKey]) => {
          return sectionKey.toLowerCase().includes(query) || tokenKey.toLowerCase().includes(query)
        })
      ) as PaletteTokenGroup

      if (!Object.keys(filteredTokens).length) {
        return sections
      }

      sections.push({
        label: formatPaletteLabel(sectionKey),
        value: sectionKey,
        tokens: filteredTokens,
      })

      return sections
    }, [])
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

function getTokenEntries(tokens: PaletteTokenGroup) {
  return Object.entries(tokens) as [string, PaletteTokenValue][]
}
</script>

<template>
  <div class="space-y-4">
    <UInput
      v-model="searchQuery"
      icon="i-lucide-search"
      placeholder="Filter semantic tokens by section or token name"
    />

    <UAccordion
      :items="paletteSections"
      type="multiple"
      :default-value="defaultOpenSectionGroups"
      :ui="{
        item: 'mb-4 overflow-hidden rounded -lg border shadow-none dark:border-white/10 dark:bg-black/40',
        header: 'flex',
        trigger: 'w-full px-4 py-4 text-sm font-medium hover:bg-white/5 dark:hover:bg-white/5',
        content: 'px-4 pb-4',
        body: 'space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4',
      }"
    >
      <template #body="{ item }">
        <EditorTokenField
          v-for="[tokenKey, token] in getTokenEntries(item.tokens)"
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

    <div
      v-if="!paletteSections.length"
      class="rounded-xl border border-dashed border-default/60 bg-muted/10 px-4 py-6 text-sm text-muted"
    >
      No semantic tokens match the current filter.
    </div>
  </div>
</template>
