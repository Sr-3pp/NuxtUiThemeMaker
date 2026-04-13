<script setup lang="ts">
const featureCards = [
  {
    title: 'Generate starter palettes',
    description: 'Use a prompt to create a first-pass theme, then continue editing token-by-token.',
    icon: 'i-lucide-sparkles',
  },
  {
    title: 'Repair contrast issues',
    description: 'Use the built-in QA flow to spot risky combinations and patch them before export.',
    icon: 'i-lucide-shield-check',
  },
  {
    title: 'Build ramps and variants',
    description: 'Generate ramps, directions, and component-level variations without rebuilding the palette by hand.',
    icon: 'i-lucide-layers-3',
  },
  {
    title: 'Export for real Nuxt apps',
    description: 'Download theme JSON, CSS variables, or typed config files once the palette is ready.',
    icon: 'i-lucide-download',
  },
  {
    title: 'Share and fork palettes',
    description: 'Turn strong results into shareable links and let other people start from them.',
    icon: 'i-lucide-share-2',
  },
  {
    title: 'Keep a working library',
    description: 'Use the workspace to manage saved palettes, review status, and published versions.',
    icon: 'i-lucide-briefcase',
  },
]
</script>

<template>
  <section class="space-y-4">
    <div class="space-y-2">
      <p class="text-xs uppercase tracking-[0.2em] text-primary">
        Product workflow
      </p>
      <h2 class="text-3xl font-semibold tracking-tight text-highlighted">
        AI is the entry point, not the whole product.
      </h2>
      <p class="max-w-3xl text-sm leading-6 text-muted">
        The landing prompt gets users into a theme quickly. The rest of the app helps them validate, refine, export, and share it.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <UCard
        v-for="feature in featureCards"
        :key="feature.title"
      >
        <div class="space-y-3">
          <span class="flex size-11 items-center justify-center rounded -lg bg-primary/12 text-primary">
            <UIcon :name="feature.icon" class="size-5" />
          </span>
          <div class="space-y-2">
            <p class="text-lg font-medium text-highlighted">
              {{ feature.title }}
            </p>
            <p class="text-sm leading-6 text-muted">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </UCard>
    </div>
  </section>
</template>
