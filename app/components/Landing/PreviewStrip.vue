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
  <section class="space-y-4">
    <div class="space-y-2">
      <p class="text-xs uppercase tracking-[0.2em] text-primary">
        Live demo
      </p>
      <h2 class="text-3xl font-semibold tracking-tight text-highlighted">
        The landing becomes the preview.
      </h2>
      <p class="max-w-3xl text-sm leading-6 text-muted">
        Instead of showing screenshots, the generated palette is applied to real interface patterns so visitors immediately understand what the product does.
      </p>
    </div>

    <div class="grid gap-4 xl:grid-cols-[1.1fr_0.9fr_0.8fr]">
      <UCard class="rounded-[1.5rem] border-default/70 bg-default/85">
        <div class="space-y-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-highlighted">
                Theme-ready actions
              </p>
              <p class="text-sm text-muted">
                Buttons, badges, and status accents shift with the generated palette.
              </p>
            </div>
            <UBadge color="primary" variant="soft">
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

      <UCard class="rounded-[1.5rem] border-default/70 bg-default/85">
        <div class="space-y-4">
          <div>
            <p class="text-sm font-medium text-highlighted">
              Forms and feedback
            </p>
            <p class="text-sm text-muted">
              Inputs and layered surfaces let visitors evaluate readability at a glance.
            </p>
          </div>

          <UInput
            placeholder="Palette name"
            icon="i-lucide-palette"
            :style="inputStyle"
          />

          <div class="rounded-2xl border border-default/70 bg-muted/35 p-4">
            <p class="text-sm font-medium text-highlighted">
              Contrast audit
            </p>
            <p class="mt-1 text-sm text-muted">
              Repair low-contrast states, generate ramps, and keep semantic tokens readable before export.
            </p>
          </div>
        </div>
      </UCard>

      <UCard class="rounded-[1.5rem] border-default/70 bg-default/85">
        <div class="space-y-4">
          <div>
            <p class="text-sm font-medium text-highlighted">
              Palette readiness
            </p>
            <p class="text-sm text-muted">
              The same palette can move into the full editor, workspace, export, and sharing flows.
            </p>
          </div>

          <div class="grid gap-3">
            <div class="rounded-2xl border border-default/70 bg-default/75 px-4 py-3">
              <p class="text-xs uppercase tracking-[0.16em] text-muted">
                Output
              </p>
              <p class="text-sm font-medium text-highlighted">
                JSON, CSS, theme bundle
              </p>
            </div>
            <div class="rounded-2xl border border-default/70 bg-default/75 px-4 py-3">
              <p class="text-xs uppercase tracking-[0.16em] text-muted">
                Workflow
              </p>
              <p class="text-sm font-medium text-highlighted">
                Share, fork, save, iterate
              </p>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </section>
</template>
