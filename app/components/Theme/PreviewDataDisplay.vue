<script setup lang="ts">
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
]
</script>

<template>
  <section class="space-y-4">
    <div class="space-y-1">
      <h3 class="text-lg font-semibold text-highlighted">
        Data display
      </h3>
      <p class="text-sm text-muted">
        Small-data table, avatar grouping and compact display helpers for support UI.
      </p>
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <UCard variant="outline">
        <template #header>
          <p class="text-sm font-medium text-highlighted">Table preview</p>
        </template>

        <UTable
          :data="tableRows"
          :columns="tableColumns"
        />
      </UCard>

      <div class="grid gap-6">
        <UCard variant="soft">
          <template #header>
            <p class="text-sm font-medium text-highlighted">Avatars and assistive labels</p>
          </template>

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
        </UCard>

        <UCard variant="outline">
          <template #header>
            <p class="text-sm font-medium text-highlighted">Tooltip trigger</p>
          </template>

          <div class="flex items-center gap-3">
            <UTooltip text="Check hover contrast and overlay surface" :content="{ side: 'top' }">
              <UButton color="neutral" variant="outline" icon="i-lucide-info" label="Hover target" />
            </UTooltip>
            <p class="text-sm text-muted">Tooltip surface and border contrast should remain readable over cards.</p>
          </div>
        </UCard>
      </div>
    </div>
  </section>
</template>
