<script setup lang="ts">
defineProps<{
  colorScaleSteps: string[]
  scaleFamilies: string[]
  statusFamilies: string[]
}>()
</script>

<template>
  <div class="space-y-6 pt-6">
    <UCard variant="outline">
      <template #header>
        <div class="space-y-1">
          <p class="text-sm font-medium text-highlighted">Core ramps</p>
          <p class="text-sm text-muted">Primitive color scales behind semantic aliases.</p>
        </div>
      </template>

      <div class="space-y-6">
        <div
          v-for="family in scaleFamilies"
          :key="family"
          class="space-y-3"
        >
          <div class="flex items-center gap-2">
            <UBadge color="neutral" variant="outline" class="capitalize">
              {{ family }}
            </UBadge>
            <span class="text-sm text-muted">var(--ui-color-{{ family }}-*)</span>
          </div>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-11">
            <UCard
              v-for="step in colorScaleSteps"
              :key="`${family}-${step}`"
              variant="outline"
              class="overflow-hidden p-0"
            >
              <div
                class="h-20 w-full"
                :style="{ backgroundColor: `var(--ui-color-${family}-${step})` }"
              />
              <div class="bg-default px-2 py-3 text-center text-xs text-default">
                {{ family }}-{{ step }}
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </UCard>

    <UCard variant="outline">
      <template #header>
        <div class="space-y-1">
          <p class="text-sm font-medium text-highlighted">Status ramps</p>
          <p class="text-sm text-muted">Fast check for alert, badge and progress component colors.</p>
        </div>
      </template>

      <div class="grid gap-6 xl:grid-cols-2">
        <div
          v-for="family in statusFamilies"
          :key="family"
          class="space-y-3"
        >
          <div class="flex items-center gap-2">
            <UBadge :color="family" variant="soft" class="capitalize">
              {{ family }}
            </UBadge>
            <span class="text-sm text-muted">50 / 500 / 950 checkpoints</span>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <UCard
              v-for="step in ['50', '500', '950']"
              :key="`${family}-${step}`"
              variant="outline"
              class="overflow-hidden p-0"
            >
              <div
                class="h-24 w-full"
                :style="{ backgroundColor: `var(--ui-color-${family}-${step})` }"
              />
              <div class="bg-default px-2 py-3 text-center text-xs text-default">
                {{ family }}-{{ step }}
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
