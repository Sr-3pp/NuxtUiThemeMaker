<script setup lang="ts">
const surfaceCards = [
  {
    title: 'Default surface',
    description: 'Baseline card treatment for content-heavy areas.',
    classes: 'bg-default text-default border-default'
  },
  {
    title: 'Muted surface',
    description: 'Secondary panels and low-emphasis grouping.',
    classes: 'bg-muted text-default border-muted'
  },
  {
    title: 'Elevated surface',
    description: 'Raised containers and layered settings panes.',
    classes: 'bg-elevated text-default border-default shadow-sm'
  },
  {
    title: 'Accented surface',
    description: 'Accent-backed highlight areas and summary tiles.',
    classes: 'bg-accented text-highlighted border-accented'
  },
  {
    title: 'Inverted surface',
    description: 'High-emphasis areas that rely on inverse foreground tokens.',
    classes: 'bg-inverted text-inverted border-inverted'
  }
]
</script>

<template>
  <section class="space-y-4">
    <div class="space-y-1">
      <h3 class="text-lg font-semibold text-highlighted">
        Containers, surfaces and type
      </h3>
      <p class="text-sm text-muted">
        Surface layering, separators, nested cards and typography helpers for quick contrast inspection.
      </p>
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <UCard variant="outline">
        <template #header>
          <p class="text-sm font-medium text-highlighted">Surface tokens in context</p>
        </template>

        <div class="grid gap-4 md:grid-cols-2">
          <div
            v-for="surface in surfaceCards"
            :key="surface.title"
            :class="['rounded-2xl border p-4', surface.classes]"
          >
            <p class="text-sm font-semibold">{{ surface.title }}</p>
            <p class="mt-2 text-sm opacity-85">
              {{ surface.description }}
            </p>
          </div>
        </div>

        <USeparator class="my-5" label="Nested surfaces" />

        <div class="rounded-3xl border border-default bg-muted/60 p-4">
          <div class="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <UCard variant="outline">
              <template #header>
                <p class="text-sm font-medium text-highlighted">Outer card</p>
              </template>
              <p class="text-sm text-muted">
                Outer surface uses the default container and border tokens.
              </p>
            </UCard>

            <UCard variant="soft" class="border border-default/70">
              <template #header>
                <p class="text-sm font-medium text-highlighted">Nested card</p>
              </template>
              <p class="text-sm text-muted">
                The nested layer exposes elevation contrast and softened backgrounds.
              </p>
            </UCard>
          </div>
        </div>
      </UCard>

      <UCard variant="soft">
        <template #header>
          <p class="text-sm font-medium text-highlighted">Typography helper block</p>
        </template>

        <div class="space-y-4 rounded-3xl border border-default bg-default p-5">
          <div class="space-y-2">
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

          <USeparator />

          <div class="flex flex-wrap items-center gap-3">
            <UKbd value="cmd" />
            <UKbd value="shift" />
            <UKbd value="p" />
            <UChip color="success" text="Live" standalone>
              <UButton color="neutral" variant="outline" label="Command palette" />
            </UChip>
          </div>

          <p class="text-sm text-dimmed">
            Dimmed text should fall behind primary content without disappearing into the container.
          </p>
        </div>
      </UCard>
    </div>
  </section>
</template>
