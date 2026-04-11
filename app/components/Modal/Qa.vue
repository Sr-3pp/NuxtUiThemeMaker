<script setup lang="ts">
import { clonePaletteDefinition } from '~/utils/palette-domain'
import { auditPaletteTheme } from '~/utils/palette-qa'
import { emptyPalette } from '~/utils/paletteRegistry'
import type { EditablePalette } from '~/types/palette-editor'
import type { StoredPaletteQaReport, ThemeQaPanelProps } from '~/types/theme-qa'

const props = defineProps<ThemeQaPanelProps>()
const { isOpen: open} = useModal('qa-modal')
const toast = useToast()
const { showErrorToast } = useErrorToast()
const { generatePaletteAudit } = usePaletteApi()
const { applyGeneratedPalette } = usePaletteState()
const access = usePaletteGenerationAccess()
const reportTab = ref<'draft' | 'server'>('draft')
const serverReport = ref<StoredPaletteQaReport | null>(null)
const isLoadingServerReport = ref(false)
const serverReportError = ref<string | null>(null)
const isAuditLoading = ref(false)

const paletteId = computed(() => {
  const palette = props.palette as EditablePalette | null
  return palette?._id ?? null
})

const canLoadServerReport = computed(() => Boolean(paletteId.value))
const isDraftReportTab = computed(() => reportTab.value === 'draft' || !canLoadServerReport.value)
const activePanelProps = computed(() => {
  if (isDraftReportTab.value) {
    return {
      report: null,
      source: 'local' as const,
      loading: false,
      showRepairAction: props.showRepairAction,
      repairLoading: isAuditLoading.value,
    }
  }

  return {
    report: serverReport.value?.report ?? null,
    source: 'server' as const,
    loading: isLoadingServerReport.value,
    showRepairAction: false,
    repairLoading: false,
  }
})
const defaultPaletteSignature = JSON.stringify(clonePaletteDefinition(emptyPalette))
const draftReport = computed(() => props.palette ? auditPaletteTheme(props.palette) : null)
const isDefaultAuditPalette = computed(() => {
  if (!props.palette) {
    return false
  }

  return JSON.stringify(clonePaletteDefinition(props.palette)) === defaultPaletteSignature
})
const canGenerateRepair = computed(() => {
  return reportTab.value === 'draft'
    && props.showRepairAction
    && !access.isDisabled.value
    && !isDefaultAuditPalette.value
    && Boolean(draftReport.value?.issues.length)
})

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

async function handleRepair() {
  if (!props.palette || !canGenerateRepair.value || isAuditLoading.value) {
    return
  }

  isAuditLoading.value = true

  try {
    const auditResult = await generatePaletteAudit({
      palette: clonePaletteDefinition(props.palette),
    })
    applyGeneratedPalette(auditResult.patchedPalette)
    toast.add({
      title: 'Palette updated',
      description: 'Applied the generated audit repair to the current draft.',
      color: 'success',
    })
  } catch (error) {
    showErrorToast(error, 'Failed to generate the audit repair.')
    await access.refresh()
  } finally {
    isAuditLoading.value = false
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
          :palette="palette"
          :report="activePanelProps.report"
          :loading="activePanelProps.loading"
          :show-repair-action="activePanelProps.showRepairAction"
          :repair-loading="activePanelProps.repairLoading"
          :source="activePanelProps.source"
          @repair="handleRepair()"
        />
      </div>
    </template>
  </UModal>
</template>
