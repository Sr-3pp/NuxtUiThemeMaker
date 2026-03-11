<script setup lang="ts">
import type { ThemeWorkbenchEditorEmits, ThemeWorkbenchEditorProps } from '~/types/theme-builder'

const props = defineProps<ThemeWorkbenchEditorProps>()
defineEmits<ThemeWorkbenchEditorEmits>()
</script>

<template>
  <UDashboardPanel
    :ui="{
      root: 'h-screen overflow-auto pt-25',
      body: 'block'
    }"
  >
    <template #header>
      <UDashboardNavbar 
        :title="props.tab === 'export' ? 'Export Palette' : 'Theme Editor'"
        :ui="{
          left: 'justify-between w-full',
        }"
      >
        <template #trailing>
          <ThemeWorkbenchEditorToolbar
            :tab="props.tab"
            :is-working="props.isWorking"
            :show-title="false"
            @save="$emit('save')"
            @save-as-new="$emit('saveAsNew')"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <ThemeWorkbenchEditorContent
        v-bind="props"
        @save="$emit('save')"
        @save-as-new="$emit('saveAsNew')"
        @update:tab="$emit('update:tab', $event)"
        @update-token="$emit('update-token', $event)"
      />
    </template>
  </UDashboardPanel>
</template>
