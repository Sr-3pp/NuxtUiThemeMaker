<script setup lang="ts">
import type { PaletteModeKey } from '~/types/palette'

defineProps<{
  activeMode: PaletteModeKey
}>()
</script>

<template>
  <div class="mb-4 flex flex-col items-center justify-between gap-2 rounded-2xl border bg-white/5 px-4 py-3 dark:border-white/10">
    <p class="w-full text-xs uppercase tracking-[0.16em]">
      Editing <span class="font-bold">{{ activeMode }}</span> mode
    </p>
    <p class="text-xs">
      Use the color mode switch in the header to change preview and editor mode.
    </p>
  </div>
</template>
