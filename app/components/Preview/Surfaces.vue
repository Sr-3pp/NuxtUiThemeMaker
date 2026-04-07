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
        Containers and surfaces
      </h3>
      <p class="text-sm text-muted">
        Surface layering, separators, nested cards and elevation checks for quick container contrast inspection.
      </p>
    </div>

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
  </section>
</template>
