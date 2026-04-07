<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import {
  exportPaletteAppConfig,
  exportPaletteBundleTs,
  exportPaletteCss,
  exportPaletteComponentsTs,
  exportPaletteInstallSnippet,
  exportPaletteJson,
  exportPaletteTs
} from '~/utils/paletteExport'

const props = defineProps<{
  palette: PaletteDefinition | null
}>()

const open = defineModel<boolean>('open', { default: false })
const selectedExport = ref<'json' | 'bundle' | 'appConfig' | 'ts' | 'components' | 'snippet' | 'js' | 'css'>('json')
const copyState = ref<'idle' | 'copied' | 'error'>('idle')

const exportOptions = [
  { label: 'JSON', value: 'json', description: 'Full palette definition for import/export.' },
  { label: 'Nuxt bundle', value: 'bundle', description: 'Single self-contained file with theme, components and defineAppConfig.' },
  { label: 'app.config.ts', value: 'appConfig', description: 'Nuxt app config wrapper for the theme export.' },
  { label: 'theme.ts', value: 'ts', description: 'TypeScript theme object export.' },
  { label: 'components.ts', value: 'components', description: 'Only the component override layer for Nuxt UI.' },
  { label: 'Install snippet', value: 'snippet', description: 'Copy-paste Nuxt setup snippet for quick installation.' },
  { label: 'theme.js', value: 'js', description: 'JavaScript theme object export.' },
  { label: 'theme.css', value: 'css', description: 'CSS custom properties for light and dark modes.' },
] as const

const exportsByType = computed(() => {
  if (!props.palette) {
    return {
      json: '',
      bundle: '',
      appConfig: '',
      ts: '',
      components: '',
      snippet: '',
      js: '',
      css: '',
    }
  }

  return {
    json: exportPaletteJson(props.palette),
    bundle: exportPaletteBundleTs(props.palette),
    appConfig: exportPaletteAppConfig(props.palette),
    ts: exportPaletteTs(props.palette),
    components: exportPaletteComponentsTs(props.palette),
    snippet: exportPaletteInstallSnippet(props.palette),
    js: exportPaletteTs(props.palette),
    css: exportPaletteCss(props.palette),
  }
})

const activeExport = computed(() => {
  return exportsByType.value[selectedExport.value]
})

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
  const fileContents = activeExport.value
  const fileName = {
    json: `${formatPaletteFileName(props.palette.name)}.json`,
    bundle: 'nuxt-ui-theme.bundle.ts',
    appConfig: 'app.config.ts',
    ts: 'theme.ts',
    components: 'components.ts',
    snippet: 'install-snippet.ts',
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

async function copyCurrentExport() {
  if (!activeExport.value || !import.meta.client) {
    return
  }

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

        <div class="rounded-xl border border-white/8 bg-black/80 p-3">
          <p class="mb-2 text-xs uppercase tracking-[0.18em] text-white/40">
            Preview
          </p>
          <textarea
            :value="activeExport"
            readonly
            class="min-h-[280px] w-full rounded-xl border border-white/8 bg-black/70 px-4 py-3 font-mono text-xs leading-6 text-white/70 outline-none"
          />
        </div>

        <UButton
          block
          color="neutral"
          variant="outline"
          :disabled="!props.palette"
          @click="copyCurrentExport()"
        >
          {{ copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy export' }}
        </UButton>

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
