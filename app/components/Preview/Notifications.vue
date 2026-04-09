<script setup lang="ts">
import type { PreviewInteractiveProps } from '~/types/theme-preview'

defineProps<PreviewInteractiveProps>()

const notifications = [
  {
    title: 'Palette saved',
    description: 'The current theme was stored successfully and is ready for export.',
    icon: 'i-lucide-check-circle-2',
    color: 'success',
    accentClass: 'bg-success/10 text-success',
  },
  {
    title: 'Contrast warning',
    description: 'Muted copy on elevated surfaces is close to the accessibility threshold.',
    icon: 'i-lucide-triangle-alert',
    color: 'warning',
    accentClass: 'bg-warning/10 text-warning',
  },
  {
    title: 'Preview synced',
    description: 'Live workbench updates were applied to all preview sections.',
    icon: 'i-lucide-bell-ring',
    color: 'info',
    accentClass: 'bg-info/10 text-info',
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
        <div
          v-for="notification in notifications"
          :key="notification.title"
          class="rounded-lg border border-default bg-default shadow-sm"
        >
          <div class="flex items-start gap-3 p-4">
            <span
              class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full"
              :class="notification.accentClass"
            >
              <UIcon :name="notification.icon" class="size-4" />
            </span>

            <div class="min-w-0 flex-1 space-y-1">
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium text-highlighted">
                  {{ notification.title }}
                </p>
                <UBadge :color="notification.color" variant="soft" size="sm">
                  {{ notification.color }}
                </UBadge>
              </div>

              <p class="text-sm text-muted">
                {{ notification.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PreviewCard>
  </section>
</template>
