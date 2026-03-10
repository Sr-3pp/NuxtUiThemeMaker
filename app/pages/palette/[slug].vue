<script setup lang="ts">
import type { StoredPalette } from '~/types/palette-store'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const requestHeaders = import.meta.server ? useRequestHeaders(['cookie']) : undefined

const { data: palette, error } = await useAsyncData(
  () => `palette-${slug.value}`,
  () => $fetch<StoredPalette>(`/api/palettes/slug/${slug.value}`, {
    headers: requestHeaders,
  })
)

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode ?? 404,
    statusMessage: error.value.statusMessage ?? 'Palette not found',
  })
}
</script>

<template>
  <UMain>
    <header class="border-b border-white/10 bg-black/95 px-4 py-4">
      <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-[0.16em] text-white/45">
            Shareable Palette
          </p>
          <h1 class="text-2xl font-semibold text-white">
            {{ palette?.name }}
          </h1>
          <p class="text-sm text-white/55">
            {{ palette?.slug }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UBadge :color="palette?.isPublic ? 'primary' : 'neutral'" variant="soft">
            {{ palette?.isPublic ? 'Public' : 'Private owner view' }}
          </UBadge>
          <UColorModeSwitch />
          <UButton to="/" color="neutral" variant="outline">
            Open Builder
          </UButton>
        </div>
      </div>
    </header>

    <div class="min-h-[calc(100vh-89px)] px-4 py-6">
      <UDashboardPanel>
        <ClientOnly>
          <ThemePreviewPanel :palette="palette?.palette ?? null" />
        </ClientOnly>
      </UDashboardPanel>
    </div>
  </UMain>
</template>
