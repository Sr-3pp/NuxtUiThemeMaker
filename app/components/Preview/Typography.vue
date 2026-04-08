<script setup lang="ts">
import { getPreviewButtonStyle } from '~/utils/preview-overrides'
import type { PreviewInteractiveProps } from '~/types/theme-preview'

const props = defineProps<PreviewInteractiveProps>()

const textScale = [
  { label: 'Display', classes: 'text-4xl font-semibold tracking-tight text-highlighted', sample: 'Build a clearer visual hierarchy' },
  { label: 'Heading', classes: 'text-2xl font-semibold tracking-tight text-highlighted', sample: 'Section title with strong contrast' },
  { label: 'Body', classes: 'text-sm leading-6 text-default', sample: 'Body copy should remain readable across elevated, muted and default surfaces without losing rhythm.' },
  { label: 'Muted', classes: 'text-sm leading-6 text-muted', sample: 'Muted support text should recede without disappearing.' },
  { label: 'Dimmed', classes: 'text-sm leading-6 text-dimmed', sample: 'Dimmed content needs enough presence for metadata and helper copy.' },
]

function buttonStyle(variant: string, color: string) {
  return getPreviewButtonStyle(props.palette, variant, color)
}
</script>

<template>
  <section class="space-y-4">
    <PreviewSectionIntro
      title="Typography"
      description="Headings, body copy, inline emphasis and supporting text for quick readability checks."
    />

    <div class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <PreviewCard title="Type scale">
        <div class="space-y-5 rounded-3xl border border-default bg-default p-5">
          <div
            v-for="item in textScale"
            :key="item.label"
            class="space-y-2"
          >
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              {{ item.label }}
            </p>
            <p :class="item.classes">
              {{ item.sample }}
            </p>
          </div>
        </div>
      </PreviewCard>

      <div class="grid gap-6">
        <PreviewCard title="Typography helper block" variant="soft">
          <div class="space-y-4 rounded-3xl border border-default bg-default p-5">
            <p class="text-xs font-medium uppercase tracking-[0.2em] text-muted">Editorial check</p>
            <h2 class="text-2xl font-semibold tracking-tight text-highlighted">
              Palette review notes for headings, links and muted copy
            </h2>
            <p class="text-sm leading-6 text-default">
              Use this block to judge body text against the current surface. Mixed emphasis should remain readable:
              <a href="#" class="font-medium text-primary underline-offset-4 hover:underline">interactive links</a>,
              <span class="text-muted"> muted support text</span> and
              <span class="rounded bg-accented px-1.5 py-0.5 text-highlighted"> highlighted inline labels</span>.
            </p>
          </div>
        </PreviewCard>

        <PreviewCard title="Small text and tokens">
          <div class="space-y-4 rounded-3xl border border-default bg-muted/40 p-5">
            <div class="flex flex-wrap items-center gap-3">
              <UKbd value="cmd" />
              <UKbd value="shift" />
              <UKbd value="p" />
              <UChip color="success" text="Live" standalone>
                <UButton color="neutral" variant="outline" label="Command palette" :style="buttonStyle('outline', 'neutral')" />
              </UChip>
              <UBadge color="primary" variant="soft" label="Primary note" />
            </div>

            <p class="text-sm text-dimmed">
              Dimmed text should fall behind primary content without disappearing into the container.
            </p>
          </div>
        </PreviewCard>
      </div>
    </div>
  </section>
</template>
