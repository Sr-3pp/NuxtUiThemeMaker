<script setup lang="ts">
import type { EditorTab } from '~/types/theme-builder'

const props = withDefaults(defineProps<{
  isWorking?: boolean
  showTitle?: boolean
  tab: EditorTab
}>(), {
  isWorking: false,
  showTitle: true,
})

const emit = defineEmits<{
  save: []
  saveAsNew: []
}>()

const saveItems = computed(() => [[
  {
    label: 'Save',
    icon: 'i-lucide-save',
    disabled: props.isWorking,
    onSelect: () => emit('save')
  },
  {
    label: 'Save As New',
    icon: 'i-lucide-save-all',
    disabled: props.isWorking,
    onSelect: () => emit('saveAsNew')
  }
]])
</script>

<template>
  <div class="flex items-center justify-between gap-3">
    <p v-if="props.showTitle" class="text-sm font-medium dark:text-white">
      {{ props.tab === 'export' ? 'Export Palette' : 'Theme Editor' }}
    </p>

    <UDropdownMenu :items="saveItems">
      <UButton
        type="button"
        color="primary"
        class="bg-[#4cd964] text-black hover:bg-[#65e27c]"
        :loading="props.isWorking"
        trailing-icon="i-lucide-chevron-down"
      >
        <UIcon name="i-lucide-save" class="h-4 w-4" />
        Save
      </UButton>
    </UDropdownMenu>
  </div>
</template>
