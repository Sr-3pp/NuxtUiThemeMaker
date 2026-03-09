<script setup lang="ts">
defineProps<{
  disableInteractive: boolean
}>()
</script>

<template>
  <div class="space-y-8 pt-6">
    <div class="space-y-2">
      <div class="flex flex-wrap items-center gap-2">
        <UBadge color="primary" variant="soft" label="Palette preview" />
        <UBadge color="neutral" variant="outline" :label="disableInteractive ? 'Interactive controls disabled' : 'Interactive controls enabled'" />
      </div>
      <h2 class="text-2xl font-semibold tracking-tight text-highlighted">
        Curated Nuxt UI component gallery
      </h2>
      <p class="max-w-3xl text-sm leading-6 text-muted">
        This gallery keeps the preview broad enough to judge semantic color balance, contrast, focus treatment,
        surface layering and disabled states without trying to mirror the full Nuxt UI docs surface area.
      </p>
    </div>

    <ThemePreviewActions :disable-interactive="disableInteractive" />
    <ThemePreviewForms :disable-interactive="disableInteractive" />
    <ThemePreviewFeedback :disable-interactive="disableInteractive" />
    <ThemePreviewSurfaces />
    <ThemePreviewNavigation :disable-interactive="disableInteractive" />
    <ThemePreviewDataDisplay />
    <ThemePreviewOverlays :disable-interactive="disableInteractive" />
  </div>
</template>
