<script setup lang="ts">
import type { StoredPalette } from '~/types/palette-store'
import type { ComponentPublicInstance } from 'vue'
import type { DropdownMenuItem } from '~/types/ui-local'

const siteConfig = useRuntimeConfig()
const { cta, helperText } = usePaletteGenerationAccess()
const { signOut, user } = useAuth()
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

const authItems = computed<DropdownMenuItem[][]>(() => {
  if (!user.value) {
    return []
  }

  const menuItems: DropdownMenuItem[][] = [
    [
      {
        label: user.value.name || user.value.email,
        type: 'label'
      }
    ],
    [
      {
        label: 'Workspace',
        icon: 'i-lucide-briefcase',
        to: '/workspace'
      },
      {
        label: 'Editor',
        icon: 'i-lucide-pencil-ruler',
        to: '/editor'
      },
      {
        label: 'Pricing',
        icon: 'i-lucide-credit-card',
        to: '/pricing'
      }
    ]
  ]

  // Add admin-only Panel option
  if (user.value.isAdmin && menuItems[1]) {
    menuItems[1].push({
      label: 'Panel',
      icon: 'i-lucide-shield',
      to: '/panel'
    })
  }

  menuItems.push([
    {
      label: 'Sign out',
      icon: 'i-lucide-log-out',
      onSelect: async () => {
        await signOut()
        await navigateTo('/')
      }
    }
  ])

  return menuItems
})
</script>

<template>
  <LandingThemeShell
    :palette="activePalette"
    :is-generated="Boolean(generatedPalette)"
    :is-loading="isGenerating"
  >
    <UMain class="relative overflow-hidden bg-default">
      <div class="absolute inset-x-0 top-0 h-screen bg-[radial-gradient(circle_at_top_left,var(--landing-gradient-primary),transparent_48%),radial-gradient(circle_at_top_right,var(--landing-gradient-secondary),transparent_42%)] opacity-15 blur-sm" />

      <UContainer class="relative space-y-12 px-4 py-8 sm:px-6 sm:py-10 lg:space-y-20 lg:py-12">
        <header class="flex flex-col gap-5 rounded-3xl border border-default bg-elevated px-6 py-5 shadow-lg sm:flex-row sm:items-center sm:justify-between lg:px-8 lg:py-6">
          <div class="space-y-1.5">
            <p class="text-base font-bold text-highlighted lg:text-lg">
              Nuxt UI Theme Builder
            </p>
            <p class="text-sm leading-relaxed text-muted lg:text-base">
              Generate a palette here, then refine it in the full editor and workspace.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <template v-if="user">
              <UButton color="neutral" variant="ghost" to="/pricing" size="lg">
                Pricing
              </UButton>
              <UButton color="neutral" variant="ghost" to="/workspace" size="lg">
                Workspace
              </UButton>
              <UButton color="primary" variant="soft" to="/editor" size="lg">
                Open editor
              </UButton>
              <UDropdownMenu
                :items="authItems"
                :content="{ align: 'end' }"
                :ui="{ content: 'min-w-48' }"
              >
                <UButton
                  :label="user.name || user.email"
                  icon="i-lucide-circle-user"
                  trailing-icon="i-lucide-chevron-down"
                  color="neutral"
                  variant="ghost"
                  size="lg"
                  class="data-[state=open]:bg-elevated"
                />
              </UDropdownMenu>
            </template>
            <template v-else>
              <UButton color="neutral" variant="ghost" to="/pricing" size="lg">
                Pricing
              </UButton>
              <UButton color="neutral" variant="outline" to="/login" size="lg" icon="i-lucide-log-in">
                Sign in
              </UButton>
              <UButton color="primary" variant="soft" to="/register" size="lg">
                Register
              </UButton>
            </template>
          </div>
        </header>

        <LandingHeroPrompt
          v-model="promptInput"
          :is-loading="isGenerating"
          :helper-text="helperText || `Guests can try ${remainingGuestRunsLabel} in demo mode, then sign up to save palettes.`"
          :cta="cta"
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
