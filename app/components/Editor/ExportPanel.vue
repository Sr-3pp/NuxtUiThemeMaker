<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import type { ExportItemValue } from '~/types/theme-builder'
import {
  exportPaletteAppConfig,
  exportPaletteCss,
  exportPaletteTs,
} from '~/utils/paletteExport'

const props = defineProps<{
  palette: PaletteDefinition
}>()

const selectedExport = ref<ExportItemValue>('css')
const copyState = ref<'idle' | 'copied' | 'error'>('idle')

const exportItems: Array<{ label: string, value: ExportItemValue }> = [
  { label: 'theme.css', value: 'css' },
  { label: 'app.config.ts', value: 'appConfig' },
  { label: 'theme.ts', value: 'ts' },
]

const exportsByType = computed<Record<ExportItemValue, string>>(() => ({
  css: exportPaletteCss(props.palette),
  appConfig: exportPaletteAppConfig(props.palette),
  ts: exportPaletteTs(props.palette),
}))

const activeExport = computed(() => exportsByType.value[selectedExport.value])

async function copyActiveExport() {
  try {
    await navigator.clipboard.writeText(activeExport.value)
    copyState.value = 'copied'
  }
  catch {
    copyState.value = 'error'
  }

  window.setTimeout(() => {
    copyState.value = 'idle'
  }, 2000)
}
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm font-medium dark:text-white">
          Export palette
        </p>
        <USelect
          v-model="selectedExport"
          :items="exportItems"
          color="neutral"
          variant="outline"
          class="min-w-36 [&_button]:border-white/10 [&_button]:bg-white/5 [&_button]:text-white/90 [&_button]:shadow-none"
        />
      </div>
    </template>

    <div class="space-y-3">
      <div class="rounded-xl border border-white/8 bg-black/50 px-3 py-2 text-sm text-white/60">
        {{ palette.name }}
      </div>
      <textarea
        :value="activeExport"
        readonly
        class="min-h-[520px] w-full rounded-xl border border-white/8 bg-black/70 px-4 py-3 font-mono text-xs leading-6 text-white/70 outline-none"
      />
      <UButton type="button" color="primary" class="w-full bg-[#4cd964] text-black hover:bg-[#65e27c]" @click.prevent="copyActiveExport">
        {{ copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy export' }}
      </UButton>
    </div>
  </UCard>
</template>
