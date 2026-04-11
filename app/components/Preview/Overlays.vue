<script setup lang="ts">
import type { PreviewInteractiveProps } from '~/types/theme-preview'
import { getPreviewButtonStyle, getPreviewInputStyle } from '~/utils/preview-overrides'

const props = defineProps<PreviewInteractiveProps>()

const isModalOpen = ref(false)
const isDrawerOpen = ref(false)

const dropdownItems = [
  [
    { label: 'Open palette editor', icon: 'i-lucide-sliders-horizontal', kbds: ['cmd', 'e'] },
    { label: 'Duplicate preset', icon: 'i-lucide-copy' }
  ],
  [
    { label: 'Danger zone', type: 'label' },
    { label: 'Reset overrides', icon: 'i-lucide-rotate-ccw', color: 'error' }
  ]
]

const inputStyle = computed(() => getPreviewInputStyle(props.palette))

function buttonStyle(variant: string, color: string) {
  return getPreviewButtonStyle(props.palette, variant, color)
}
</script>

<template>
  <section class="space-y-4">
    <div class="space-y-1">
      <h3 class="text-lg font-semibold text-highlighted">
        Overlays and popups
      </h3>
      <p class="text-sm text-muted">
        Real overlay components with minimal local state for menu, popover, modal and drawer inspection.
      </p>
    </div>

    <UCard variant="outline">
      <template #header>
        <p class="text-sm font-medium text-highlighted">Interactive examples</p>
      </template>

      <div class="flex flex-wrap items-center gap-3">
        <UDropdownMenu :items="dropdownItems" :disabled="props.disableInteractive">
          <UButton color="neutral" variant="outline" trailing-icon="i-lucide-chevron-down" :style="buttonStyle('outline', 'neutral')">
            Dropdown menu
          </UButton>
        </UDropdownMenu>

        <UPopover>
          <UButton color="info" variant="soft" icon="i-lucide-panel-top-open" :disabled="props.disableInteractive" :style="buttonStyle('soft', 'info')">
            Popover
          </UButton>

          <template #content>
            <div class="max-w-xs space-y-2 p-1">
              <p class="text-sm font-medium text-highlighted">Popover preview</p>
              <p class="text-sm text-muted">
                Overlay content exposes background, border and foreground balance outside the card surface.
              </p>
            </div>
          </template>
        </UPopover>

        <UButton
          color="primary"
          variant="solid"
          icon="i-lucide-square-stack"
          :disabled="props.disableInteractive"
          :style="buttonStyle('solid', 'primary')"
          @click="isModalOpen = true"
        >
          Open modal
        </UButton>

        <UButton
          color="secondary"
          variant="soft"
          icon="i-lucide-panel-right-open"
          :disabled="props.disableInteractive"
          :style="buttonStyle('soft', 'secondary')"
          @click="isDrawerOpen = true"
        >
          Open drawer
        </UButton>
      </div>

      <p class="mt-4 text-sm text-muted">
        These controls stay intentionally compact; the goal is to inspect overlay chrome and semantic action balance,
        not to reproduce full application flows.
      </p>
    </UCard>

    <UModal
      v-model:open="isModalOpen"
      title="Preview modal"
      description="Use this dialog to inspect overlay contrast, close controls and footer actions."
    >
      <template #body>
        <div class="space-y-4">
          <div class="rounded-2xl border border-default bg-muted/60 p-4">
            <p class="text-sm text-default">
              Modal body content should preserve hierarchy without washing out the palette.
            </p>
          </div>
          <UAlert
            color="info"
            variant="subtle"
            title="Overlay note"
            description="Semantics inside modals should feel consistent with in-page feedback."
          />
        </div>
      </template>

      <template #footer="{ close }">
        <div class="flex w-full justify-end gap-3">
          <UButton color="neutral" variant="outline" :style="buttonStyle('outline', 'neutral')" @click="close">
            Cancel
          </UButton>
          <UButton color="primary" :style="buttonStyle('solid', 'primary')" @click="close">
            Apply
          </UButton>
        </div>
      </template>
    </UModal>

    <UDrawer
      v-model:open="isDrawerOpen"
      direction="right"
      title="Preview drawer"
      description="Side panels help validate borders, background elevation and sticky action areas."
    >
      <template #body>
        <div class="space-y-4 px-1 pb-2">
          <UCard variant="soft">
            <p class="text-sm text-muted">
              Drawers are useful for inspecting larger muted surfaces next to the main canvas.
            </p>
          </UCard>
          <UInput
            model-value="Right rail sample"
            color="primary"
            variant="outline"
            highlight
            :style="inputStyle"
          />
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3 px-1 pb-1">
          <UButton color="neutral" variant="ghost" :style="buttonStyle('ghost', 'neutral')" @click="isDrawerOpen = false">
            Dismiss
          </UButton>
          <UButton color="secondary" :style="buttonStyle('solid', 'secondary')" @click="isDrawerOpen = false">
            Save changes
          </UButton>
        </div>
      </template>
    </UDrawer>
  </section>
</template>
