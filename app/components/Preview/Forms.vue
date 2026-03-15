<script setup lang="ts">
import type { PreviewInteractiveProps } from '~/types/theme-preview'

const props = defineProps<PreviewInteractiveProps>()

const inputValue = ref('Oceanic neutral')
const notesValue = ref('Check focus rings, placeholder contrast and muted text inside filled fields.')
const selectValue = ref('balanced')
const radioValue = ref('balanced')
const checked = ref(true)
const switchValue = ref(true)
const sliderValue = ref(58)

const densityItems = [
  { label: 'Balanced', value: 'balanced', description: 'General-purpose spacing and contrast.' },
  { label: 'Compact', value: 'compact', description: 'Tighter layout with lighter visual weight.' },
  { label: 'Bold', value: 'bold', description: 'Higher emphasis and stronger field presence.' }
]

const selectItems = [
  { label: 'Balanced', value: 'balanced', description: 'Default palette inspection mode' },
  { label: 'Editorial', value: 'editorial', description: 'Sharper hierarchy for reading-heavy UI' },
  { label: 'Playful', value: 'playful', description: 'Brighter accents and softer surfaces' }
]
</script>

<template>
  <section class="space-y-4">
    <div class="space-y-1">
      <h3 class="text-lg font-semibold text-highlighted">
        Forms
      </h3>
      <p class="text-sm text-muted">
        Focus, placeholder, error, disabled and selection states across the main input controls.
      </p>
    </div>

    <div class="grid gap-6 xl:grid-cols-2">
      <UCard variant="outline">
        <template #header>
          <p class="text-sm font-medium text-highlighted">Inputs and selection fields</p>
        </template>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Default input
            </p>
            <UInput
              v-model="inputValue"
              color="primary"
              variant="outline"
              highlight
              placeholder="Theme name"
              leading-icon="i-lucide-palette"
              :disabled="props.disableInteractive"
            />
            <p class="text-xs text-muted">Highlighted ring makes focus treatment easier to compare.</p>
          </div>

          <div class="space-y-2">
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Placeholder
            </p>
            <UInput
              color="neutral"
              variant="subtle"
              placeholder="Search tokens, aliases or ramps"
              trailing-icon="i-lucide-search"
              :disabled="props.disableInteractive"
            />
            <p class="text-xs text-muted">Empty state checks placeholder and trailing icon legibility.</p>
          </div>

          <div class="space-y-2">
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Error state
            </p>
            <UInput
              model-value="Missing contrast token"
              color="error"
              variant="outline"
              highlight
              :disabled="props.disableInteractive"
            />
            <p class="text-xs text-error">Contrast ratio is below the target for body copy.</p>
          </div>

          <div class="space-y-2">
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Disabled
            </p>
            <USelect
              model-value="playful"
              :items="selectItems"
              color="neutral"
              variant="outline"
              disabled
            />
            <p class="text-xs text-muted">Disabled controls should still read clearly against muted surfaces.</p>
          </div>

          <div class="space-y-2 md:col-span-2">
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Textarea
            </p>
            <UTextarea
              v-model="notesValue"
              color="secondary"
              variant="subtle"
              :rows="4"
              :disabled="props.disableInteractive"
            />
            <p class="text-xs text-muted">Long-form text helps expose line-height, border and background balance.</p>
          </div>

          <div class="space-y-2">
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Select
            </p>
            <USelect
              v-model="selectValue"
              :items="selectItems"
              color="info"
              variant="outline"
              highlight
              :disabled="props.disableInteractive"
            />
            <p class="text-xs text-muted">Menu trigger surface and caret contrast.</p>
          </div>

          <div class="space-y-2">
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Slider
            </p>
            <USlider
              v-model="sliderValue"
              color="primary"
              :max="100"
              :disabled="props.disableInteractive"
            />
            <div class="flex items-center justify-between text-xs text-muted">
              <span>Subtle</span>
              <span>{{ sliderValue }}%</span>
              <span>Vivid</span>
            </div>
          </div>
        </div>
      </UCard>

      <UCard variant="outline">
        <template #header>
          <p class="text-sm font-medium text-highlighted">Choices and toggles</p>
        </template>

        <div class="space-y-5">
          <div class="space-y-2">
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Radio group
            </p>
            <URadioGroup
              v-model="radioValue"
              legend="Density profile"
              color="primary"
              :items="densityItems"
              :disabled="props.disableInteractive"
            />
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-3 rounded-2xl border border-default bg-muted/50 p-4">
              <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                Checkbox
              </p>
              <UCheckbox
                v-model="checked"
                color="secondary"
                label="Preview feedback components"
                description="Check contrast of labels and descriptions."
                :disabled="props.disableInteractive"
              />
              <UCheckbox
                :model-value="false"
                color="neutral"
                label="Disabled option"
                description="Inactive controls still need enough contrast."
                disabled
              />
            </div>

            <div class="space-y-3 rounded-2xl border border-default bg-muted/50 p-4">
              <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                Switches
              </p>
              <USwitch
                v-model="switchValue"
                color="success"
                label="Use semantic highlights"
                description="Toggles accent usage inside cards."
                :disabled="props.disableInteractive"
              />
              <USwitch
                :model-value="false"
                color="neutral"
                label="Disabled switch"
                description="Check track and label legibility."
                disabled
              />
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </section>
</template>
