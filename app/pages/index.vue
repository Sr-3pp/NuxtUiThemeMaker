<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const toast = useToast()
const siteConfig = useRuntimeConfig()

usePageSeo({
  title: 'Build and Share Nuxt UI Themes',
  description: 'Create Nuxt UI color palettes with live previews, token editing, export tools, and shareable public links.',
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
      description: 'Interactive Nuxt UI palette builder with previews, token editing, export, and sharing.',
    },
  ],
})

const { currentPalette } = usePaletteState()

const disableInteractivePreviews = ref(false)

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
</script>

<template>
  <UDashboardGroup>
    <SidebarLeft />
    <PaletteLibraryDrawers />

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
