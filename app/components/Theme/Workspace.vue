<script setup lang="ts">
import type { StoredPalette } from '~/types/palette-store'
import type { PaletteDefinition, PaletteModeKey, PaletteOption } from '~/types/palette'
import type { EditorTab, UpdatePaletteTokenPayload } from '~/types/theme-builder'

const props = withDefaults(defineProps<{
  activeOwnedPaletteId: string | null
  currentPaletteId: string
  defaultMode?: PaletteModeKey
  disableInteractive?: boolean
  isAuthenticated: boolean
  isWorking?: boolean
  options: readonly PaletteOption[]
  ownedPalettes: StoredPalette[]
  palette: PaletteDefinition | null
  search: string
  sourcePalette: PaletteDefinition
  tab: EditorTab
  editablePalette: PaletteDefinition
}>(), {
  defaultMode: 'light',
  disableInteractive: false,
  isWorking: false,
})

const emit = defineEmits<{
  save: []
  saveAsNew: []
  select: [id: string]
  selectOwnedPalette: [id: string]
  'update:search': [value: string]
  'update:tab': [value: EditorTab]
  'update-token': [payload: UpdatePaletteTokenPayload]
}>()

const mobileItems = [
  { label: 'Preview', value: 'preview', icon: 'i-lucide-eye' },
  { label: 'Presets', value: 'presets', icon: 'i-lucide-swatch-book' },
  { label: 'Theme Editor', value: 'editor', icon: 'i-lucide-sliders-horizontal' }
]

const searchModel = computed({
  get: () => props.search,
  set: value => emit('update:search', value)
})

const tabModel = computed({
  get: () => props.tab,
  set: value => emit('update:tab', value)
})

const isMobile = ref(false)
let mediaQuery: MediaQueryList | null = null

function syncLayout(event?: MediaQueryList | MediaQueryListEvent) {
  isMobile.value = event ? event.matches : mediaQuery?.matches ?? false
}

onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 1023px)')
  syncLayout()
  mediaQuery.addEventListener('change', syncLayout)
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', syncLayout)
})
</script>

<template>
  <div v-if="isMobile" class="min-h-[calc(100vh-130px)] px-4 pb-6 pt-24">
    <UAccordion
      :items="mobileItems"
      type="single"
      collapsible
      default-value="preview"
      :ui="{
        root: 'space-y-3',
        item: 'overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-none',
        header: 'flex',
        trigger: 'w-full px-4 py-3 text-sm font-semibold text-white',
        leadingIcon: 'size-4 text-white/65',
        trailingIcon: 'size-4 text-white/65',
        content: 'px-0 pb-0',
        body: 'px-0 pb-0'
      }"
    >
      <template #body="{ item }">
        <div v-if="item.value === 'preview'" class="overflow-hidden">
          <ThemePreviewContent
            :palette="props.palette"
            :disable-interactive="props.disableInteractive"
            container-class="px-4 pb-4 pt-2"
          />
        </div>

        <div v-else-if="item.value === 'presets'" class="px-4 pb-4 pt-2">
          <PalettePresetSidebarContent
            v-model:search="searchModel"
            :active-owned-palette-id="props.activeOwnedPaletteId"
            :options="props.options"
            :current-palette-id="props.currentPaletteId"
            :is-authenticated="props.isAuthenticated"
            :owned-palettes="props.ownedPalettes"
            @select="emit('select', $event)"
            @select-owned-palette="emit('selectOwnedPalette', $event)"
          />
        </div>

        <div v-else class="px-4 pb-4 pt-2">
          <div class="mb-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <ThemeWorkbenchEditorToolbar
              :tab="tabModel"
              :is-working="props.isWorking"
              @save="emit('save')"
              @save-as-new="emit('saveAsNew')"
            />
          </div>

          <ThemeWorkbenchEditorContent
            v-model:tab="tabModel"
            :palette="props.editablePalette"
            :source-palette="props.sourcePalette"
            :is-working="props.isWorking"
            :default-mode="props.defaultMode"
            @save="emit('save')"
            @save-as-new="emit('saveAsNew')"
            @update-token="emit('update-token', $event)"
          />
        </div>
      </template>
    </UAccordion>
  </div>

  <UDashboardGroup v-else class="grid min-h-[calc(100vh-130px)] xl:grid-cols-[280px_minmax(0,1fr)_380px]">
    <PalettePresetSidebar
      v-model:search="searchModel"
      :active-owned-palette-id="props.activeOwnedPaletteId"
      :options="props.options"
      :current-palette-id="props.currentPaletteId"
      :is-authenticated="props.isAuthenticated"
      :owned-palettes="props.ownedPalettes"
      @select="emit('select', $event)"
      @select-owned-palette="emit('selectOwnedPalette', $event)"
    />

    <ThemePreviewPanel :palette="props.palette" :disable-interactive="props.disableInteractive" />

    <ThemeWorkbenchEditor
      v-model:tab="tabModel"
      :palette="props.editablePalette"
      :source-palette="props.sourcePalette"
      :is-working="props.isWorking"
      :default-mode="props.defaultMode"
      @save="emit('save')"
      @save-as-new="emit('saveAsNew')"
      @update-token="emit('update-token', $event)"
    />
  </UDashboardGroup>
</template>
