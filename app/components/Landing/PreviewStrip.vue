<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import { getPreviewButtonStyle, getPreviewInputStyle } from '~/utils/preview-overrides'

const props = defineProps<{
  isLoading?: boolean
  palette: PaletteDefinition | null
}>()

const buttonStyle = computed(() => getPreviewButtonStyle(props.palette, 'solid', 'primary'))
const secondaryButtonStyle = computed(() => getPreviewButtonStyle(props.palette, 'soft', 'secondary'))
const inputStyle = computed(() => getPreviewInputStyle(props.palette))
</script>

<template>
  <section class="space-y-6">
    <div class="space-y-3">
      <p class="text-sm font-semibold uppercase tracking-widest text-primary">
        Live demo
      </p>
      <h2 class="text-3xl font-bold tracking-tight text-highlighted lg:text-4xl">
        The landing becomes the preview.
      </h2>
      <p class="max-w-3xl text-base leading-relaxed text-muted lg:text-lg">
        Instead of showing screenshots, the generated palette is applied to real interface patterns so visitors immediately understand what the product does.
      </p>
    </div>

    <div class="grid gap-5 lg:gap-6 xl:grid-cols-3">
      <UCard class="xl:col-span-1">
        <div class="space-y-5">
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-1">
              <p class="text-base font-bold text-highlighted">
                Theme-ready actions
              </p>
              <p class="text-sm leading-relaxed text-muted">
                Buttons, badges, and status accents shift with the generated palette.
              </p>
            </div>
            <UBadge color="primary" variant="soft" size="md">
              Preview
            </UBadge>
          </div>

          <div class="flex flex-wrap gap-3">
            <UButton color="primary" icon="i-lucide-sparkles" :loading="props.isLoading" :style="buttonStyle">
              Generate
            </UButton>
            <UButton color="secondary" variant="soft" trailing-icon="i-lucide-arrow-right" :style="secondaryButtonStyle">
              Continue
            </UButton>
            <UBadge color="success" variant="soft" label="Healthy contrast" />
            <UBadge color="warning" variant="outline" label="Needs review" />
          </div>
        </div>
      </UCard>

      <UCard class="xl:col-span-1">
        <div class="space-y-5">
          <div class="space-y-1">
            <p class="text-base font-bold text-highlighted">
              Forms and feedback
            </p>
            <p class="text-sm leading-relaxed text-muted">
              Inputs and layered surfaces let visitors evaluate readability at a glance.
            </p>
          </div>

          <UInput placeholder="Palette name" icon="i-lucide-palette" size="lg" :style="inputStyle" />

          <div class="rounded-xl border border-default bg-muted p-4">
            <p class="text-base font-bold text-highlighted">
              Contrast audit
            </p>
            <p class="mt-2 text-sm leading-relaxed text-default">
              Repair low-contrast states, generate ramps, and keep semantic tokens readable before export.
            </p>
          </div>
        </div>
      </UCard>

      <UCard class="xl:col-span-1">
        <div class="space-y-5">
          <div class="space-y-1">
            <p class="text-base font-bold text-highlighted">
              Palette readiness
            </p>
            <p class="text-sm leading-relaxed text-muted">
              The same palette can move into the full editor, workspace, export, and sharing flows.
            </p>
          </div>

          <div class="space-y-3">
            <div class="rounded-xl border border-default bg-elevated px-4 py-3.5">
              <p class="text-xs font-bold uppercase tracking-widest text-muted">
                Output
              </p>
              <p class="mt-1.5 text-sm font-bold text-highlighted">
                JSON, CSS, theme bundle
              </p>
            </div>
            <div class="rounded-xl border border-default bg-elevated px-4 py-3.5">
              <p class="text-xs font-bold uppercase tracking-widest text-muted">
                Workflow
              </p>
              <p class="mt-1.5 text-sm font-bold text-highlighted">
                Share, fork, save, iterate
              </p>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </section>
</template>
