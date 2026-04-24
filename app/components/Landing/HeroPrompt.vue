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

const { user } = useAuth()
</script>

<template>
  <section class="relative overflow-hidden rounded-2xl border border-default bg-elevated px-6 py-12 shadow-2xl sm:px-10 sm:py-16 lg:py-20">
    <div class="absolute inset-x-0 -top-24 h-64 rounded-full bg-[color:var(--landing-gradient-primary)]/10 blur-3xl" />
    <div class="absolute inset-x-0 -bottom-24 h-48 rounded-full bg-[color:var(--landing-gradient-secondary)]/8 blur-3xl" />

    <div class="relative mx-auto max-w-5xl space-y-10 text-center sm:space-y-12">
      <div class="space-y-6">
        <UBadge color="primary" variant="soft" size="lg" class="rounded-full px-4 py-1.5 text-sm font-medium">
          AI-first theme generation
        </UBadge>
        <h1 class="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-highlighted sm:text-6xl lg:text-7xl">
          Architect your
          <span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Nuxt UI theme</span>
        </h1>
        <p class="mx-auto max-w-3xl text-base leading-relaxed text-muted sm:text-lg lg:text-xl">
          Describe your product, mood, or interface direction. The landing preview updates live, and the same result carries forward into the full editor.
        </p>
      </div>

      <UCard class="mx-auto max-w-4xl border-default bg-elevated shadow-2xl">
        <div class="relative space-y-6">
          <UTextarea
            :model-value="props.modelValue"
            :rows="7"
            :disabled="!user"
            autoresize
            size="xl"
            variant="none"
            class="w-full"
            :ui="{
              base: 'min-h-56 resize-none rounded-lg bg-transparent px-0 py-0 text-base leading-relaxed text-default placeholder:text-muted/80 focus:outline-none transition-colors duration-200',
            }"
            placeholder="Describe the interface you want to create. Include mood, brand colors, layout tone, contrast, and the kind of product this theme should fit."
            @update:model-value="emit('update:modelValue', $event)"
          />

          <!-- Auth overlay for non-logged users -->
          <div v-if="!user" class="absolute inset-0 flex items-center justify-center rounded-lg bg-elevated/95 backdrop-blur-sm">
            <div class="space-y-6 px-6 py-8 text-center">
              <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
                <UIcon name="i-lucide-lock" class="size-8 text-primary" />
              </div>
              <div class="space-y-3">
                <h3 class="text-xl font-semibold text-highlighted">
                  Sign in to generate themes
                </h3>
                <p class="mx-auto max-w-md text-base leading-relaxed text-muted">
                  Create an account to access AI-powered theme generation and save your palettes.
                </p>
              </div>
              <div class="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
                <UButton
                  to="/register"
                  color="primary"
                  size="lg"
                  icon="i-lucide-user-plus"
                >
                  Create account
                </UButton>
                <UButton
                  to="/login"
                  color="neutral"
                  variant="ghost"
                  size="lg"
                >
                  Sign in
                </UButton>
              </div>
            </div>
          </div>

          <div v-if="props.helperText" class="rounded-lg border border-default bg-muted px-4 py-3.5 text-sm leading-relaxed text-default">
            {{ props.helperText }}
          </div>

          <div class="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-wrap items-center gap-3 text-sm text-default">
              <span>Landing uses the real generator and live app config.</span>
              <NuxtLink
                v-if="props.cta"
                :to="props.cta.to"
                class="font-semibold text-primary underline-offset-4 transition-all hover:underline"
              >
                {{ props.cta.label }}
              </NuxtLink>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:min-w-max">
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
                :disabled="!user"
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
