<script setup lang="ts">
const props = defineProps<{
  cta?: { label: string, to: string } | null
  helperText?: string
  isLoading?: boolean
  modelValue: string
}>()

const emit = defineEmits<{
  openEditor: []
  submit: []
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <section class="relative overflow-hidden rounded-[2.25rem] border border-default/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--ui-bg)_92%,transparent),color-mix(in_oklab,var(--ui-bg-elevated)_96%,transparent))] px-6 py-10 shadow-2xl shadow-black/10 backdrop-blur sm:px-8 sm:py-12">
    <div class="absolute inset-x-8 top-0 h-48 rounded-full bg-[color:var(--landing-gradient-primary)]/18 blur-3xl" />
    <div class="absolute inset-x-16 bottom-0 h-32 rounded-full bg-[color:var(--landing-gradient-secondary)]/12 blur-3xl" />

    <div class="relative mx-auto max-w-5xl space-y-8 text-center">
      <div class="space-y-4">
        <UBadge color="primary" variant="soft" class="rounded-full px-3 py-1">
          AI-first theme generation
        </UBadge>
        <h1 class="mx-auto max-w-4xl text-5xl font-semibold tracking-tight text-highlighted sm:text-6xl">
          Architect your
          <span class="text-primary"> Nuxt UI theme</span>
        </h1>
        <p class="mx-auto max-w-3xl text-base leading-7 text-muted sm:text-lg">
          Describe your product, mood, or interface direction. The landing preview updates live, and the same result carries forward into the full editor.
        </p>
      </div>

      <UCard class="mx-auto max-w-4xl border-default/70 bg-default/80 text-left shadow-[0_24px_80px_-32px_color-mix(in_oklab,var(--landing-gradient-primary)_40%,transparent)]">
        <div class="space-y-5">
          <UTextarea
            :model-value="props.modelValue"
            :rows="7"
            autoresize
            size="xl"
            variant="none"
            class="w-full"
            :ui="{
              base: 'min-h-[220px] resize-none rounded -lg bg-transparent px-0 py-0 text-base text-default placeholder:text-muted focus:outline-none',
            }"
            placeholder="Describe the interface you want to create. Include mood, brand colors, layout tone, contrast, and the kind of product this theme should fit."
            @update:model-value="emit('update:modelValue', $event)"
          />

          <div v-if="props.helperText" class="rounded -lg border border-default/60 bg-muted/20 px-4 py-3 text-sm text-muted">
            {{ props.helperText }}
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-wrap items-center gap-3 text-xs text-muted">
              <span>Landing uses the real generator and live app config.</span>
              <NuxtLink
                v-if="props.cta"
                :to="props.cta.to"
                class="font-medium text-primary"
              >
                {{ props.cta.label }}
              </NuxtLink>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-pencil-ruler"
                @click="emit('openEditor')"
              >
                Open editor
              </UButton>

              <UButton
                color="primary"
                icon="i-lucide-sparkles"
                :loading="props.isLoading"
                class="min-w-44 justify-center"
                @click="emit('submit')"
              >
                Generate theme
              </UButton>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </section>
</template>
