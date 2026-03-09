<script setup lang="ts">
import {
  alertVariants,
  accordionItems,
  borderTokens,
  buttonColors,
  buttonVariants,
  checkboxItems,
  colorScaleSteps,
  componentMatrix,
  componentTabs,
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
  utilityFamilies,
  cardVariants,
  radioItems,
  selectItems
} from '~/assets/ts/componets-data'

const disableInteractive = ref(false)

function updateDisableInteractive(value: boolean) {
  disableInteractive.value = value
}
</script>

<template>
  <div class="space-y-8">
    <ThemeShowcaseHero
      :semantic-colors="semanticColors"
      :utility-families="utilityFamilies"
      :disable-interactive="disableInteractive"
      @update:disable-interactive="updateDisableInteractive"
    />

    <UTabs :items="showcaseTabs" variant="link" color="primary">
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
          :component-matrix="componentMatrix"
          :component-tabs="componentTabs"
          :button-colors="buttonColors"
          :button-variants="buttonVariants"
          :alert-variants="alertVariants"
          :card-variants="cardVariants"
          :accordion-items="accordionItems"
          :select-items="selectItems"
          :radio-items="radioItems"
          :checkbox-items="checkboxItems"
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
