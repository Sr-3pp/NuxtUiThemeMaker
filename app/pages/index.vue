<script setup lang="ts">
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

const { togglePalettesSidebar, toggleEditorSidebar } = useSidebar()

const disableInteractivePreviews = ref(false)
</script>

<template>
  <UDashboardGroup>
    <SidebarLeft />

    <UDashboardPanel>
      <template #header>
        <div class="flex gap-4 justify-between p-2 sm:p-4">
          <UButton
            class="sm:hidden" 
            @click="togglePalettesSidebar()"
          >
            <UIcon name="i-lucide:layout-list" />
          </UButton>

          <div class="flex min-w-0 gap-2">
            <span class="rounded-sm bg-primary size-6 flex items-center justify-center">
               <UIcon name="i-lucide:palette" class="text-black" />
            </span>
            <div class="min-w-0">
              <p class="font-bold flex flex-wrap gap-2 sm:gap-4">
                <span>Nuxt UI Theme Builder</span> | <span class="text-muted">Palette: </span> {{ currentPalette?.name }}
              </p>
              <p class="text-xs text-muted">
                Created by Sr.3pp
              </p>
            </div>
          </div>

          <UColorModeSwitch />
          
          
          <UButton 
            class="sm:hidden" 
            @click="toggleEditorSidebar()"
          >
            <UIcon name="i-lucide:palette" />
          </UButton>
        </div>
      </template>

      <template #body>
        <PreviewPanel :palette="currentPalette" :disable-interactive="disableInteractivePreviews" />
      </template>

    </UDashboardPanel>

    <SidebarRight />
  </UDashboardGroup>
</template>
