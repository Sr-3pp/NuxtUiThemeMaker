<script setup lang="ts">
import { pricingPlans } from '~/data/pricing'
</script>

<template>
  <section class="space-y-4">
    <div class="space-y-2">
      <p class="text-xs uppercase tracking-[0.2em] text-primary">
        Pricing
      </p>
      <h2 class="text-3xl font-semibold tracking-tight text-highlighted">
        Upgrade when the workflow gets heavier, not before the first edit.
      </h2>
      <p class="max-w-3xl text-sm leading-6 text-muted">
        Start with the landing demo and editor, then move into bigger AI budgets, more saved palettes, and team workflows when they become useful.
      </p>
    </div>

    <div class="grid gap-4 xl:grid-cols-3">
      <UCard
        v-for="plan in pricingPlans"
        :key="plan.id"
        class="rounded-[1.5rem] border-default/70 bg-default/85"
      >
        <div class="space-y-4">
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-[0.18em] text-primary">
              {{ plan.name }}
            </p>
            <h3 class="text-3xl font-semibold text-highlighted">
              {{ plan.monthlyPrice === 0 ? 'Free' : `$${plan.monthlyPrice}/mo` }}
            </h3>
            <p class="text-sm text-muted">
              {{ plan.description }}
            </p>
          </div>

          <ul class="space-y-3 text-sm text-muted">
            <li
              v-for="feature in plan.features.slice(0, 4)"
              :key="feature"
              class="flex gap-3"
            >
              <UIcon name="i-lucide-check" class="mt-0.5 size-4 text-primary" />
              <span>{{ feature }}</span>
            </li>
          </ul>

          <UButton
            :to="plan.id === 'free' ? '/editor' : '/pricing'"
            :color="plan.id === 'free' ? 'neutral' : 'primary'"
            :variant="plan.id === 'free' ? 'outline' : 'solid'"
            block
          >
            {{ plan.id === 'free' ? 'Open editor' : `See ${plan.name}` }}
          </UButton>
        </div>
      </UCard>
    </div>
  </section>
</template>
