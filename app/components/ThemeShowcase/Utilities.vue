<script setup lang="ts">
import type { SemanticColorItem, SurfaceModeItem } from '~/types/theme-showcase'

defineProps<{
  semanticColors: SemanticColorItem[]
  textTokens: string[]
  borderTokens: string[]
  ringTokens: string[]
  divideTokens: string[]
  outlineTokens: string[]
  strokeTokens: string[]
  fillTokens: string[]
  radiusTokens: string[]
  shadowTokens: string[]
  surfaceModes: SurfaceModeItem[]
  disableInteractive: boolean
}>()
</script>

<template>
  <div class="space-y-6 pt-6">
    <div class="grid gap-6 xl:grid-cols-2">
      <UCard variant="outline">
        <template #header>
          <div class="space-y-1">
            <p class="text-sm font-medium text-highlighted">Color aliases</p>
            <p class="text-sm text-muted">Each chip uses Nuxt UI utility classes directly.</p>
          </div>
        </template>

        <div class="grid gap-3 sm:grid-cols-2">
          <UCard
            v-for="color in semanticColors"
            :key="`semantic-${color.name}`"
            variant="soft"
            class="space-y-3"
          >
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm font-medium capitalize text-highlighted">
                {{ color.name }}
              </p>
              <UBadge :color="color.name" variant="solid" :label="color.text" />
            </div>

            <div class="grid gap-2">
              <div :class="[color.bg, color.invertedText, 'rounded-md px-3 py-2 text-sm font-medium']">
                {{ color.bg }}
              </div>
              <div :class="[color.border, color.text, 'rounded-md border bg-default px-3 py-2 text-sm font-medium']">
                {{ color.text }} / {{ color.border }}
              </div>
            </div>
          </UCard>
        </div>
      </UCard>

      <UCard variant="outline">
        <template #header>
          <div class="space-y-1">
            <p class="text-sm font-medium text-highlighted">Surfaces and text</p>
            <p class="text-sm text-muted">Core surface hierarchy used by Nuxt UI components.</p>
          </div>
        </template>

        <div class="space-y-4">
          <div class="grid gap-3 sm:grid-cols-2">
            <UCard
              v-for="surface in surfaceModes"
              :key="surface.label"
              variant="soft"
              :class="surface.token"
            >
              <p class="text-sm font-medium">{{ surface.label }}</p>
              <p class="mt-2 text-sm opacity-90">
                {{ surface.token }}
              </p>
            </UCard>
          </div>

          <div class="space-y-2">
            <p
              v-for="token in textTokens"
              :key="token"
              :class="token"
            >
              {{ token }} keeps hierarchy readable across muted and elevated surfaces.
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid gap-6 xl:grid-cols-3">
      <UCard variant="outline">
        <template #header>
          <p class="text-sm font-medium text-highlighted">Borders</p>
        </template>

        <div class="space-y-3">
          <UCard
            v-for="token in borderTokens"
            :key="token"
            variant="soft"
            :class="[token, 'border']"
          >
            <p class="text-sm text-default">{{ token }}</p>
          </UCard>
        </div>
      </UCard>

      <UCard variant="outline">
        <template #header>
          <p class="text-sm font-medium text-highlighted">Rings and outlines</p>
        </template>

        <div class="space-y-3">
          <UButton
            v-for="token in ringTokens"
            :key="token"
            color="neutral"
            variant="outline"
            class="w-full justify-start ring-2 ring-inset"
            :class="token"
            :disabled="disableInteractive"
          >
            {{ token }}
          </UButton>

          <div class="grid gap-3 sm:grid-cols-2">
            <UButton
              v-for="token in outlineTokens"
              :key="token"
              color="neutral"
              variant="ghost"
              class="outline-2 outline-offset-2"
              :class="token"
              :disabled="disableInteractive"
            >
              {{ token }}
            </UButton>
          </div>
        </div>
      </UCard>

      <UCard variant="outline">
        <template #header>
          <p class="text-sm font-medium text-highlighted">Divide, stroke and fill</p>
        </template>

        <div class="space-y-4">
          <div
            v-for="token in divideTokens"
            :key="token"
            :class="[token, 'divide-y rounded-lg border border-default bg-default']"
          >
            <div class="px-3 py-2 text-sm text-default">{{ token }}</div>
            <div class="px-3 py-2 text-sm text-muted">Secondary row</div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <UCard
              v-for="token in strokeTokens"
              :key="token"
              variant="soft"
              class="flex items-center justify-center"
            >
              <svg viewBox="0 0 64 64" class="h-12 w-12 fill-none stroke-[3]" :class="token">
                <circle cx="32" cy="32" r="20" />
              </svg>
              <p class="mt-2 text-center text-xs text-muted">{{ token }}</p>
            </UCard>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <UCard
              v-for="token in fillTokens"
              :key="token"
              variant="soft"
              class="flex items-center justify-center"
            >
              <svg viewBox="0 0 64 64" class="h-12 w-12" :class="token">
                <rect x="14" y="14" width="36" height="36" rx="10" />
              </svg>
              <p class="mt-2 text-center text-xs text-muted">{{ token }}</p>
            </UCard>
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid gap-6 xl:grid-cols-2">
      <UCard variant="outline">
        <template #header>
          <p class="text-sm font-medium text-highlighted">Radius scale</p>
        </template>

        <div class="flex flex-wrap gap-3">
          <div
            v-for="token in radiusTokens"
            :key="token"
            :class="[token, 'flex h-20 w-20 items-center justify-center border border-default bg-muted px-2 text-center text-[11px] text-default']"
          >
            {{ token }}
          </div>
        </div>
      </UCard>

      <UCard variant="outline">
        <template #header>
          <p class="text-sm font-medium text-highlighted">Shadow scale</p>
        </template>

        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <UCard
            v-for="token in shadowTokens"
            :key="token"
            variant="outline"
            :class="token"
          >
            <p class="text-sm text-default">{{ token }}</p>
          </UCard>
        </div>
      </UCard>
    </div>
  </div>
</template>
