<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import type { UpdatePaletteComponentTokenPayload } from '~/types/theme-builder'

const props = defineProps<{
  palette: PaletteDefinition
}>()

const emit = defineEmits<{
  'update-component-token': [payload: UpdatePaletteComponentTokenPayload]
}>()

const buttonPrimarySolid = computed(() => props.palette.components?.button?.variants?.solid?.primary ?? {})
const inputBase = computed(() => props.palette.components?.input?.base ?? {})

function updateButtonPrimarySolid(token: string, value: string | number | undefined) {
  emit('update-component-token', {
    component: 'button',
    area: 'variant',
    variant: 'solid',
    variantColor: 'primary',
    token,
    value: typeof value === 'string' || typeof value === 'number' ? String(value).trim() || null : null,
  })
}

function updateInputBase(token: string, value: string | number | undefined) {
  emit('update-component-token', {
    component: 'input',
    area: 'base',
    token,
    value: typeof value === 'string' || typeof value === 'number' ? String(value).trim() || null : null,
  })
}
</script>

<template>
  <UCard variant="outline" class="rounded-2xl shadow-none dark:border-white/10 dark:bg-black/40">
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-medium dark:text-white">
          Component overrides
        </p>
        <p class="text-xs text-muted">
          First editable override surface. This writes to the normalized component theme schema and ships in exports.
        </p>
      </div>
    </template>

    <div class="space-y-5">
      <div class="space-y-3 rounded-xl border border-default/60 bg-muted/20 p-3">
        <div>
          <p class="text-sm font-medium">
            Button: solid primary
          </p>
          <p class="text-xs text-muted">
            Basic token overrides for a common high-impact variant.
          </p>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <UFormField label="Background">
            <UInput
              :model-value="buttonPrimarySolid.bg ?? ''"
              placeholder="var(--ui-primary)"
              @update:model-value="updateButtonPrimarySolid('bg', $event)"
            />
          </UFormField>

          <UFormField label="Text">
            <UInput
              :model-value="buttonPrimarySolid.text ?? ''"
              placeholder="var(--ui-bg)"
              @update:model-value="updateButtonPrimarySolid('text', $event)"
            />
          </UFormField>

          <UFormField label="Border">
            <UInput
              :model-value="buttonPrimarySolid.border ?? ''"
              placeholder="transparent"
              @update:model-value="updateButtonPrimarySolid('border', $event)"
            />
          </UFormField>

          <UFormField label="Ring">
            <UInput
              :model-value="buttonPrimarySolid.ring ?? ''"
              placeholder="var(--ui-primary)"
              @update:model-value="updateButtonPrimarySolid('ring', $event)"
            />
          </UFormField>
        </div>
      </div>

      <div class="space-y-3 rounded-xl border border-default/60 bg-muted/20 p-3">
        <div>
          <p class="text-sm font-medium">
            Input: base
          </p>
          <p class="text-xs text-muted">
            Shared input surface tokens to seed the component override model.
          </p>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <UFormField label="Background">
            <UInput
              :model-value="inputBase.bg ?? ''"
              placeholder="var(--ui-bg-elevated)"
              @update:model-value="updateInputBase('bg', $event)"
            />
          </UFormField>

          <UFormField label="Text">
            <UInput
              :model-value="inputBase.text ?? ''"
              placeholder="var(--ui-text)"
              @update:model-value="updateInputBase('text', $event)"
            />
          </UFormField>

          <UFormField label="Border">
            <UInput
              :model-value="inputBase.border ?? ''"
              placeholder="var(--ui-border)"
              @update:model-value="updateInputBase('border', $event)"
            />
          </UFormField>

          <UFormField label="Ring">
            <UInput
              :model-value="inputBase.ring ?? ''"
              placeholder="var(--ui-ring)"
              @update:model-value="updateInputBase('ring', $event)"
            />
          </UFormField>
        </div>
      </div>
    </div>
  </UCard>
</template>
