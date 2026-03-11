<script setup lang="ts">
import type { PalettePresetSidebarProps } from '~/types/palette-components'

const props = defineProps<PalettePresetSidebarProps>()
</script>

<template>
  <UDashboardPanel
    :ui="{
      root: 'h-screen overflow-auto pt-25',
      body: 'block'
    }"
  >
    <template #header>
      <UDashboardNavbar title="Theme Presets">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <PalettePresetSidebarContent
        v-bind="props"
        @select="$emit('select', $event)"
        @select-owned-palette="$emit('selectOwnedPalette', $event)"
        @update:search="$emit('update:search', $event)"
      />
    </template>
  </UDashboardPanel>
</template>
