<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import {
  exportPaletteAppConfig,
  exportPaletteCss,
  exportPaletteTs
} from '~/utils/paletteExport'

const props = defineProps<{
  open: boolean
  palette: PaletteDefinition
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
})

type ExportItemValue = 'css' | 'appConfig' | 'ts'

const exportItems: Array<{ label: string, value: ExportItemValue }> = [
  { label: 'theme.css', value: 'css' },
  { label: 'app.config.ts', value: 'appConfig' },
  { label: 'theme.ts', value: 'ts' }
]

const selectedExport = ref<ExportItemValue>('css')
const copyState = ref<'idle' | 'copied' | 'error'>('idle')

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
  <UModal
    v-model:open="isOpen"
    title="Export palette"
    :description="`Generate export files for ${props.palette.name}.`"
  >
    <template #body>
      <div class="space-y-4 p-1">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge color="neutral" variant="outline">
              {{ props.palette.name }}
            </UBadge>
            <UBadge color="primary" variant="soft">
              {{ exportItems.find(item => item.value === selectedExport)?.label }}
            </UBadge>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <USelect
              v-model="selectedExport"
              :items="exportItems"
              class="min-w-44"
            />
            <UButton color="primary" variant="soft" @click="copyActiveExport">
              {{ copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy export' }}
            </UButton>
          </div>
        </div>

        <textarea
          :value="activeExport"
          readonly
          class="min-h-96 w-full rounded-lg border border-default bg-elevated px-4 py-3 font-mono text-xs leading-6 text-toned outline-none"
        />
      </div>
    </template>
  </UModal>
</template>
