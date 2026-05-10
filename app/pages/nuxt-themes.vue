<script setup lang="ts">
import {
  buildNuxtThemesFaqJsonLd,
  buildSoftwareApplicationJsonLd,
  getSeoRoute,
  nuxtThemeKeywordClusters,
} from '~/utils/seo'

const siteConfig = useRuntimeConfig()
const pageSeo = getSeoRoute('/nuxt-themes')

usePageSeo({
  title: pageSeo.title,
  description: pageSeo.description,
  keywords: pageSeo.keywords,
  path: pageSeo.path,
  jsonLd: [
    buildSoftwareApplicationJsonLd(
      siteConfig.public.siteName,
      `${siteConfig.public.siteUrl}/nuxt-themes`,
      'Nuxt theme generator and Nuxt UI theme editor for color palettes, design tokens, previews, accessibility QA, and export-ready app config.',
    ),
    buildNuxtThemesFaqJsonLd(),
  ],
})

const exportFormats = [
  'Nuxt app config',
  'Theme JSON',
  'CSS variables',
  'TypeScript theme files',
  'Component overrides',
]
</script>

<template>
  <UMain class="min-h-screen bg-default">
    <UContainer class="space-y-12 px-4 py-10 sm:px-6 lg:py-16">
      <section class="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div class="space-y-6">
          <UBadge color="primary" variant="soft" size="lg" class="w-max">
            Nuxt themes
          </UBadge>

          <div class="space-y-5">
            <h1 class="max-w-4xl text-4xl font-bold tracking-tight text-highlighted sm:text-5xl lg:text-6xl">
              Build Nuxt themes for polished Nuxt UI apps
            </h1>
            <p class="max-w-3xl text-base leading-relaxed text-muted sm:text-lg">
              Create Nuxt UI themes from a prompt or from scratch, preview them on real components, repair risky contrast, and export the palette when it is ready for your app.
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <UButton to="/editor" color="primary" size="lg" icon="i-lucide-pencil-ruler">
              Open theme editor
            </UButton>
            <UButton to="/" color="neutral" variant="outline" size="lg" icon="i-lucide-sparkles">
              Generate with AI
            </UButton>
          </div>
        </div>

        <UCard class="border-default bg-elevated shadow-xl">
          <div class="space-y-5">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-semibold text-highlighted">
                  Theme workflow
                </p>
                <p class="text-sm text-muted">
                  From prompt to Nuxt UI export
                </p>
              </div>
              <UIcon name="i-lucide-palette" class="size-8 text-primary" />
            </div>

            <div class="grid gap-3">
              <div class="rounded-lg border border-default bg-default p-4">
                <p class="text-sm font-semibold text-highlighted">
                  Generate or edit
                </p>
                <p class="mt-1 text-sm leading-relaxed text-muted">
                  Start with AI, shared palettes, or manual token editing.
                </p>
              </div>
              <div class="rounded-lg border border-default bg-default p-4">
                <p class="text-sm font-semibold text-highlighted">
                  Preview and QA
                </p>
                <p class="mt-1 text-sm leading-relaxed text-muted">
                  Check real Nuxt UI components, states, focus rings, and contrast.
                </p>
              </div>
              <div class="rounded-lg border border-default bg-default p-4">
                <p class="text-sm font-semibold text-highlighted">
                  Export and share
                </p>
                <p class="mt-1 text-sm leading-relaxed text-muted">
                  Save, fork, publish, or export files for implementation.
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </section>

      <section class="space-y-6">
        <div class="space-y-3">
          <p class="text-sm font-semibold uppercase tracking-widest text-primary">
            Search intents
          </p>
          <h2 class="text-3xl font-bold tracking-tight text-highlighted lg:text-4xl">
            Useful for more than one Nuxt theme search
          </h2>
          <p class="max-w-3xl text-base leading-relaxed text-muted">
            People looking for Nuxt themes often need a generator, palette editor, token workflow, template starting point, or accessibility review before they ship.
          </p>
        </div>

        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <UCard
            v-for="keyword in nuxtThemeKeywordClusters"
            :key="keyword.title"
            class="border-default bg-default"
          >
            <div class="space-y-3">
              <p class="text-lg font-semibold text-highlighted">
                {{ keyword.title }}
              </p>
              <p class="text-sm leading-relaxed text-muted">
                {{ keyword.description }}
              </p>
            </div>
          </UCard>
        </div>
      </section>

      <section class="grid gap-8 rounded-xl border border-default bg-elevated p-6 shadow-lg lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
        <div class="space-y-3">
          <p class="text-sm font-semibold uppercase tracking-widest text-primary">
            Export targets
          </p>
          <h2 class="text-3xl font-bold tracking-tight text-highlighted">
            Move from visual Nuxt theme to implementation files
          </h2>
          <p class="text-base leading-relaxed text-muted">
            Keep the creative work connected to real Nuxt UI output so the theme can move into a project without translating every token by hand.
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="format in exportFormats"
            :key="format"
            class="flex items-center gap-3 rounded-lg border border-default bg-default p-4 text-sm font-medium text-highlighted"
          >
            <UIcon name="i-lucide-check" class="size-4 text-primary" />
            <span>{{ format }}</span>
          </div>
        </div>
      </section>
    </UContainer>
  </UMain>
</template>
