<script setup lang="ts">
const props = defineProps<{
  paletteName: string
  previewMode: 'light' | 'dark'
  isUsingDefaultTheme: boolean
  disableInteractive: boolean
}>()

const emit = defineEmits<{
  'open-export': []
  'update:disableInteractive': [value: boolean]
}>()

function updateDisableInteractive(value: boolean) {
  emit('update:disableInteractive', value)
}
</script>

<template>
  <UCard variant="outline" class="border-default/70">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="min-w-0 space-y-2">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-medium uppercase tracking-[0.18em] text-muted">Workspace</span>
          <UBadge color="neutral" variant="outline" class="capitalize">
            {{ props.previewMode }} preview
          </UBadge>
          <UBadge :color="props.isUsingDefaultTheme ? 'neutral' : 'primary'" :variant="props.isUsingDefaultTheme ? 'outline' : 'soft'">
            {{ props.isUsingDefaultTheme ? 'Nuxt UI defaults' : 'Custom overrides active' }}
          </UBadge>
        </div>

        <div class="space-y-1">
          <h2 class="text-xl font-semibold tracking-tight text-highlighted">
            {{ props.paletteName }}
          </h2>
          <p class="text-sm text-muted">
            Builder controls stay compact so the preview canvas remains the main focus.
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-3 lg:items-end">
        <div class="flex flex-wrap items-center gap-2">
          <USwitch
            :model-value="props.disableInteractive"
            label="Disable interactions"
            @update:model-value="updateDisableInteractive"
          />
          <UButton color="primary" @click="emit('open-export')">
            Export
          </UButton>
        </div>
        <p class="text-xs text-muted lg:text-right">
          Toggle disabled states here while keeping editing and preview actions close together.
        </p>
      </div>
    </div>
  </UCard>
</template>
