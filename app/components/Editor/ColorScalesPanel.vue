<script setup lang="ts">
import type { PaletteColorScale, PaletteDefinition, PaletteModeKey } from '~/types/palette'
import type { UpdatePaletteColorScalePayload } from '~/types/theme-builder'
import { formatPaletteLabel, getPaletteInputValue, getPalettePickerValue, paletteTokenStyle } from '~/utils/paletteEditor'

const props = defineProps<{
  activeMode: PaletteModeKey
  palette: PaletteDefinition
}>()

const emit = defineEmits<{
  'update-color-scale': [payload: UpdatePaletteColorScalePayload]
}>()

const searchQuery = ref('')

const colorScaleEntries = computed(() => Object.entries(props.palette.colors ?? {}))
const filteredColorScaleEntries = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return colorScaleEntries.value
  }

  return colorScaleEntries.value.filter(([colorKey]) => colorKey.toLowerCase().includes(query))
})

function updateScale(colorKey: string, step: string, value: string | number | undefined) {
  const normalized = typeof value === 'string' || typeof value === 'number'
    ? String(value).trim() || null
    : null

  emit('update-color-scale', {
    colorKey,
    step,
    value: normalized,
    syncMode: step === '500' ? props.activeMode : undefined,
  })
}

function asTokenGroup(scale: PaletteColorScale) {
  return scale
}
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-medium dark:text-white">
          Color scales
        </p>
        <p class="text-xs text-muted">
          Edit the global ramps. Updating `500` regenerates the scale and syncs the active mode semantic token.
        </p>
      </div>
    </template>

    <div class="space-y-5">
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="Filter ramps by color token"
      />

      <div
        v-for="[colorKey, scale] in filteredColorScaleEntries"
        :key="colorKey"
        class="space-y-3 rounded-xl border border-default/60 bg-muted/20 p-3"
      >
        <div>
          <p class="text-sm font-medium capitalize">
            {{ formatPaletteLabel(colorKey) }}
          </p>
          <p class="text-xs text-muted">
            `500` regenerates this ramp and updates {{ activeMode }} mode semantic color
          </p>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <div
            v-for="(tokenValue, step) in scale"
            :key="`${colorKey}-${step}`"
            class="rounded-lg border border-default/60 p-3"
          >
            <div class="min-w-0">
              <p class="text-sm font-medium">
                {{ step }}
              </p>
              <p class="text-xs text-muted">
                {{ tokenValue ?? 'Unset' }}
              </p>
            </div>

            <div class="mt-3 flex gap-2">
              <UPopover
                :content="{
                  align: 'start',
                  side: 'bottom',
                  sideOffset: 10
                }"
              >
                <UButton
                  type="button"
                  color="neutral"
                  variant="ghost"
                  class="shrink-0 rounded-xl border bg-white/5 px-2.5 py-2 hover:bg-white/10 dark:border-white/10 dark:bg-black/5 dark:hover:bg-black/10"
                >
                  <span
                    class="h-5 w-5 rounded-md border border-black/40 dark:border-white/40"
                    :style="paletteTokenStyle(tokenValue)"
                  />
                </UButton>

                <template #content>
                  <div class="rounded -lg border border-white/10 bg-black/95 p-3 shadow-2xl backdrop-blur">
                    <UColorPicker
                      :model-value="getPalettePickerValue(asTokenGroup(scale), String(step))"
                      format="hex"
                      size="sm"
                      @update:model-value="updateScale(colorKey, String(step), $event)"
                    />
                  </div>
                </template>
              </UPopover>

              <UInput
                :model-value="getPaletteInputValue(asTokenGroup(scale), String(step))"
                class="flex-1"
                size="sm"
                placeholder="#000000"
                @update:model-value="updateScale(colorKey, String(step), $event)"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="!filteredColorScaleEntries.length"
        class="rounded-xl border border-dashed border-default/60 bg-muted/10 px-4 py-6 text-sm text-muted"
      >
        No color ramps match the current filter.
      </div>
    </div>
  </UCard>
</template>
