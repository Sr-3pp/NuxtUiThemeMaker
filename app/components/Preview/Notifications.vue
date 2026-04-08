<script setup lang="ts">
import type { PreviewInteractiveProps } from '~/types/theme-preview'

defineProps<PreviewInteractiveProps>()

const notifications = [
  {
    title: 'Palette saved',
    description: 'The current theme was stored successfully and is ready for export.',
    icon: 'i-lucide-check-circle-2',
    color: 'success',
  },
  {
    title: 'Contrast warning',
    description: 'Muted copy on elevated surfaces is close to the accessibility threshold.',
    icon: 'i-lucide-triangle-alert',
    color: 'warning',
  },
  {
    title: 'Preview synced',
    description: 'Live workbench updates were applied to all preview sections.',
    icon: 'i-lucide-bell-ring',
    color: 'info',
  },
] as const
</script>

<template>
  <section class="space-y-4">
    <PreviewSectionIntro
      title="Notifications"
      description="Toast-style messaging for status confirmation, warnings and lightweight operational feedback."
    />

    <PreviewCard title="Toast stack">
      <div class="space-y-3 rounded-3xl border border-default bg-muted/30 p-4">
        <UToast
          v-for="notification in notifications"
          :key="notification.title"
          :title="notification.title"
          :description="notification.description"
          :icon="notification.icon"
          :color="notification.color"
          :close="false"
          :progress="false"
          orientation="horizontal"
          open
          class="relative inset-auto translate-x-0 translate-y-0"
        />
      </div>
    </PreviewCard>
  </section>
</template>
