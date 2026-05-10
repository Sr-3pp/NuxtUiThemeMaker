<script setup lang="ts">
import type { StoredPalette } from '~/types/palette-store'
import type { ComponentPublicInstance } from 'vue'
import { buildNuxtThemesFaqJsonLd, buildSiteJsonLd, buildSoftwareApplicationJsonLd, getSeoRoute } from '~/utils/seo'

const siteConfig = useRuntimeConfig()
const pageSeo = getSeoRoute('/')
const { cta, helperText } = usePaletteGenerationAccess()
const {
  activePalette,
  generated,
  isGenerating,
  isSaving,
  promptInput,
  remainingGuestRunsLabel,
  applySharedPalette,
  exportCurrentPalette,
  generateFromPrompt,
  markFeatureViewed,
  markPricingViewed,
  openEditor,
  saveCurrentPalette,
} = useLandingPaletteWorkflow()

const { data: publicPalettes } = await useAsyncData('landing-public-palettes', () => {
  return $fetch<StoredPalette[]>('/api/palettes')
}, {
  default: () => [],
})

const featuredPalettes = computed(() => publicPalettes.value.slice(0, 3))
const generatedPalette = computed(() => generated.value.palette)
const isSaved = computed(() => generated.value.persistence.lifecycle === 'saved')

usePageSeo({
  title: pageSeo.title,
  description: pageSeo.description,
  keywords: pageSeo.keywords,
  path: pageSeo.path,
  jsonLd: [
    buildSiteJsonLd(siteConfig.public.siteName, siteConfig.public.siteUrl, siteConfig.public.siteDescription),
    buildSoftwareApplicationJsonLd(
      siteConfig.public.siteName,
      siteConfig.public.siteUrl,
      'AI-assisted Nuxt themes and Nuxt UI palette builder with live theme previews, export, sharing, and workspace workflows.',
    ),
    buildNuxtThemesFaqJsonLd(),
  ],
})

function handleApplySharedPalette(palette: StoredPalette) {
  applySharedPalette(palette)

  if (import.meta.client) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }
}

function registerFeatureSection(node: Element | ComponentPublicInstance | null) {
  if (node instanceof HTMLElement) {
    markFeatureViewed()
  }
}

function registerPricingSection(node: Element | ComponentPublicInstance | null) {
  if (node instanceof HTMLElement) {
    markPricingViewed()
  }
}

</script>

<template>
  <UMain class="relative overflow-hidden bg-default">
    <div class="absolute inset-x-0 top-0 h-screen bg-[radial-gradient(circle_at_top_left,var(--landing-gradient-primary),transparent_48%),radial-gradient(circle_at_top_right,var(--landing-gradient-secondary),transparent_42%)] opacity-15 blur-sm" />

    <UContainer class="relative space-y-12 px-4 py-8 sm:px-6 sm:py-10 lg:space-y-20 lg:py-12">
      <LandingHeroPrompt
        v-model="promptInput"
        :is-loading="isGenerating"
        :helper-text="helperText || `Guests can try ${remainingGuestRunsLabel} in demo mode, then sign up to save palettes.`"
        :cta="cta"
        @submit="generateFromPrompt"
      />

      <LandingGeneratedPaletteSummary
        v-if="generatedPalette"
        :palette="generatedPalette"
        :prompt="generated.prompt"
        :is-saved="isSaved"
        :is-saving="isSaving"
        @edit="openEditor"
        @save="saveCurrentPalette"
        @export="exportCurrentPalette"
        @regenerate="generateFromPrompt"
      />

      <LandingPreviewStrip
        :palette="activePalette"
        :is-loading="isGenerating"
      />

      <div :ref="registerFeatureSection">
        <LandingFeatureGrid />
      </div>

      <LandingGallery
        v-if="featuredPalettes.length"
        :palettes="featuredPalettes"
        @apply="handleApplySharedPalette"
      />

      <section class="space-y-6">
        <div class="space-y-3">
          <p class="text-sm font-semibold uppercase tracking-widest text-primary">
            Workflow
          </p>
          <h2 class="text-3xl font-bold tracking-tight text-highlighted lg:text-4xl">
            Prompt, refine, save, export, and share from the same palette model.
          </h2>
        </div>

        <div class="grid gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4">
          <UCard class="group transition-all duration-300 hover:shadow-lg hover:border-primary/30">
            <p class="text-xs font-bold uppercase tracking-widest text-primary/60 transition-colors duration-300 group-hover:text-primary">
              01
            </p>
            <p class="mt-4 text-xl font-bold text-highlighted">
              Generate
            </p>
            <p class="mt-3 text-sm leading-relaxed text-muted">
              Start with a prompt and get a palette that immediately drives real Nuxt UI tokens.
            </p>
          </UCard>
          <UCard class="group transition-all duration-300 hover:shadow-lg hover:border-primary/30">
            <p class="text-xs font-bold uppercase tracking-widest text-primary/60 transition-colors duration-300 group-hover:text-primary">
              02
            </p>
            <p class="mt-4 text-xl font-bold text-highlighted">
              Edit
            </p>
            <p class="mt-3 text-sm leading-relaxed text-muted">
              Continue in the full editor for manual token control, preview review, and AI assist tools.
            </p>
          </UCard>
          <UCard class="group transition-all duration-300 hover:shadow-lg hover:border-primary/30">
            <p class="text-xs font-bold uppercase tracking-widest text-primary/60 transition-colors duration-300 group-hover:text-primary">
              03
            </p>
            <p class="mt-4 text-xl font-bold text-highlighted">
              Save
            </p>
            <p class="mt-3 text-sm leading-relaxed text-muted">
              Keep winning palettes in your library, track history, and move them through shared workflows.
            </p>
          </UCard>
          <UCard class="group transition-all duration-300 hover:shadow-lg hover:border-primary/30">
            <p class="text-xs font-bold uppercase tracking-widest text-primary/60 transition-colors duration-300 group-hover:text-primary">
              04
            </p>
            <p class="mt-4 text-xl font-bold text-highlighted">
              Export
            </p>
            <p class="mt-3 text-sm leading-relaxed text-muted">
              Download JSON, CSS, or app-ready config once the Nuxt theme is strong enough to ship.
            </p>
          </UCard>
        </div>
      </section>

      <div :ref="registerPricingSection">
        <LandingPricingSection />
      </div>

      <LandingCtaStrip
        @editor="openEditor"
        @regenerate="generateFromPrompt"
      />
    </UContainer>
  </UMain>
</template>
