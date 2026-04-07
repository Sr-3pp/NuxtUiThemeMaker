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

const colorScaleEntries = computed(() => Object.entries(props.palette.colors ?? {}))

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
  <UCard variant="outline" class="rounded-2xl shadow-none dark:border-white/10 dark:bg-black/40">
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-medium dark:text-white">
          Color scales
        </p>
        <p class="text-xs text-muted">
          Edit the global ramps. Updating `500` syncs the active mode semantic token for the same color.
        </p>
      </div>
    </template>

    <div class="space-y-5">
      <div
        v-for="[colorKey, scale] in colorScaleEntries"
        :key="colorKey"
        class="space-y-3 rounded-xl border border-default/60 bg-muted/20 p-3"
      >
        <div>
          <p class="text-sm font-medium capitalize">
            {{ formatPaletteLabel(colorKey) }}
          </p>
          <p class="text-xs text-muted">
            `500` updates {{ activeMode }} mode semantic color
          </p>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <div
            v-for="(tokenValue, step) in scale"
            :key="`${colorKey}-${step}`"
            class="rounded-lg border border-default/60 p-3"
          >
            <div class="flex items-center gap-3">
              <span
                class="h-8 w-8 rounded-lg border border-black/20 dark:border-white/20"
                :style="paletteTokenStyle(tokenValue)"
              />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium">
                  {{ step }}
                </p>
                <p class="text-xs text-muted">
                  {{ tokenValue ?? 'Unset' }}
                </p>
              </div>
            </div>

            <div class="mt-3 flex gap-2">
              <UColorPicker
                :model-value="getPalettePickerValue(asTokenGroup(scale), String(step))"
                format="hex"
                size="sm"
                @update:model-value="updateScale(colorKey, String(step), $event)"
              />
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
    </div>
  </UCard>
</template>
