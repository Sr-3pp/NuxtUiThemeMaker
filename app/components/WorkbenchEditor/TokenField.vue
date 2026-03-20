<script setup lang="ts">
import type { PaletteTokenGroup, PaletteTokenValue } from '~/types/palette'
import {
  formatRadiusSliderValue,
  formatPaletteLabel,
  getPaletteInputValue,
  getPalettePickerValue,
  getRadiusSliderValue,
  paletteTokenStyle,
} from '~/utils/paletteEditor'

const props = defineProps<{
  sectionKey: string
  tokenKey: string
  tokenValue: PaletteTokenValue
  tokens: PaletteTokenGroup
  isColorSection: boolean
  isRadiusSection: boolean
}>()

const emit = defineEmits<{
  'update-value': [value: string | number | undefined]
  reset: []
}>()
</script>

<template>
  <div class="space-y-3">
    <div class="flex gap-2 space-y-2">
      <UPopover
        v-if="isColorSection"
        :content="{
          align: 'end',
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
          <div class="rounded-2xl border border-white/10 bg-black/95 p-3 shadow-2xl backdrop-blur">
            <UColorPicker
              :model-value="getPalettePickerValue(tokens, tokenKey)"
              format="hex"
              size="sm"
              @update:model-value="emit('update-value', $event)"
            />
          </div>
        </template>
      </UPopover>

      <div
        v-else
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-white/5 text-xs uppercase text-muted dark:border-white/10 dark:bg-black/5"
      >
        {{ formatPaletteLabel(tokenKey).slice(0, 2) }}
      </div>

      <div class="min-w-0 flex-1">
        <p class="truncate text-sm capitalize">
          {{ formatPaletteLabel(tokenKey) }}
        </p>
        <p class="truncate text-xs text-muted">
          {{ tokenValue }}
        </p>

        <UInput
          v-if="!isRadiusSection"
          :model-value="getPaletteInputValue(tokens, tokenKey)"
          class="mt-2"
          size="sm"
          :placeholder="isColorSection ? '#000000' : '0.5rem'"
          @update:model-value="emit('update-value', $event)"
        />

        <div v-else class="mt-2 space-y-2">
          <USlider
            :model-value="getRadiusSliderValue(tokens, tokenKey)"
            :min="0"
            :max="32"
            :step="1"
            color="primary"
            @update:model-value="emit('update-value', formatRadiusSliderValue(Array.isArray($event) ? $event[0] ?? 0 : $event ?? 0))"
          />
          <div class="flex items-center justify-between text-xs text-muted">
            <span>0rem</span>
            <span>{{ getPaletteInputValue(tokens, tokenKey) || '0rem' }}</span>
            <span>2rem</span>
          </div>
        </div>
      </div>

      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        icon="i-lucide-rotate-ccw"
        class="shrink-0 hover:dark:text-white dark:text-white/60"
        aria-label="Reset token to Nuxt UI default"
        @click.prevent="emit('reset')"
      />
    </div>
  </div>
</template>
