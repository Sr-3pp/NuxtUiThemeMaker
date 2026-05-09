<script setup lang="ts">
import { panelExitItems, panelSectionItems } from '~/utils/panel-navigation'

const props = defineProps<{
  currentPath?: string
}>()

const route = useRoute()
const activePath = computed(() => props.currentPath ?? route.path)

function isActive(to: string) {
  return activePath.value === to
}
</script>

<template>
  <nav class="border-b border-default bg-default/80 backdrop-blur">
    <UContainer class="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex min-w-0 flex-wrap items-center gap-2">
        <UButton
          v-for="item in panelSectionItems"
          :key="item.to"
          :to="item.to"
          :icon="item.icon"
          :color="isActive(item.to) ? 'primary' : 'neutral'"
          :variant="isActive(item.to) ? 'soft' : 'ghost'"
          size="sm"
        >
          {{ item.label }}
        </UButton>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <UButton
          v-for="item in panelExitItems"
          :key="item.to"
          :to="item.to"
          :icon="item.icon"
          color="neutral"
          variant="outline"
          size="sm"
        >
          {{ item.label }}
        </UButton>
      </div>
    </UContainer>
  </nav>
</template>
