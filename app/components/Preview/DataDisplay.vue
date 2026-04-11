<script setup lang="ts">
import type { PreviewInteractiveProps } from '~/types/theme-preview'
import { getPreviewButtonStyle } from '~/utils/preview-overrides'

const props = defineProps<PreviewInteractiveProps>()

const tableRows = [
  { component: 'Buttons', emphasis: 'Primary and semantic actions', status: 'Ready' },
  { component: 'Forms', emphasis: 'Focus, invalid and disabled states', status: 'Review' },
  { component: 'Surfaces', emphasis: 'Default, muted and elevated layers', status: 'Ready' },
  { component: 'Overlays', emphasis: 'Popover, menu and dialog contrast', status: 'Draft' }
]

const tableColumns = [
  { accessorKey: 'component', header: 'Area' },
  { accessorKey: 'emphasis', header: 'Coverage' },
  { accessorKey: 'status', header: 'Status' }
]

const avatars = [
  { text: 'AM', chip: { color: 'success', inset: true } },
  { text: 'SK', chip: { color: 'warning', inset: true } },
  { text: 'JT', chip: { color: 'primary', inset: true } }
] as const

function buttonStyle(variant: string, color: string) {
  return getPreviewButtonStyle(props.palette, variant, color)
}
</script>

<template>
  <section class="space-y-4">
    <PreviewSectionIntro
      title="Data display"
      description="Small-data table, avatar grouping and compact display helpers for support UI."
    />

    <div class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <PreviewCard title="Table preview">
        <UTable
          :data="tableRows"
          :columns="tableColumns"
        />
      </PreviewCard>

      <div class="grid gap-6">
        <PreviewCard title="Avatars and assistive labels" variant="soft">
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <UAvatarGroup>
                <UAvatar
                  v-for="avatar in avatars"
                  :key="avatar.text"
                  :text="avatar.text"
                  :chip="avatar.chip"
                />
              </UAvatarGroup>
              <p class="text-sm text-muted">Avatar rings and chips should remain distinct on shared surfaces.</p>
            </div>

            <div class="flex flex-wrap gap-2">
              <UBadge color="primary" variant="soft" label="Primary tag" />
              <UBadge color="neutral" variant="outline" label="Neutral tag" />
              <UBadge color="success" variant="subtle" label="Success tag" />
            </div>
          </div>
        </PreviewCard>

        <PreviewCard title="Hover target">
          <div class="flex items-center gap-3">
            <UButton color="neutral" variant="outline" icon="i-lucide-info" label="Hover target" :style="buttonStyle('outline', 'neutral')" />
            <p class="text-sm text-muted">Overlay contrast check temporarily rendered as static content while the tooltip integration is removed from this preview.</p>
          </div>
        </PreviewCard>
      </div>
    </div>
  </section>
</template>
