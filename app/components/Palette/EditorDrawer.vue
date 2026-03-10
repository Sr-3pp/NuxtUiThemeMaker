<script setup lang="ts">
import { z } from 'zod'
import type { PaletteDefinition, PaletteModeKey, PaletteTokenGroup } from '~/types/palette'
import { clonePalette } from '~/utils/palette'

const props = defineProps<{
  open: boolean
  palette: PaletteDefinition
  defaultMode?: PaletteModeKey
}>()

const emit = defineEmits<{
  save: [palette: PaletteDefinition]
  'update:open': [value: boolean]
}>()

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

type PaletteFormState = z.infer<typeof paletteSchema>

const formState = reactive<PaletteFormState>(clonePalette(props.palette))
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

function formatLabel(value: string) {
  return value.replace(/-/g, ' ')
}

function sectionEntries(mode: PaletteModeKey) {
  return Object.entries(formState.modes[mode]) as Array<[string, PaletteTokenGroup]>
}

function getTokenValue(tokens: PaletteTokenGroup, tokenKey: string) {
  return tokens[tokenKey] ?? ''
}

function updateTokenValue(tokens: PaletteTokenGroup, tokenKey: string, value: string | number) {
  const nextValue = String(value).trim()
  tokens[tokenKey] = nextValue.length > 0 ? nextValue : null
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
            <div class="space-y-4">
              <UAlert
                v-if="sectionEntries('light').length === 0"
                color="neutral"
                variant="outline"
                title="No light mode tokens"
                description="Add sections to the source palette JSON if you want editable light mode tokens here."
              />

              <UCard
                v-for="[sectionKey, tokens] in sectionEntries('light')"
                :key="`light-${sectionKey}`"
                variant="outline"
              >
                <template #header>
                  <div class="space-y-1">
                    <p class="text-sm font-medium capitalize text-highlighted">
                      {{ formatLabel(sectionKey) }}
                    </p>
                    <p class="text-sm text-muted">
                      {{ Object.keys(tokens).length }} tokens
                    </p>
                  </div>
                </template>

                <div class="grid gap-4 sm:grid-cols-2">
                  <UFormField
                    v-for="tokenKey in Object.keys(tokens)"
                    :key="`light-${sectionKey}-${tokenKey}`"
                    :label="formatLabel(tokenKey)"
                    :name="`modes.light.${sectionKey}.${tokenKey}`"
                    required
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="h-10 w-10 shrink-0 rounded-md border border-default bg-default"
                        :style="{ backgroundColor: tokens[tokenKey] ?? 'transparent' }"
                      />
                      <UInput
                        :model-value="getTokenValue(tokens, tokenKey)"
                        color="primary"
                        variant="outline"
                        placeholder="#0f172a"
                        @update:model-value="updateTokenValue(tokens, tokenKey, $event)"
                      />
                    </div>
                  </UFormField>
                </div>
              </UCard>
            </div>
          </template>

          <template #dark>
            <div class="space-y-4">
              <UAlert
                v-if="sectionEntries('dark').length === 0"
                color="neutral"
                variant="outline"
                title="No dark mode tokens"
                description="Add sections to the source palette JSON if you want editable dark mode tokens here."
              />

              <UCard
                v-for="[sectionKey, tokens] in sectionEntries('dark')"
                :key="`dark-${sectionKey}`"
                variant="outline"
              >
                <template #header>
                  <div class="space-y-1">
                    <p class="text-sm font-medium capitalize text-highlighted">
                      {{ formatLabel(sectionKey) }}
                    </p>
                    <p class="text-sm text-muted">
                      {{ Object.keys(tokens).length }} tokens
                    </p>
                  </div>
                </template>

                <div class="grid gap-4 sm:grid-cols-2">
                  <UFormField
                    v-for="tokenKey in Object.keys(tokens)"
                    :key="`dark-${sectionKey}-${tokenKey}`"
                    :label="formatLabel(tokenKey)"
                    :name="`modes.dark.${sectionKey}.${tokenKey}`"
                    required
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="h-10 w-10 shrink-0 rounded-md border border-default bg-default"
                        :style="{ backgroundColor: tokens[tokenKey] ?? 'transparent' }"
                      />
                      <UInput
                        :model-value="getTokenValue(tokens, tokenKey)"
                        color="primary"
                        variant="outline"
                        placeholder="#020617"
                        @update:model-value="updateTokenValue(tokens, tokenKey, $event)"
                      />
                    </div>
                  </UFormField>
                </div>
              </UCard>
            </div>
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
