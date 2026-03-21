<script setup lang="ts">
import { pricingPlans } from '~/data/pricing'

usePageSeo({
  title: 'Pricing',
  description: 'Choose a monthly or yearly plan to unlock unlimited AI palette generations.',
  path: '/pricing',
})

const billingInterval = ref<'monthly' | 'yearly'>('monthly')
</script>

<template>
  <UMain class="min-h-screen px-4 py-12 sm:px-6">
    <div class="mx-auto flex max-w-6xl flex-col gap-10">
      <div class="space-y-4 text-center">
        <p class="text-xs uppercase tracking-[0.24em] text-primary">
          Pricing
        </p>
        <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">
          Unlock unlimited AI palette generation
        </h1>
        <p class="mx-auto max-w-2xl text-sm text-muted">
          Every registered account starts with 3 free AI palette generations. Upgrade to a paid plan for unlimited monthly or yearly access.
        </p>
      </div>

      <div class="flex justify-center gap-4">
          <UButton
            :variant="billingInterval === 'monthly' ? 'solid' : 'outline'"
            color="primary"
            @click="billingInterval = 'monthly'"
          >
            Monthly
          </UButton>
          <UButton
            :variant="billingInterval === 'yearly' ? 'solid' : 'outline'"
            color="primary"
            @click="billingInterval = 'yearly'"
          >
            Yearly
          </UButton>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <UCard
          v-for="plan in pricingPlans"
          :key="plan.id"
          class="rounded-3xl border border-default/60 bg-default/70 shadow-xl"
        >
          <div class="space-y-5 flex flex-col gap-6">
            <div class="space-y-2">
              <p class="text-xs uppercase tracking-[0.2em] text-primary">
                {{ plan.name }}
              </p>
              <h2 class="text-2xl font-semibold">
                {{ billingInterval === 'monthly' ? `$${plan.monthlyPrice}/mo` : `$${plan.yearlyPrice}/yr` }}
              </h2>
              <p class="text-sm text-muted">
                {{ plan.description }}
              </p>
            </div>

            <ul class="space-y-3 text-sm text-toned">
              <li v-for="feature in plan.features" :key="feature" class="flex gap-3">
                <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
                <span>{{ feature }}</span>
              </li>
            </ul>

            <UButton
              class="mx-auto w-auto"
              block
              color="primary"
              :to="`/register?redirect=${encodeURIComponent('/pricing')}`"
            >
              Choose {{ plan.name }}
            </UButton>
          </div>
        </UCard>
      </div>

      <UButton
        class="mx-auto w-auto"
        variant="link"
        color="primary"
        to="/"
      >
        Go to Theme Editor
      </UButton>
    </div>
  </UMain>
</template>
