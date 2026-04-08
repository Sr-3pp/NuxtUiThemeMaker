<script setup lang="ts">
import type { ThemeQaPanelProps } from '~/types/theme-qa'

defineProps<ThemeQaPanelProps>()

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <UModal
    v-model:open="open"
    title="Theme QA Report"
    description="Review accessibility, token integrity, focus visibility, and publish readiness before export or publish."
    :ui="{ content: 'sm:max-w-4xl' }"
  >
    <template #body>
      <ThemeQaPanel :palette="palette" />
    </template>
  </UModal>
</template>
