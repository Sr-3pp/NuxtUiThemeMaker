<script setup lang="ts">
import type { PaletteComponentThemeSection, PaletteDefinition, PaletteTokenGroup } from '~/types/palette'
import { formatPaletteLabel, paletteTokenStyle } from '~/utils/paletteEditor'

const props = defineProps<{
  palette: PaletteDefinition
}>()

const colorScales = computed(() => Object.entries(props.palette.colors ?? {}))

function getScalePreviewValue(scale: Record<string, string | null>) {
  return scale['500'] ?? scale['400'] ?? scale['600'] ?? null
}

/**
 * Count tokens in a value that can be either a string or token group object
 */
function countTokensInValue(value: string | PaletteTokenGroup | undefined): number {
  if (!value) return 0
  if (typeof value === 'string') return 1
  return Object.keys(value).length
}

function countComponentTokens(section: PaletteComponentThemeSection) {
  const baseCount = countTokensInValue(section.base)
  const slotCount = Object.values(section.slots ?? {}).reduce((count, slotTokens) => 
    count + countTokensInValue(slotTokens), 0)
  const variantCount = Object.values(section.variants ?? {}).reduce((count, variantGroup) => {
    return count + Object.values(variantGroup).reduce((variantTokenCount, tokens) => 
      variantTokenCount + countTokensInValue(tokens), 0)
  }, 0)
  const stateCount = Object.values(section.states ?? {}).reduce((count, stateTokens) => 
    count + countTokensInValue(stateTokens), 0)

  return baseCount + slotCount + variantCount + stateCount
}

const componentEntries = computed(() => Object.entries(props.palette.components ?? {}))
</script>

<template>
  <div class="space-y-4">
    <UCard variant="outline">
      <template #header>
        <div class="space-y-1">
          <p class="text-sm font-medium dark:text-white">
            Color scales
          </p>
          <p class="text-xs text-muted">
            Normalized phase 1 ramps are available globally. The current token editor still controls semantic mode tokens.
          </p>
        </div>
      </template>

      <div v-if="colorScales.length" class="space-y-3">
        <div
          v-for="[colorKey, scale] in colorScales"
          :key="colorKey"
          class="rounded-xl border border-default/60 bg-muted/20 p-3"
        >
          <div class="flex items-center gap-3">
            <span
              class="h-8 w-8 rounded-lg border border-black/20 dark:border-white/20"
              :style="paletteTokenStyle(getScalePreviewValue(scale))"
            />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium capitalize">
                {{ formatPaletteLabel(colorKey) }}
              </p>
              <p class="text-xs text-muted">
                50-950 ramp normalized for export and future editors
              </p>
            </div>
          </div>

          <div class="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-11">
            <div
              v-for="(value, step) in scale"
              :key="`${colorKey}-${step}`"
              class="rounded-lg border border-default/60 p-2 text-center"
            >
              <div
                class="mx-auto mb-1 h-6 w-full rounded-md border border-black/10 dark:border-white/10"
                :style="paletteTokenStyle(value)"
              />
              <p class="text-[10px] font-medium text-muted">
                {{ step }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p v-else class="text-sm text-muted">
        No normalized color scales available yet.
      </p>
    </UCard>

    <UCard variant="outline">
      <template #header>
        <div class="space-y-1">
          <p class="text-sm font-medium dark:text-white">
            Component overrides
          </p>
          <p class="text-xs text-muted">
            The schema now supports per-component theming. Override editors land in the next phase.
          </p>
        </div>
      </template>

      <div v-if="componentEntries.length" class="grid gap-3">
        <div
          v-for="[componentKey, componentSection] in componentEntries"
          :key="componentKey"
          class="rounded-xl border border-default/60 bg-muted/20 p-3"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-sm font-medium capitalize">
                {{ formatPaletteLabel(componentKey) }}
              </p>
              <p class="text-xs text-muted">
                {{ countComponentTokens(componentSection) }} configured tokens
              </p>
            </div>

            <UBadge color="neutral" variant="soft">
              {{ Object.keys(componentSection.variants ?? {}).length }} variants
            </UBadge>
          </div>
        </div>
      </div>

      <p v-else class="text-sm text-muted">
        No component overrides yet. The normalized palette can store them when the editor is expanded.
      </p>
    </UCard>
  </div>
</template>
