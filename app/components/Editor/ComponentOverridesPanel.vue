<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import type { UpdatePaletteComponentTokenPayload } from '~/types/theme-builder'

const props = defineProps<{
  palette: PaletteDefinition
}>()

const emit = defineEmits<{
  'update-component-token': [payload: UpdatePaletteComponentTokenPayload]
}>()
</script>

<template>
  <EditorComponentOverridesWorkspace
    mode="states"
    :palette="props.palette"
    @update-component-token="emit('update-component-token', $event)"
  />
</template>
