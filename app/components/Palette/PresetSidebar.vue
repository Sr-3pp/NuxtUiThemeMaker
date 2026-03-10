<script setup lang="ts">
import { defaultPalette } from '~/utils/paletteRegistry'
import type { PaletteOption } from '~/types/palette'
import type { PalettePresetSidebarEmits, PalettePresetSidebarProps } from '~/types/palette-components'

const props = defineProps<PalettePresetSidebarProps>()

const emit = defineEmits<PalettePresetSidebarEmits>()

const searchModel = computed({
  get: () => props.search,
  set: value => emit('update:search', value)
})

function swatchesFor(option: PaletteOption) {
  const palette = option.type === 'preset' ? option.palette : defaultPalette
  const colorSection = palette.modes.light.color
  const fallback = ['#1f2937', '#334155', '#4ade80', '#facc15', '#ef4444']

  if (!colorSection) {
    return fallback
  }

  return [
    colorSection.primary,
    colorSection.secondary,
    colorSection.success,
    colorSection.warning,
    colorSection.error
  ].map(color => color ?? fallback.shift() ?? '#334155')
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Theme Presets">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UInput
        v-model="searchModel"
        icon="i-lucide-search"
        variant="outline"
        color="neutral"
        placeholder="Search presets..."
        class="[&_input]:border-white/10 [&_input]:bg-white/5 [&_input]:text-white/90 [&_input]:shadow-none [&_input::placeholder]:text-white/35"
      />

      <div class="space-y-2">
        <UButton
          v-for="option in props.options"
          :key="option.id"
          color="neutral"
          variant="ghost"
          block
          class="h-auto rounded-2xl border p-3 text-left transition"
          :class="option.id === props.currentPaletteId
            ? 'border-[#4cd964] bg-[rgba(24,72,25,0.55)] shadow-[inset_0_0_0_1px_rgba(76,217,100,0.28)]'
            : 'border-white/10 bg-black hover:border-white/20 hover:bg-white/5'"
          @click="emit('select', option.id)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 space-y-2">
              <p class="truncate text-sm font-medium text-white">
                {{ option.name }}
              </p>

              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(swatch, index) in swatchesFor(option)"
                  :key="`${option.id}-${index}`"
                  class="h-4 w-4 rounded-md border border-black/40"
                  :style="{ backgroundColor: swatch }"
                />
              </div>
            </div>

            <UIcon
              v-if="option.id === props.currentPaletteId"
              name="i-lucide-check"
              class="mt-0.5 h-4 w-4 shrink-0 text-[#4cd964]"
            />
          </div>
        </UButton>
      </div>
    </template>
  </UDashboardPanel>
</template>
