<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import {
  exportPaletteAppConfig,
  exportPaletteCss,
  exportPaletteJson,
  exportPaletteTs
} from '~/utils/paletteExport'

const props = defineProps<{
  palette: PaletteDefinition | null
}>()

const open = defineModel<boolean>('open', { default: false })
const selectedExport = ref<'json' | 'appConfig' | 'ts' | 'js' | 'css'>('json')

const exportOptions = [
  { label: 'JSON', value: 'json', description: 'Full palette definition for import/export.' },
  { label: 'app.config.ts', value: 'appConfig', description: 'Nuxt app config wrapper for the theme export.' },
  { label: 'theme.ts', value: 'ts', description: 'TypeScript theme object export.' },
  { label: 'theme.js', value: 'js', description: 'JavaScript theme object export.' },
  { label: 'theme.css', value: 'css', description: 'CSS custom properties for light and dark modes.' },
] as const

function formatPaletteFileName(name: string) {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'palette'
}

function exportCurrentPalette() {
  if (!props.palette || !import.meta.client) {
    return
  }

  const exportValue = exportOptions.find(option => option.value === selectedExport.value)?.value ?? 'json'
  const fileContents = {
    json: exportPaletteJson(props.palette),
    appConfig: exportPaletteAppConfig(props.palette),
    ts: exportPaletteTs(props.palette),
    js: exportPaletteTs(props.palette),
    css: exportPaletteCss(props.palette),
  }[exportValue]
  const fileName = {
    json: `${formatPaletteFileName(props.palette.name)}.json`,
    appConfig: 'app.config.ts',
    ts: 'theme.ts',
    js: 'theme.js',
    css: 'theme.css',
  }[exportValue]
  const mimeType = exportValue === 'json' ? 'application/json' : 'text/plain;charset=utf-8'
  const blob = new Blob([fileContents], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = fileName
  anchor.click()

  URL.revokeObjectURL(url)
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Export palette"
    description="Choose the format you want to download for the current palette."
  >
    <template #body>
      <div class="space-y-4">
        <div class="grid gap-3">
          <button
            v-for="option in exportOptions"
            :key="option.value"
            type="button"
            class="rounded-2xl border px-4 py-3 text-left transition-colors"
            :class="selectedExport === option.value ? 'border-primary bg-primary/10' : 'border-default hover:bg-muted/50'"
            @click="selectedExport = option.value"
          >
            <p class="text-sm font-medium">
              {{ option.label }}
            </p>
            <p class="text-xs text-muted">
              {{ option.description }}
            </p>
          </button>
        </div>

        <UButton
          block
          color="primary"
          :disabled="!props.palette"
          @click="exportCurrentPalette()"
        >
          Download {{ exportOptions.find(option => option.value === selectedExport)?.label }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
