<script setup lang="ts">
const props = defineProps<{
  disableInteractive: boolean
}>()

const alerts = [
  {
    color: 'success',
    title: 'Accessible success feedback',
    description: 'Good success states keep the filled background calm while preserving readable copy.'
  },
  {
    color: 'info',
    title: 'Informational guidance',
    description: 'Info surfaces should stand apart from neutrals without fighting the primary accent.'
  },
  {
    color: 'warning',
    title: 'Warning treatment',
    description: 'Warnings need enough contrast for banners, callouts and inline cautions.'
  },
  {
    color: 'error',
    title: 'Error visibility',
    description: 'Critical feedback must remain obvious on both light and dark preview modes.'
  }
] as const
</script>

<template>
  <section class="space-y-4">
    <div class="space-y-1">
      <h3 class="text-lg font-semibold text-highlighted">
        Feedback and status
      </h3>
      <p class="text-sm text-muted">
        Semantic status colors, progress fills and loading placeholders in realistic surface contexts.
      </p>
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <UCard variant="outline">
        <template #header>
          <p class="text-sm font-medium text-highlighted">Alerts</p>
        </template>

        <div class="space-y-3">
          <UAlert
            v-for="alert in alerts"
            :key="alert.color"
            :color="alert.color"
            variant="soft"
            orientation="horizontal"
            :title="alert.title"
            :description="alert.description"
            :actions="props.disableInteractive ? [] : [{ label: 'Inspect', color: 'neutral', variant: 'link' }]"
          />
        </div>
      </UCard>

      <div class="grid gap-6">
        <UCard variant="outline">
          <template #header>
            <p class="text-sm font-medium text-highlighted">Progress</p>
          </template>

          <div class="space-y-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs text-muted">
                <span>Primary completion</span>
                <span>32%</span>
              </div>
              <UProgress :model-value="32" color="primary" status />
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs text-muted">
                <span>Success confirmation</span>
                <span>78%</span>
              </div>
              <UProgress :model-value="78" color="success" status />
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs text-muted">
                <span>Warning threshold</span>
                <span>61%</span>
              </div>
              <UProgress :model-value="61" color="warning" status />
            </div>
          </div>
        </UCard>

        <UCard variant="soft">
          <template #header>
            <p class="text-sm font-medium text-highlighted">Skeletons</p>
          </template>

          <div class="space-y-4">
            <div class="space-y-3 rounded-2xl border border-default bg-default p-4">
              <USkeleton class="h-4 w-24" />
              <USkeleton class="h-9 w-full rounded-lg" />
              <USkeleton class="h-24 w-full rounded-xl" />
            </div>
            <p class="text-xs text-muted">Loading placeholders help evaluate subtle borders and low-contrast fills.</p>
          </div>
        </UCard>
      </div>
    </div>
  </section>
</template>
