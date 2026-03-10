<script setup lang="ts">
import type { PaletteModeKey } from '~/types/palette'
import type {
  ExportItemValue,
  ThemeWorkbenchEditorEmits,
  ThemeWorkbenchEditorProps
} from '~/types/theme-builder'
import {
  exportPaletteAppConfig,
  exportPaletteCss,
  exportPaletteTs
} from '~/utils/paletteExport'
import {
  formatPaletteLabel,
  getPaletteDisplayValue,
  getPalettePickerValue,
  normalizePaletteTokenValue,
  paletteSectionEntries,
  paletteTokenKeys,
  paletteTokenStyle
} from '~/utils/paletteEditor'

const props = defineProps<ThemeWorkbenchEditorProps>()

const emit = defineEmits<ThemeWorkbenchEditorEmits>()

const activeMode = computed<PaletteModeKey>(() => props.defaultMode ?? 'light')
const selectedExport = ref<ExportItemValue>('css')
const copyState = ref<'idle' | 'copied' | 'error'>('idle')

const exportItems: Array<{ label: string, value: ExportItemValue }> = [
  { label: 'theme.css', value: 'css' },
  { label: 'app.config.ts', value: 'appConfig' },
  { label: 'theme.ts', value: 'ts' }
]

const sectionGroups = [
  { label: 'Brand Colors', sections: ['color'] },
  { label: 'Semantic Colors', sections: ['ui'] },
  { label: 'Background & Surface', sections: ['bg', 'text'] },
  { label: 'Muted & Border', sections: ['border', 'ring', 'divide', 'outline', 'fill', 'stroke'] }
] as const

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
  <UDashboardPanel
    :ui="{
      root: 'max-h-screen overflow-auto',
      body: 'block'
    }"
  >
    <template #header>
      <UDashboardNavbar :title="props.tab === 'export' ? 'Export Palette' : 'Theme Editor'">
        <template #trailing>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <template v-if="props.tab === 'tokens'">
        <div class="mb-4 flex flex-col items-center justify-between rounded-2xl border dark:border-white/10 bg-white/5 px-4 py-3 gap-2">
          <p class="text-xs uppercase tracking-[0.16em] w-full">
            Editing <span class="font-bold">{{ activeMode }}</span> mode
          </p>
          <p class="text-xs">
            Use the color mode switch in the header to change preview and editor mode.
          </p>
        </div>
  
        <UCard
          v-for="group in sectionGroups"
          :key="group.label"
          variant="outline"
          class="rounded-2xl border-white/10 bg-black/40 shadow-none overflow-auto mb-4"
        >
          <template #header>
            <p class="text-sm font-medium text-white">
              {{ group.label }}
            </p>
          </template>

          <div class="space-y-4">
            <div
              v-for="[sectionKey, tokens] in paletteSectionEntries(props.palette.modes[activeMode], group.sections)"
              :key="`${activeMode}-${group.label}-${sectionKey}`"
              class="space-y-3"
            >
              <p class="text-xs font-medium uppercase tracking-[0.16em] text-white/40">
                {{ formatPaletteLabel(sectionKey) }}
              </p>

              <div class="space-y-2">
                <div
                  v-for="tokenKey in paletteTokenKeys(tokens)"
                  :key="`${sectionKey}-${tokenKey}`"
                  class="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-3 py-2"
                >
                  <div
                    class="h-7 w-7 shrink-0 rounded-lg border border-black/50"
                    :style="paletteTokenStyle(tokens[tokenKey])"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm text-white/75">
                      {{ formatPaletteLabel(tokenKey) }}
                    </p>
                    <p class="truncate text-xs text-white/35">
                      {{ getPaletteDisplayValue(tokens, tokenKey) ?? 'Nuxt UI default' }}
                    </p>
                  </div>
                  <UPopover
                    :content="{
                      align: 'end',
                      side: 'bottom',
                      sideOffset: 10
                    }"
                  >
                    <UButton
                      color="neutral"
                      variant="ghost"
                      class="shrink-0 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 hover:bg-white/10"
                    >
                      <span
                        class="h-5 w-5 rounded-md border border-black/40"
                        :style="paletteTokenStyle(tokens[tokenKey])"
                      />
                    </UButton>

                    <template #content>
                      <div class="rounded-2xl border border-white/10 bg-black/95 p-3 shadow-2xl backdrop-blur">
                        <UColorPicker
                          :model-value="getPalettePickerValue(tokens, tokenKey)"
                          format="hex"
                          size="sm"
                          @update:model-value="updateTokenValue(sectionKey, tokenKey, $event)"
                        />
                      </div>
                    </template>
                  </UPopover>
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-rotate-ccw"
                    class="shrink-0 text-white/60 hover:text-white"
                    aria-label="Reset token to Nuxt UI default"
                    @click="updateTokenValue(sectionKey, tokenKey, undefined)"
                  />
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </template>

      <UCard v-else variant="outline" class="rounded-2xl border-white/10 bg-black/40 shadow-none">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-medium text-white">
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
          <UButton color="primary" class="w-full bg-[#4cd964] text-black hover:bg-[#65e27c]" @click="copyActiveExport">
            {{ copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy export' }}
          </UButton>
        </div>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
