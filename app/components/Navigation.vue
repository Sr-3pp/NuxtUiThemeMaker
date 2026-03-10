<script setup lang="ts">
import type { AppNavigationEmits, AppNavigationProps } from '~/types/navigation'

defineProps<AppNavigationProps>()

defineEmits<AppNavigationEmits>()
</script>

<template>
    <header class="border-b border-white/10 bg-black/95 sticky top-0 z-10">
        <div class="flex flex-col gap-4 px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
          <div class="flex min-w-0 items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4cd964] text-black shadow-[0_10px_30px_rgba(76,217,100,0.35)]">
              <UIcon name="i-lucide-palette" class="h-5 w-5" />
            </div>

            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-3 text-sm">
                <p class="font-semibold text-white">
                  Nuxt UI Theme Builder
                </p>
                <span class="hidden text-white/20 md:inline">|</span>
                <p class="text-white/55">
                  Palette:
                  <span class="ml-1 font-medium text-white">{{ currentEditablePalette.name }}</span>
                </p>
                <UBadge :color="currentPalette ? 'primary' : 'neutral'" :variant="currentPalette ? 'soft' : 'outline'">
                  {{ currentPaletteStatus }}
                </UBadge>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <div class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-sun-medium" class="h-4 w-4" />
                <span class="capitalize">{{ currentMode }}</span>
              </div>
            </div>

            <UColorModeSwitch />

            <div class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-hand" class="h-4 w-4" />
                <span>{{ disableInteractivePreviews ? 'Disable component states' : 'Enable component states' }}</span>
              </div>
              <USwitch
                :model-value="disableInteractivePreviews"
                size="sm"
                color="neutral"
                @update:model-value="$emit('toggleInteractivePreviews', $event)"
              />
            </div>

            <UButton color="neutral" variant="ghost" class="text-white/80 hover:text-white" @click="$emit('resetCurrentPalette')">
              <UIcon name="i-lucide-rotate-ccw" class="h-4 w-4" />
              Reset
            </UButton>

            <UButton color="neutral" variant="ghost" class="text-white/80 hover:text-white" @click="$emit('openPaletteImport')">
              <UIcon name="i-lucide-import" class="h-4 w-4" />
              Import
            </UButton>

            <UButton color="neutral" variant="ghost" class="text-white/80 hover:text-white" @click="$emit('openTokensEditor')">
              <UIcon name="i-lucide-sliders-horizontal" class="h-4 w-4" />
              Tokens
            </UButton>

            <UButton color="primary" class="bg-[#4cd964] text-black hover:bg-[#65e27c]" @click="$emit('openExport')">
              <UIcon name="i-lucide-download" class="h-4 w-4" />
              Export
            </UButton>
          </div>
        </div>
      </header>
</template>
