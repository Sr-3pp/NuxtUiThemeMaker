<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import {
  borderTokens,
  colorScaleSteps,
  divideTokens,
  fillTokens,
  outlineTokens,
  radiusTokens,
  ringTokens,
  scaleFamilies,
  semanticColors,
  shadowTokens,
  showcaseTabs,
  statusFamilies,
  strokeTokens,
  surfaceModes,
  textTokens,
  utilityFamilies
} from '~/assets/ts/componets-data'

defineProps<{
  exportPalette: PaletteDefinition
  previewStyle?: Record<string, string>
  previewMode: 'light' | 'dark'
  isUsingDefaultTheme: boolean
}>()

const disableInteractive = ref(false)
const isExportModalOpen = ref(false)

function updateDisableInteractive(value: boolean) {
  disableInteractive.value = value
}

function openExportModal() {
  isExportModalOpen.value = true
}
</script>

<template>
  <div class="space-y-5 rounded-[1.5rem] border border-default/70 bg-default/80 p-4 shadow-sm backdrop-blur-sm md:p-5" :style="previewStyle">
    <ThemeShowcaseHero
      :palette-name="exportPalette.name"
      :preview-mode="previewMode"
      :is-using-default-theme="isUsingDefaultTheme"
      :disable-interactive="disableInteractive"
      @open-export="openExportModal"
      @update:disable-interactive="updateDisableInteractive"
    />

    <ThemeShowcasePaletteExport
      v-model:open="isExportModalOpen"
      :palette="exportPalette"
    />

    <UTabs :items="showcaseTabs" variant="link" color="primary" class="gap-4">
      <template #utilities>
        <ThemeShowcaseUtilities
          :semantic-colors="semanticColors"
          :text-tokens="textTokens"
          :border-tokens="borderTokens"
          :ring-tokens="ringTokens"
          :divide-tokens="divideTokens"
          :outline-tokens="outlineTokens"
          :stroke-tokens="strokeTokens"
          :fill-tokens="fillTokens"
          :radius-tokens="radiusTokens"
          :shadow-tokens="shadowTokens"
          :surface-modes="surfaceModes"
          :disable-interactive="disableInteractive"
        />
      </template>

      <template #components>
        <ThemeShowcaseComponents
          :disable-interactive="disableInteractive"
        />
      </template>

      <template #palette>
        <ThemeShowcasePalette
          :color-scale-steps="colorScaleSteps"
          :scale-families="scaleFamilies"
          :status-families="statusFamilies"
        />
      </template>
    </UTabs>
  </div>
</template>
