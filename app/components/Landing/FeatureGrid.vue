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
  <section class="space-y-6">
    <div class="space-y-3">
      <p class="text-sm font-semibold uppercase tracking-widest text-primary">
        Product workflow
      </p>
      <h2 class="text-3xl font-bold tracking-tight text-highlighted lg:text-4xl">
        AI is the entry point, not the whole product.
      </h2>
      <p class="max-w-3xl text-base leading-relaxed text-muted lg:text-lg">
        The landing prompt gets users into a theme quickly. The rest of the app helps them validate, refine, export, and share it.
      </p>
    </div>

    <div class="grid gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
      <UCard
        v-for="feature in featureCards"
        :key="feature.title"
        class="group transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1"
      >
        <div class="space-y-4">
          <span class="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/15 group-hover:shadow-md">
            <UIcon :name="feature.icon" class="size-6" />
          </span>
          <div class="space-y-2.5">
            <p class="text-xl font-bold text-highlighted">
              {{ feature.title }}
            </p>
            <p class="text-sm leading-relaxed text-muted">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </UCard>
    </div>
  </section>
</template>
