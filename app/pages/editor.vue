<script setup lang="ts">
import { emptyPalette } from '~/utils/paletteRegistry'
import { buildPaletteRuntimeTheme } from '~/utils/palette-theme'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const siteConfig = useRuntimeConfig()
const colorMode = useColorMode()

usePageSeo({
  title: 'Build and Share Nuxt UI Themes',
  description: 'Create Nuxt UI color palettes with live previews, token editing, export tools, and shareable public links.',
  path: '/editor',
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
      url: `${siteConfig.public.siteUrl}/editor`,
      description: 'Interactive Nuxt UI palette builder with previews, token editing, export, and sharing.',
    },
  ],
})

const { currentPalette } = usePaletteState()
const { restorePaletteForEditor } = useLandingPaletteWorkflow()
usePaletteRuntimeUi({
  palette: currentPalette,
})

const disableInteractivePreviews = ref(false)

const activeEditorPalette = computed(() => currentPalette.value ?? emptyPalette)
const activeEditorMode = computed(() => {
  return colorMode.value === 'dark' ? 'dark' : 'light'
})

const editorTheme = computed<Record<string, string>>(() => {
  return buildPaletteRuntimeTheme(activeEditorPalette.value, activeEditorMode.value)
})

const documentThemeSnapshot = import.meta.client
  ? new Map<string, string>()
  : null

if (import.meta.client && documentThemeSnapshot) {
  watch(editorTheme, (nextTheme) => {
    for (const key of Object.keys(nextTheme)) {
      if (!documentThemeSnapshot.has(key)) {
        documentThemeSnapshot.set(key, document.documentElement.style.getPropertyValue(key))
      }

      document.documentElement.style.setProperty(key, nextTheme[key] ?? null)
    }
  }, { immediate: true })

  onBeforeUnmount(() => {
    for (const [key, value] of documentThemeSnapshot.entries()) {
      if (value) {
        document.documentElement.style.setProperty(key, value)
        continue
      }

      document.documentElement.style.removeProperty(key)
    }
  })
}

watch(() => route.query.checkout, async (value) => {
  if (value !== 'success') {
    return
  }

  toast.add({
    title: 'Plan activated',
    description: 'Your billing plan is active. You can start generating palettes now.',
    color: 'success',
  })

  await router.replace({ query: { ...route.query, checkout: undefined } })
}, { immediate: true })

if (import.meta.client) {
  onMounted(() => {
    if (route.query.source === 'landing') {
      restorePaletteForEditor()
    }

    watch(() => route.query.source, (value, previousValue) => {
      if (value === 'landing' && previousValue !== 'landing') {
        restorePaletteForEditor()
      }
    })
  })
}
</script>

<template>
  <UDashboardGroup>
    <SidebarLeft />

    <UDashboardPanel>
      <template #header>
        <Navigation />
      </template>

      <template #body>
        <PreviewPanel :palette="currentPalette" :disable-interactive="disableInteractivePreviews" />
      </template>
    </UDashboardPanel>

    <SidebarRight />
  </UDashboardGroup>
</template>
