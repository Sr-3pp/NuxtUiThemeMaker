<script setup lang="ts">
import { pricingPlans } from '~/data/pricing'
import type { BillingStatus } from '~/types/billing'
import type { PaletteGenerationAccess } from '~/types/palette-generation'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { user, refetchSession } = useAuth()
const { createCheckoutSession } = useStripeCheckout()
const { showErrorToast } = useErrorToast()
const { data: billingStatus, refresh: refreshBillingStatus } = await useFetch<BillingStatus>('/api/billing/status', {
  credentials: 'include',
  default: () => ({
    hasActivePlan: false,
    isAdminUnlimited: false,
    plan: 'free',
    planInterval: null,
    planStatus: 'inactive',
  } satisfies BillingStatus),
})

usePageSeo({
  title: 'Pricing',
  description: 'Choose a monthly or yearly plan to unlock unlimited AI palette generations.',
  path: '/pricing',
})

const billingInterval = ref<'monthly' | 'yearly'>('monthly')
const pendingPlanId = ref<string | null>(null)
const checkoutBanner = ref<{
  color: 'error' | 'warning'
  description: string
  title: string
} | null>(null)

async function hasPaidUnlimitedAccess() {
  const access = await $fetch<PaletteGenerationAccess>('/api/palettes/generation-access', {
    credentials: 'include',
  })

  return access.isPaidUnlimited || access.isAdminUnlimited
}

watch(() => route.query.checkout, async (value) => {
  if (value === 'success') {
    checkoutBanner.value = null
    await refetchSession()
    await refreshBillingStatus()

    if (await hasPaidUnlimitedAccess()) {
      await navigateTo('/?checkout=success')
      return
    }

    checkoutBanner.value = {
      title: 'Payment received, billing still syncing',
      description: 'Your payment succeeded, but your plan has not been activated yet. Refresh in a few seconds or contact support if it stays the same.',
      color: 'warning',
    }
    showErrorToast(new Error('Your payment succeeded, but the billing update has not completed yet.'), 'Billing activation is still pending.')
    await router.replace({ query: { ...route.query, checkout: undefined } })
  }

  if (value === 'canceled') {
    checkoutBanner.value = {
      title: 'Checkout canceled',
      description: 'No payment was charged. You can choose a plan again whenever you are ready.',
      color: 'warning',
    }
    toast.add({
      title: 'Checkout canceled',
      description: 'No payment was charged.',
      color: 'neutral',
    })
    await router.replace({ query: { ...route.query, checkout: undefined } })
  }
}, { immediate: true })

async function startCheckout(planId: 'pro' | 'team') {
  if (!user.value) {
    await navigateTo(`/register?redirect=${encodeURIComponent('/pricing')}`)
    return
  }

  pendingPlanId.value = planId

  try {
    const checkoutSession = await createCheckoutSession(planId, billingInterval.value)

    if (!checkoutSession.url) {
      throw new Error('Stripe checkout session did not return a redirect URL')
    }

    await navigateTo(checkoutSession.url, { external: true })
  } catch (error) {
    showErrorToast(error, 'Failed to start checkout.')
  } finally {
    pendingPlanId.value = null
  }
}

function getPlanBadge(planId: 'pro' | 'team') {
  if (billingStatus.value.isAdminUnlimited) {
    return {
      color: 'neutral' as const,
      label: 'Admin access',
    }
  }

  if (billingStatus.value.plan !== planId) {
    return null
  }

  if (billingStatus.value.hasActivePlan) {
    return {
      color: 'success' as const,
      label: billingStatus.value.planInterval ? `Current plan · ${billingStatus.value.planInterval}` : 'Current plan',
    }
  }

  return {
    color: 'warning' as const,
    label: `Current plan · ${billingStatus.value.planStatus}`,
  }
}
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

      <UAlert
        v-if="checkoutBanner"
        :title="checkoutBanner.title"
        :description="checkoutBanner.description"
        :color="checkoutBanner.color"
        variant="soft"
      />

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
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs uppercase tracking-[0.2em] text-primary">
                  {{ plan.name }}
                </p>
                <UBadge
                  v-if="getPlanBadge(plan.id)"
                  :color="getPlanBadge(plan.id)?.color"
                  variant="soft"
                >
                  {{ getPlanBadge(plan.id)?.label }}
                </UBadge>
              </div>
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
              :variant="billingStatus.plan === plan.id && billingStatus.hasActivePlan ? 'outline' : 'solid'"
              :loading="pendingPlanId === plan.id"
              @click="startCheckout(plan.id)"
            >
              {{ user ? (billingStatus.plan === plan.id && billingStatus.hasActivePlan ? `Current ${plan.name} Plan` : `Choose ${plan.name}`) : `Register for ${plan.name}` }}
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
