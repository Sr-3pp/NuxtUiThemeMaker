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
const saveItems = computed(() => [[
  {
    label: 'Save',
    icon: 'i-lucide-save',
    disabled: props.isWorking,
    onSelect: () => emit('save')
  },
  {
    label: 'Save As New',
    icon: 'i-lucide-save-all',
    disabled: props.isWorking,
    onSelect: () => emit('saveAsNew')
  }
]])

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
  <UDashboardPanel
    :ui="{
      root: 'h-screen overflow-auto pt-20',
      body: 'block'
    }"
  >
    <template #header>
      <UDashboardNavbar 
        :title="props.tab === 'export' ? 'Export Palette' : 'Theme Editor'"
        :ui="{
          left: 'justify-between w-full',
        }"
      >
        <template #trailing>
          <UDropdownMenu :items="saveItems">
            <UButton
              type="button"
              color="primary"
              class="bg-[#4cd964] text-black hover:bg-[#65e27c]"
              :loading="props.isWorking"
              trailing-icon="i-lucide-chevron-down"
            >
              <UIcon name="i-lucide-save" class="h-4 w-4" />
              Save
            </UButton>
          </UDropdownMenu>
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
  
        <UAccordion
          :items="sectionGroups"
          type="multiple"
          :default-value="defaultOpenSectionGroups"
          :ui="{
            item: 'mb-4 overflow-hidden rounded-2xl border dark:border-white/10 dark:bg-black/40 shadow-none',
            header: 'flex',
            trigger: 'w-full px-4 py-4 text-sm font-medium dark:text-white hover:bg-white/5 dark:hover:bg-white/5',
            content: 'px-4 pb-4',
            body: 'space-y-4'
          }"
        >
          <template #body="{ item }">
            <div
              v-for="[sectionKey, tokens] in paletteSectionEntries(props.palette.modes[activeMode], item.sections)"
              :key="`${activeMode}-${item.value}-${sectionKey}`"
              class="space-y-3"
            >
              <p class="text-xs font-medium uppercase tracking-[0.16em] dark:text-white/40">
                {{ formatPaletteLabel(sectionKey) }}
              </p>

              <div class="space-y-2">
                <div
                  v-for="tokenKey in paletteTokenKeys(tokens)"
                  :key="`${sectionKey}-${tokenKey}`"
                  class="flex items-center gap-3 rounded-xl border dark:border-white/8 bg-white/3 dark:bg-black/5 px-3 py-2"
                >
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
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm dark:text-white/75">
                      {{ formatPaletteLabel(tokenKey) }}
                    </p>
                    <p class="truncate text-xs dark:text-white/35">
                      {{ getPaletteDisplayValue(tokens, tokenKey) ?? 'Nuxt UI default' }}
                    </p>
                  </div>
                  <UButton
                    type="button"
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-rotate-ccw"
                    class="shrink-0 dark:text-white/60 hover:dark:text-white"
                    aria-label="Reset token to Nuxt UI default"
                    @click.prevent="resetTokenValue(sectionKey, tokenKey)"
                  />
                </div>
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
  </UDashboardPanel>
</template>
