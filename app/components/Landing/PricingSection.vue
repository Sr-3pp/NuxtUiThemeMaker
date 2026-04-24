<script setup lang="ts">
import { pricingPlans } from '~/data/pricing'
</script>

<template>
  <section class="space-y-6">
    <div class="space-y-3">
      <p class="text-sm font-semibold uppercase tracking-widest text-primary">
        Pricing
      </p>
      <h2 class="text-3xl font-bold tracking-tight text-highlighted lg:text-4xl">
        Upgrade when the workflow gets heavier, not before the first edit.
      </h2>
      <p class="max-w-3xl text-base leading-relaxed text-muted lg:text-lg">
        Start with the landing demo and editor, then move into bigger AI budgets, more saved palettes, and team workflows when they become useful.
      </p>
    </div>

    <div class="grid gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
      <UCard
        v-for="plan in pricingPlans"
        :key="plan.id"
        :class="[
          'group transition-all duration-300',
          plan.id === 'pro' ? 'border-primary/50 shadow-xl shadow-primary/5 hover:shadow-2xl hover:border-primary/70' : 'hover:shadow-xl hover:border-primary/30 hover:-translate-y-1'
        ]"
      >
        <div class="space-y-6">
          <div class="space-y-3">
            <p class="text-sm font-bold uppercase tracking-widest text-primary/80">
              {{ plan.name }}
            </p>
            <h3 class="text-4xl font-bold text-highlighted lg:text-5xl">
              {{ plan.monthlyPrice === 0 ? 'Free' : `$${plan.monthlyPrice}/mo` }}
            </h3>
            <p class="text-sm leading-relaxed text-muted">
              {{ plan.description }}
            </p>
          </div>

          <ul class="space-y-3.5 text-sm leading-relaxed text-muted">
            <li
              v-for="feature in plan.features.slice(0, 4)"
              :key="feature"
              class="flex gap-3.5"
            >
              <UIcon name="i-lucide-check" class="mt-0.5 size-5 shrink-0 text-primary transition-transform duration-300 group-hover:scale-110" />
              <span>{{ feature }}</span>
            </li>
          </ul>

          <UButton
            :to="plan.id === 'free' ? '/editor' : '/pricing'"
            :color="plan.id === 'free' ? 'neutral' : 'primary'"
            :variant="plan.id === 'free' ? 'outline' : 'solid'"
            size="lg"
            block
          >
            {{ plan.id === 'free' ? 'Open editor' : `See ${plan.name}` }}
          </UButton>
        </div>
      </UCard>
    </div>
  </section>
</template>
