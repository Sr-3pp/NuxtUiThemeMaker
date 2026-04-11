<script setup lang="ts">
import type { StoredPalette } from '~/types/palette-store'
import type { ComponentPublicInstance } from 'vue'

const siteConfig = useRuntimeConfig()
const { cta, helperText } = usePaletteGenerationAccess()
const {
  activePalette,
  generated,
  isGenerating,
  isSaving,
  promptInput,
  remainingGuestRunsLabel,
  selectedPresetId,
  applySharedPalette,
  exportCurrentPalette,
  generateFromPrompt,
  markFeatureViewed,
  markPricingViewed,
  openEditor,
  saveCurrentPalette,
  setPromptPreset,
} = useLandingPaletteDemo()

const { data: publicPalettes } = await useAsyncData('landing-public-palettes', () => {
  return $fetch<StoredPalette[]>('/api/palettes')
}, {
  default: () => [],
})

const featuredPalettes = computed(() => publicPalettes.value.slice(0, 3))
const generatedPalette = computed(() => generated.value.palette)
const isSaved = computed(() => generated.value.persistence.lifecycle === 'saved')

usePageSeo({
  title: 'Generate Nuxt UI Themes From a Prompt',
  description: 'Generate a Nuxt UI palette, watch the landing page restyle itself, then continue in the full editor, export flow, and workspace.',
  path: '/',
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteConfig.public.siteName,
      url: siteConfig.public.siteUrl,
      description: siteConfig.public.siteDescription,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      applicationCategory: 'DesignApplication',
      name: siteConfig.public.siteName,
      operatingSystem: 'Web',
      url: siteConfig.public.siteUrl,
      description: 'AI-assisted Nuxt UI palette builder with live theme previews, export, sharing, and workspace workflows.',
    },
  ],
})

function handleSelectPreset(presetId: string) {
  const preset = landingPromptPresets.find(item => item.id === presetId)

  if (preset) {
    setPromptPreset(preset)
  }
}

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
  <LandingThemeShell
    :palette="activePalette"
    :is-generated="Boolean(generatedPalette)"
    :is-loading="isGenerating"
  >
    <UMain class="relative overflow-hidden">
      <div class="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_left,var(--landing-gradient-primary),transparent_48%),radial-gradient(circle_at_top_right,var(--landing-gradient-secondary),transparent_42%)] opacity-30" />

      <UContainer class="relative space-y-10 px-4 py-6 sm:px-6 sm:py-8 lg:space-y-14">
        <header class="flex flex-col gap-4 rounded-[1.75rem] border border-default/70 bg-default/70 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-1">
            <p class="text-sm font-semibold text-highlighted">
              Nuxt UI Theme Builder
            </p>
            <p class="text-sm text-muted">
              Generate a palette here, then refine it in the full editor and workspace.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton color="neutral" variant="ghost" to="/pricing">
              Pricing
            </UButton>
            <UButton color="neutral" variant="ghost" to="/workspace">
              Workspace
            </UButton>
            <UButton color="primary" variant="soft" to="/editor">
              Open editor
            </UButton>
          </div>
        </header>

        <LandingHeroPrompt
          v-model="promptInput"
          :presets="landingPromptPresets"
          :selected-preset-id="selectedPresetId"
          :is-loading="isGenerating"
          :helper-text="helperText || `Guests can try ${remainingGuestRunsLabel} in demo mode, then sign up to save palettes.`"
          :error-message="generated.errorMessage"
          :cta="cta"
          @select-preset="handleSelectPreset"
          @submit="generateFromPrompt"
          @open-editor="openEditor"
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

        <section class="space-y-4">
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-[0.2em] text-primary">
              Workflow
            </p>
            <h2 class="text-3xl font-semibold tracking-tight text-highlighted">
              Prompt, refine, save, export, and share from the same palette model.
            </h2>
          </div>

          <div class="grid gap-4 xl:grid-cols-4">
            <UCard class="rounded-[1.5rem] border-default/70 bg-default/85">
              <p class="text-xs uppercase tracking-[0.18em] text-muted">
                01
              </p>
              <p class="mt-3 text-lg font-medium text-highlighted">
                Generate
              </p>
              <p class="mt-2 text-sm text-muted">
                Start with a prompt and get a palette that immediately drives real Nuxt UI tokens.
              </p>
            </UCard>
            <UCard class="rounded-[1.5rem] border-default/70 bg-default/85">
              <p class="text-xs uppercase tracking-[0.18em] text-muted">
                02
              </p>
              <p class="mt-3 text-lg font-medium text-highlighted">
                Edit
              </p>
              <p class="mt-2 text-sm text-muted">
                Continue in the full editor for manual token control, preview review, and AI assist tools.
              </p>
            </UCard>
            <UCard class="rounded-[1.5rem] border-default/70 bg-default/85">
              <p class="text-xs uppercase tracking-[0.18em] text-muted">
                03
              </p>
              <p class="mt-3 text-lg font-medium text-highlighted">
                Save
              </p>
              <p class="mt-2 text-sm text-muted">
                Keep winning palettes in your library, track history, and move them through shared workflows.
              </p>
            </UCard>
            <UCard class="rounded-[1.5rem] border-default/70 bg-default/85">
              <p class="text-xs uppercase tracking-[0.18em] text-muted">
                04
              </p>
              <p class="mt-3 text-lg font-medium text-highlighted">
                Export
              </p>
              <p class="mt-2 text-sm text-muted">
                Download JSON, CSS, or app-ready config once the palette is strong enough to ship.
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
  </LandingThemeShell>
</template>
