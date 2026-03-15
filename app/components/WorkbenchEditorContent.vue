<script setup lang="ts">
import type { PaletteModeKey } from '~/types/palette'
import type {
  ExportItemValue,
  WorkbenchEditorEmits,
  WorkbenchEditorProps
} from '~/types/theme-builder'
import {
  exportPaletteAppConfig,
  exportPaletteCss,
  exportPaletteTs
} from '~/utils/paletteExport'
import {
  formatPaletteLabel,
  getPalettePickerValue,
  normalizePaletteTokenValue,
  paletteTokenStyle
} from '~/utils/paletteEditor'

const props = defineProps<WorkbenchEditorProps>()

const emit = defineEmits<WorkbenchEditorEmits>()

const colorMode = useColorMode()
const activeMode = computed<PaletteModeKey>(() => {
  if (colorMode.value === 'dark') {
    return 'dark'
  }

  if (colorMode.value === 'light') {
    return 'light'
  }

  return props.defaultMode ?? 'light'
})
const selectedExport = ref<ExportItemValue>('css')
const copyState = ref<'idle' | 'copied' | 'error'>('idle')

const exportItems: Array<{ label: string, value: ExportItemValue }> = [
  { label: 'theme.css', value: 'css' },
  { label: 'app.config.ts', value: 'appConfig' },
  { label: 'theme.ts', value: 'ts' }
]

const sectionGroups = [
  { label: 'Brand Colors', value: 'brand-colors', sections: ['color'] },
  { label: 'Semantic Colors', value: 'semantic-colors', sections: ['ui'] },
  { label: 'Background & Surface', value: 'background-surface', sections: ['bg', 'text'] },
  { label: 'Muted & Border', value: 'muted-border', sections: ['border', 'ring', 'divide', 'outline', 'fill', 'stroke'] }
]

const paletteSections = computed(() => {
  if (!props.palette) {
    return []
  }

  const mode = props.palette.modes[activeMode.value]

  if (!mode) {
    return []
  }

  return Object.entries(props.palette.modes[activeMode.value]).map(([sectionKey, tokens]) => ({
    label: formatPaletteLabel(sectionKey),
    value: sectionKey,
    tokens
  }))
})

const defaultOpenSectionGroups = [sectionGroups[0]?.value ?? 'brand-colors']

const exportsByType = computed<Record<ExportItemValue, string>>(() => ({
  css: exportPaletteCss(props.palette),
  appConfig: exportPaletteAppConfig(props.palette),
  ts: exportPaletteTs(props.palette),
}))

const activeExport = computed(() => exportsByType.value[selectedExport.value])

function updateTokenValue(sectionKey: string, tokenKey: string, value: string | number | undefined) {
  emit('update-token', {
    mode: activeMode.value,
    section: sectionKey,
    token: tokenKey,
    value: normalizePaletteTokenValue(value)
  })
}

function resetTokenValue(sectionKey: string, tokenKey: string) {
  updateTokenValue(
    sectionKey,
    tokenKey,
    props.sourcePalette.modes[activeMode.value]?.[sectionKey]?.[tokenKey] ?? undefined
  )
}

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
  <template v-if="props.tab === 'tokens'">
    <div class="mb-4 flex flex-col items-center justify-between rounded-2xl border bg-white/5 px-4 py-3 gap-2 dark:border-white/10">
      <p class="text-xs uppercase tracking-[0.16em] w-full">
        Editing <span class="font-bold">{{ activeMode }}</span> mode
      </p>
      <p class="text-xs">
        Use the color mode switch in the header to change preview and editor mode.
      </p>
    </div>

    <UAccordion
      :items="paletteSections"
      type="multiple"
      :default-value="defaultOpenSectionGroups"
      :ui="{
        item: 'mb-4 overflow-hidden rounded-2xl border dark:border-white/10 dark:bg-black/40 shadow-none',
        header: 'flex',
        trigger: 'w-full px-4 py-4 text-sm font-medium hover:bg-white/5 dark:hover:bg-white/5',
        content: 'px-4 pb-4',
        body: 'space-y-4'
      }"
    >
      <template #body="{ item }">
        <div
          v-for="(token, sectionKey) in item.tokens"
          :key="`${activeMode}-${item.value}-${sectionKey}`"
          class="space-y-3"
        >
          <div class="space-y-2 flex gap-2">
            <UPopover
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
                  class="shrink-0 rounded-xl border dark:border-white/10 bg-white/5 dark:bg-black/5 px-2.5 py-2 hover:bg-white/10 dark:hover:bg-black/10"
                >
                  <span
                    class="h-5 w-5 rounded-md border border-black/40 dark:border-white/40 "
                    :style="paletteTokenStyle(token)"
                  />
                </UButton>

                <template #content>
                  <div class="rounded-2xl border border-white/10 bg-black/95 p-3 shadow-2xl backdrop-blur">
                    <UColorPicker
                      :model-value="getPalettePickerValue(item.tokens, sectionKey)"
                      format="hex"
                      size="sm"
                      @update:model-value="updateTokenValue(item.value, sectionKey, $event)"
                    />
                  </div>
                </template>
              </UPopover>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm capitalize">
                  {{ formatPaletteLabel(sectionKey) }}
                </p>
                <p class="truncate text-xs text-muted">
                  {{ token }}
                </p>
              </div>
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                icon="i-lucide-rotate-ccw"
                class="shrink-0 dark:text-white/60 hover:dark:text-white"
                aria-label="Reset token to Nuxt UI default"
                @click.prevent="resetTokenValue(sectionKey, token as string)"
              />
          </div>
        </div>
      </template>
    </UAccordion>
  </template>

  <UCard v-else variant="outline" class="rounded-2xl dark:border-white/10 dark:bg-black/40 shadow-none">
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
        {{ props.palette.name }}
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
