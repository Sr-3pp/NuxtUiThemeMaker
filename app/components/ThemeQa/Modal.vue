<script setup lang="ts">
import type { EditablePalette } from '~/types/palette-editor'
import type { StoredPaletteQaReport, ThemeQaPanelProps } from '~/types/theme-qa'

const props = defineProps<ThemeQaPanelProps>()

const open = defineModel<boolean>('open', { default: false })
const reportTab = ref<'draft' | 'server'>('draft')
const serverReport = ref<StoredPaletteQaReport | null>(null)
const isLoadingServerReport = ref(false)
const serverReportError = ref<string | null>(null)

const paletteId = computed(() => {
  const palette = props.palette as EditablePalette | null
  return palette?._id ?? null
})

const canLoadServerReport = computed(() => Boolean(paletteId.value))

async function loadServerReport() {
  if (!paletteId.value) {
    serverReport.value = null
    serverReportError.value = null
    isLoadingServerReport.value = false
    return
  }

  isLoadingServerReport.value = true
  serverReportError.value = null

  try {
    serverReport.value = await $fetch<StoredPaletteQaReport>(`/api/palettes/${paletteId.value}/qa`, {
      credentials: 'include',
    })
  } catch (error) {
    serverReport.value = null
    serverReportError.value = error instanceof Error ? error.message : 'Failed to load saved QA report.'
  } finally {
    isLoadingServerReport.value = false
  }
}

watch(open, async (value) => {
  if (!value) {
    reportTab.value = 'draft'
    return
  }

  await loadServerReport()
}, { immediate: false })

watch(paletteId, () => {
  serverReport.value = null
  serverReportError.value = null
  reportTab.value = 'draft'
})
</script>

<template>
  <UModal
    v-model:open="open"
    title="Theme QA Report"
    description="Review accessibility, token integrity, focus visibility, and publish readiness before export or publish."
    :ui="{ content: 'sm:max-w-4xl' }"
  >
    <template #body>
      <div class="space-y-4">
        <div
          v-if="canLoadServerReport"
          class="flex flex-wrap items-center gap-2"
        >
          <UButton
            :color="reportTab === 'draft' ? 'primary' : 'neutral'"
            :variant="reportTab === 'draft' ? 'solid' : 'outline'"
            size="sm"
            @click="reportTab = 'draft'"
          >
            Current draft
          </UButton>

          <UButton
            :color="reportTab === 'server' ? 'primary' : 'neutral'"
            :variant="reportTab === 'server' ? 'solid' : 'outline'"
            size="sm"
            :disabled="!serverReport && !isLoadingServerReport"
            @click="reportTab = 'server'"
          >
            Saved on server
          </UButton>

          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-refresh-cw"
            :loading="isLoadingServerReport"
            @click="loadServerReport()"
          >
            Refresh
          </UButton>
        </div>

        <UAlert
          v-if="serverReportError"
          color="warning"
          variant="soft"
          icon="i-lucide-triangle-alert"
          title="Saved QA unavailable"
          :description="serverReportError"
        />

        <ThemeQaPanel
          v-if="reportTab === 'draft' || !canLoadServerReport"
          :palette="palette"
          source="local"
        />

        <ThemeQaPanel
          v-else
          :palette="palette"
          :report="serverReport?.report ?? null"
          :loading="isLoadingServerReport"
          source="server"
        />
      </div>
    </template>
  </UModal>
</template>
