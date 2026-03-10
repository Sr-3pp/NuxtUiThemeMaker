<script setup lang="ts">
import { z } from 'zod'
import type { PaletteDefinition } from '~/types/palette'
import type { PaletteEditorDrawerEmits, PaletteEditorDrawerProps } from '~/types/palette-components'
import { clonePalette } from '~/utils/palette'

const props = defineProps<PaletteEditorDrawerProps>()

const emit = defineEmits<PaletteEditorDrawerEmits>()

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
})

const paletteSchema = z.object({
  name: z.string().trim().min(1, 'Palette name is required'),
  modes: z.object({
    light: z.record(z.string(), z.record(z.string(), z.union([z.string().trim().min(1, 'Color value is required'), z.null()]))),
    dark: z.record(z.string(), z.record(z.string(), z.union([z.string().trim().min(1, 'Color value is required'), z.null()])))
  })
})

const formState = reactive<PaletteDefinition>(clonePalette(props.palette))
let isSyncingFromProps = false

const modeItems = [
  { label: 'Light mode', value: 'light', slot: 'light' },
  { label: 'Dark mode', value: 'dark', slot: 'dark' }
]

function resetForm() {
  isSyncingFromProps = true
  Object.assign(formState, clonePalette(props.palette))
  queueMicrotask(() => {
    isSyncingFromProps = false
  })
}

watch(() => props.open, (open) => {
  if (open) {
    resetForm()
  }
})

watch(() => props.palette, () => {
  if (!props.open) {
    resetForm()
  }
}, { deep: true })

watch(formState, (value) => {
  if (!props.open || isSyncingFromProps) {
    return
  }

  emit('save', clonePalette(value as PaletteDefinition))
}, { deep: true })
</script>

<template>
  <UDrawer
    v-model:open="isOpen"
    direction="right"
    :handle="false"
    should-scale-background
    title="Edit Palette"
    description="Update the selected palette with schema-validated values."
  >
    <template #body>
      <UForm
        :schema="paletteSchema"
        :state="formState"
        class="space-y-6 p-1"
      >
        <UFormField
          label="Palette name"
          name="name"
          description="This name is used in the editor state only."
          required
        >
          <UInput
            v-model="formState.name"
            color="primary"
            variant="outline"
            placeholder="Palette name"
          />
        </UFormField>

        <UTabs
          :items="modeItems"
          :default-value="props.defaultMode ?? 'light'"
          variant="pill"
          color="primary"
          class="space-y-4"
        >
          <template #light>
            <PaletteModeFields mode="light" :form-state="formState" placeholder="#0f172a" />
          </template>

          <template #dark>
            <PaletteModeFields mode="dark" :form-state="formState" placeholder="#020617" />
          </template>
        </UTabs>

        <div class="sticky bottom-0 flex items-center justify-end gap-3 border-t border-default bg-default/95 px-1 py-4 backdrop-blur">
          <UButton color="neutral" variant="ghost" type="button" @click="resetForm">
            Reset
          </UButton>
          <UButton color="neutral" variant="outline" type="button" @click="isOpen = false">
            Cancel
          </UButton>
        </div>
      </UForm>
    </template>
  </UDrawer>
</template>
