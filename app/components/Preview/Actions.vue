<script setup lang="ts">
import type { ButtonColor, ButtonVariant, PreviewInteractiveProps } from '~/types/theme-preview'
import { getPreviewButtonStyle } from '~/utils/preview-overrides'

const props = defineProps<PreviewInteractiveProps>()

const buttonColors: ButtonColor[] = ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']
const buttonVariants: ButtonVariant[] = ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link']
const badgeVariants = ['solid', 'outline', 'soft', 'subtle'] as const

function buttonStyle(variant: ButtonVariant, color: ButtonColor) {
  return getPreviewButtonStyle(props.palette, variant, color)
}
</script>

<template>
  <section class="space-y-4">
    <div class="space-y-1">
      <h3 class="text-lg font-semibold text-highlighted">
        Actions
      </h3>
      <p class="text-sm text-muted">
        Primary and semantic call-to-action states, emphasis levels and compact badge checks.
      </p>
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
      <UCard variant="outline">
        <template #header>
          <div class="space-y-1">
            <p class="text-sm font-medium text-highlighted">Button variants by semantic color</p>
            <p class="text-sm text-muted">Each row keeps the same semantic color while the variant shifts emphasis.</p>
          </div>
        </template>

        <div class="space-y-4">
          <div
            v-for="color in buttonColors"
            :key="color"
            class="grid gap-3 lg:grid-cols-[112px_repeat(6,minmax(0,1fr))]"
          >
            <div class="flex items-center">
              <UBadge :color="color" variant="soft" class="capitalize">
                {{ color }}
              </UBadge>
            </div>

            <UButton
              v-for="variant in buttonVariants"
              :key="`${color}-${variant}`"
              :color="color"
              :variant="variant"
              :disabled="props.disableInteractive"
              class="justify-center"
              :style="buttonStyle(variant, color)"
            >
              {{ variant }}
            </UButton>
          </div>
        </div>
      </UCard>

      <UCard variant="soft">
        <template #header>
          <div class="space-y-1">
            <p class="text-sm font-medium text-highlighted">State samples</p>
            <p class="text-sm text-muted">Loading, disabled, icon-only and directional icon treatments.</p>
          </div>
        </template>

        <div class="space-y-3">
          <div class="flex flex-wrap gap-3">
            <UButton color="primary" icon="i-lucide-sparkles" :style="buttonStyle('solid', 'primary')">
              Default
            </UButton>
            <UButton color="primary" variant="outline" leading-icon="i-lucide-arrow-left" :style="buttonStyle('outline', 'primary')">
              Leading icon
            </UButton>
            <UButton color="secondary" variant="soft" trailing-icon="i-lucide-arrow-right" :style="buttonStyle('soft', 'secondary')">
              Trailing icon
            </UButton>
          </div>

          <div class="flex flex-wrap gap-3">
            <UButton color="info" variant="subtle" loading :style="buttonStyle('subtle', 'info')">
              Loading
            </UButton>
            <UButton color="neutral" variant="outline" disabled :style="buttonStyle('outline', 'neutral')">
              Disabled
            </UButton>
            <UButton color="success" variant="solid" icon="i-lucide-check" square aria-label="Approve" :style="buttonStyle('solid', 'success')" />
          </div>

          <div class="rounded-2xl border border-default bg-muted/60 p-3">
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Badge sweep
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
              <template v-for="variant in badgeVariants" :key="variant">
                <UBadge color="primary" :variant="variant" :label="`primary ${variant}`" />
                <UBadge color="warning" :variant="variant" :label="`warning ${variant}`" />
              </template>
              <UBadge color="error" variant="solid" leading-icon="i-lucide-alert-circle" label="error solid" />
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </section>
</template>
