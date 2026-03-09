<script setup lang="ts">
import type { AlertProps, ButtonProps, CardProps } from '@nuxt/ui'
import type {
  ChoiceItem,
  ComponentMatrixItem,
  ContentItem,
  ExtendedSemanticColorName,
  SelectItem
} from '~/types/theme-showcase'

type ButtonVariant = NonNullable<ButtonProps['variant']>
type AlertVariant = NonNullable<AlertProps['variant']>
type CardVariant = NonNullable<CardProps['variant']>

const props = defineProps<{
  componentMatrix: ComponentMatrixItem[]
  componentTabs: ContentItem[]
  buttonColors: ExtendedSemanticColorName[]
  buttonVariants: readonly ButtonVariant[]
  alertVariants: readonly AlertVariant[]
  cardVariants: readonly CardVariant[]
  accordionItems: ContentItem[]
  selectItems: SelectItem[]
  radioItems: ChoiceItem[]
  checkboxItems: ChoiceItem[]
  disableInteractive: boolean
}>()

const selectedPreset = ref('studio')
const selectedDensity = ref('balanced')
const enabledAreas = ref(['alerts', 'forms'])
const previewInput = ref('Oceanic neutral')
const previewNotes = ref('Check semantic hierarchy, focus treatment and muted copy inside real Nuxt UI components.')
</script>

