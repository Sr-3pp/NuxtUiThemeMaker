<script setup lang="ts">
const props = defineProps<{
  cta?: { label: string, to: string } | null
  errorMessage?: string | null
  helperText?: string
  isLoading?: boolean
  modelValue: string
  presets: Array<{ id: string, label: string, prompt: string }>
  selectedPresetId?: string | null
}>()

const emit = defineEmits<{
  openEditor: []
  selectPreset: [presetId: string]
  submit: []
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <section class="relative overflow-hidden rounded-[2rem] border border-default/70 bg-default/75 px-6 py-8 shadow-2xl shadow-black/10 backdrop-blur sm:px-8 sm:py-10">
    <div class="absolute inset-x-10 top-0 h-40 rounded-full bg-[color:var(--landing-gradient-primary)]/20 blur-3xl" />

    <div class="relative grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] lg:items-center">
      <div class="space-y-5">
        <div class="space-y-3">
          <UBadge color="primary" variant="soft" class="rounded-full px-3 py-1">
            AI-first theme generation
          </UBadge>
          <h1 class="max-w-3xl text-4xl font-semibold tracking-tight text-highlighted sm:text-5xl">
            Turn one prompt into a live Nuxt UI palette.
          </h1>
          <p class="max-w-2xl text-base leading-7 text-muted">
            Describe the mood, brand, or product surface you want. The landing page itself shifts into that generated palette, then you can keep refining it inside the editor.
          </p>
        </div>

        <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <button
            v-for="preset in props.presets"
            :key="preset.id"
            type="button"
            class="rounded-2xl border px-4 py-3 text-left text-sm transition-all"
            :class="props.selectedPresetId === preset.id ? 'border-primary bg-primary/10 text-highlighted' : 'border-default/70 bg-default/65 text-muted hover:border-primary/40 hover:text-highlighted'"
            @click="emit('selectPreset', preset.id)"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <UCard class="shadow-xl">
        <div class="space-y-4">
          <UFormField label="Prompt" description="Describe the brand mood, product type, or tone you want the palette to express.">
            <UTextarea
              :model-value="props.modelValue"
              :rows="6"
              autoresize
              placeholder="Create a cinematic analytics palette with deep slate surfaces, warm signal accents, and crisp contrast."
              @update:model-value="emit('update:modelValue', $event)"
            />
          </UFormField>

          <div v-if="props.helperText" class="rounded-2xl border border-default/60 bg-muted/25 px-4 py-3 text-sm text-muted">
            {{ props.helperText }}
          </div>

          <UAlert
            v-if="props.errorMessage"
            color="error"
            variant="soft"
            icon="i-lucide-alert-triangle"
            :description="props.errorMessage"
          />

          <div class="flex flex-col gap-3 sm:flex-row">
            <UButton
              block
              color="primary"
              icon="i-lucide-sparkles"
              :loading="props.isLoading"
              @click="emit('submit')"
            >
              Generate palette
            </UButton>

            <UButton
              block
              color="neutral"
              variant="outline"
              icon="i-lucide-pencil-ruler"
              @click="emit('openEditor')"
            >
              Open editor
            </UButton>
          </div>

          <div class="flex flex-wrap items-center gap-3 text-xs text-muted">
            <span>Landing demo uses the real palette generator.</span>
            <NuxtLink
              v-if="props.cta"
              :to="props.cta.to"
              class="font-medium text-primary"
            >
              {{ props.cta.label }}
            </NuxtLink>
          </div>
        </div>
      </UCard>
    </div>
  </section>
</template>
