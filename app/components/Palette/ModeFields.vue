<script setup lang="ts">
import type { PaletteDefinition, PaletteModeKey, PaletteTokenGroup } from '~/types/palette'
import { getPaletteInputValue, normalizePaletteTokenValue, paletteModeEntries, paletteTokenCount, paletteTokenKeys, paletteTokenStyle, formatPaletteLabel } from '~/utils/paletteEditor'

const props = defineProps<{
  mode: PaletteModeKey
  formState: PaletteDefinition
  placeholder: string
}>()

function sectionEntries() {
  return paletteModeEntries(props.formState.modes[props.mode])
}

function updateTokenValue(tokens: PaletteTokenGroup, tokenKey: string, value: string | number) {
  tokens[tokenKey] = normalizePaletteTokenValue(value)
}
</script>

<template>
  <div class="space-y-4">
    <UAlert
      v-if="sectionEntries().length === 0"
      color="neutral"
      variant="outline"
      :title="`No ${props.mode} mode tokens`"
      :description="`Add sections to the source palette JSON if you want editable ${props.mode} mode tokens here.`"
    />

    <UCard
      v-for="[sectionKey, tokens] in sectionEntries()"
      :key="`${props.mode}-${sectionKey}`"
      variant="outline"
    >
      <template #header>
        <div class="space-y-1">
          <p class="text-sm font-medium capitalize text-highlighted">
            {{ formatPaletteLabel(sectionKey) }}
          </p>
          <p class="text-sm text-muted">
            {{ paletteTokenCount(tokens) }} tokens
          </p>
        </div>
      </template>

      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField
          v-for="tokenKey in paletteTokenKeys(tokens)"
          :key="`${props.mode}-${sectionKey}-${tokenKey}`"
          :label="formatPaletteLabel(tokenKey)"
          :name="`modes.${props.mode}.${sectionKey}.${tokenKey}`"
          required
        >
          <div class="flex items-center gap-3">
            <div
              class="h-10 w-10 shrink-0 rounded-md border border-default bg-default"
              :style="paletteTokenStyle(tokens[tokenKey])"
            />
            <UInput
              :model-value="getPaletteInputValue(tokens, tokenKey)"
              color="primary"
              variant="outline"
              :placeholder="props.placeholder"
              @update:model-value="updateTokenValue(tokens, tokenKey, $event)"
            />
          </div>
        </UFormField>
      </div>
    </UCard>
  </div>
</template>