<template>
  <div class="space-y-6 pt-6">
    <div class="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <UCard variant="outline">
        <template #header>
          <div class="space-y-1">
            <p class="text-sm font-medium text-highlighted">Component coverage matrix</p>
            <p class="text-sm text-muted">Real Nuxt UI primitives used by the showcase.</p>
          </div>
        </template>

        <UTable
          :data="props.componentMatrix"
          :columns="[
            { accessorKey: 'component', header: 'Component' },
            { accessorKey: 'coverage', header: 'Coverage' },
            { accessorKey: 'surface', header: 'Theme area' }
          ]"
        />
      </UCard>

      <UCard variant="soft">
        <template #header>
          <div class="space-y-1">
            <p class="text-sm font-medium text-highlighted">Status badges</p>
            <p class="text-sm text-muted">Quick semantic sweep.</p>
          </div>
        </template>

        <div class="flex flex-wrap gap-2">
          <UBadge color="primary" variant="solid" label="primary" />
          <UBadge color="secondary" variant="solid" label="secondary" />
          <UBadge color="success" variant="solid" label="success" />
          <UBadge color="info" variant="solid" label="info" />
          <UBadge color="warning" variant="solid" label="warning" />
          <UBadge color="error" variant="solid" label="error" />
          <UBadge color="neutral" variant="outline" label="neutral" />
        </div>

        <div class="mt-4 flex items-center gap-3">
          <UAvatarGroup>
            <UAvatar alt="AM" />
            <UAvatar alt="JT" />
            <UAvatar alt="SK" />
          </UAvatarGroup>
          <p class="text-sm text-muted">Avatar contrast and ring stacking</p>
        </div>
      </UCard>
    </div>

    <UTabs :items="props.componentTabs" variant="pill" color="primary">
      <template #buttons>
        <div class="space-y-6">
          <UCard variant="outline">
            <template #header>
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-medium text-highlighted">Buttons by color and variant</p>
                  <p class="text-sm text-muted">Each row is a semantic color, each column a Nuxt UI variant.</p>
                </div>
                <UBadge color="neutral" variant="outline" :label="props.disableInteractive ? 'Disabled' : 'Active'" />
              </div>
            </template>

            <div class="space-y-4">
              <div
                v-for="color in props.buttonColors"
                :key="`button-row-${color}`"
                class="grid gap-3 lg:grid-cols-[120px_repeat(6,minmax(0,1fr))]"
              >
                <div class="flex items-center">
                  <UBadge :color="color" variant="soft" class="capitalize">
                    {{ color }}
                  </UBadge>
                </div>

                <UButton
                  v-for="variant in props.buttonVariants"
                  :key="`${color}-${variant}`"
                  :color="color"
                  :variant="variant"
                  :disabled="props.disableInteractive"
                  class="justify-center"
                >
                  {{ variant }}
                </UButton>
              </div>
            </div>
          </UCard>

          <div class="grid gap-6 xl:grid-cols-2">
            <UCard variant="outline">
              <template #header>
                <p class="text-sm font-medium text-highlighted">Alerts</p>
              </template>

              <div class="space-y-3">
                <UAlert
                  v-for="variant in props.alertVariants"
                  :key="variant"
                  color="info"
                  :variant="variant"
                  title="Theme feedback"
                  :description="`UAlert variant: ${variant}`"
                />
              </div>
            </UCard>

            <UCard variant="outline">
              <template #header>
                <p class="text-sm font-medium text-highlighted">Cards</p>
              </template>

              <div class="grid gap-3 sm:grid-cols-2">
                <UCard
                  v-for="variant in props.cardVariants"
                  :key="variant"
                  :variant="variant"
                >
                  <p class="text-sm font-medium">{{ variant }}</p>
                  <p class="mt-2 text-sm opacity-80">
                    UCard surface preview for {{ variant }}.
                  </p>
                </UCard>
              </div>
            </UCard>
          </div>
        </div>
      </template>

      <template #forms>
        <div class="grid gap-6 xl:grid-cols-2">
          <UCard variant="outline">
            <template #header>
              <p class="text-sm font-medium text-highlighted">Form controls</p>
            </template>

            <div class="space-y-4">
              <UInput
                v-model="previewInput"
                color="primary"
                variant="outline"
                highlight
                placeholder="Theme name"
                :disabled="props.disableInteractive"
              />

              <UTextarea
                v-model="previewNotes"
                color="secondary"
                variant="subtle"
                :disabled="props.disableInteractive"
              />

              <USelect
                v-model="selectedPreset"
                :items="props.selectItems"
                color="info"
                variant="outline"
                placeholder="Preset"
                :disabled="props.disableInteractive"
              />
            </div>
          </UCard>

          <UCard variant="outline">
            <template #header>
              <p class="text-sm font-medium text-highlighted">Choices</p>
            </template>

            <div class="space-y-5">
              <URadioGroup
                v-model="selectedDensity"
                legend="Density"
                color="primary"
                :items="props.radioItems"
                :disabled="props.disableInteractive"
              />

              <UCheckboxGroup
                v-model="enabledAreas"
                legend="Focus preview areas"
                color="secondary"
                :items="props.checkboxItems"
                :disabled="props.disableInteractive"
              />
            </div>
          </UCard>
        </div>
      </template>

      <template #data>
        <div class="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div class="space-y-6">
            <UCard variant="outline">
              <template #header>
                <p class="text-sm font-medium text-highlighted">Progress</p>
              </template>

              <div class="space-y-4">
                <UProgress :model-value="28" color="primary" status />
                <UProgress :model-value="52" color="success" status />
                <UProgress :model-value="76" color="warning" status />
              </div>
            </UCard>

            <UCard variant="outline">
              <template #header>
                <p class="text-sm font-medium text-highlighted">Accordion</p>
              </template>

              <UAccordion
                :items="props.accordionItems"
                type="multiple"
                :default-value="['aliases']"
              />
            </UCard>
          </div>

          <UCard variant="outline">
            <template #header>
              <p class="text-sm font-medium text-highlighted">Navigation tabs</p>
            </template>

            <UTabs
              :items="[
                { label: 'Overview', content: 'Use Overview to judge hierarchy, copy color and container balance.' },
                { label: 'Surfaces', content: 'Surfaces exposes background, border and ring interplay in the same layout.' },
                { label: 'States', content: 'States makes disabled, active and focused treatments obvious.' }
              ]"
              color="secondary"
              variant="pill"
            />
          </UCard>
        </div>
      </template>
    </UTabs>
  </div>
</template>
