<script setup lang="ts">
import { z } from 'zod'
import { getDefaultPaidPricingPlanId, isPaidPricingPlanId, paidPricingPlans } from '~/data/pricing'
import type { PaidPricingPlan } from '~/types/pricing'

definePageMeta({
  middleware: ['panel-admin'],
})

usePageSeo({
  title: 'Admin Emails',
  description: 'Private admin area for testing transactional email templates.',
  path: '/panel/emails',
  robots: 'noindex, nofollow',
})

const requestFetch = import.meta.server ? useRequestFetch() : $fetch
const toast = useToast()
const { showErrorToast } = useErrorToast()

const templateOptions = [
  {
    label: 'Registration welcome',
    value: 'registration',
  },
  {
    label: 'Plan purchase confirmation',
    value: 'purchase',
  },
] as const

const planOptions = paidPricingPlans.map(plan => ({
  label: plan.name,
  value: plan.id,
})) as { label: string, value: PaidPricingPlan }[]

const billingIntervalOptions = [
  {
    label: 'Monthly',
    value: 'monthly',
  },
  {
    label: 'Yearly',
    value: 'yearly',
  },
] as const

const formState = reactive({
  template: 'registration' as 'registration' | 'purchase',
  recipientEmail: '',
  recipientName: '',
  planId: getDefaultPaidPricingPlanId(),
  billingInterval: 'monthly' as 'monthly' | 'yearly',
})

const isSending = ref(false)

const schema = z.discriminatedUnion('template', [
  z.object({
    template: z.literal('registration'),
    recipientEmail: z.email('A valid recipient email is required'),
    recipientName: z.string().trim().optional(),
  }),
  z.object({
    template: z.literal('purchase'),
    recipientEmail: z.email('A valid recipient email is required'),
    recipientName: z.string().trim().optional(),
    planId: z.custom<PaidPricingPlan>(isPaidPricingPlanId, 'A valid paid pricing plan is required'),
    billingInterval: z.enum(['monthly', 'yearly']),
  }),
])

const selectedTemplate = computed(() =>
  templateOptions.find(option => option.value === formState.template) ?? templateOptions[0],
)

const previewLines = computed(() => {
  const lines = [
    `To: ${formState.recipientEmail || 'recipient@example.com'}`,
    `Name: ${formState.recipientName || 'Optional'}`,
  ]

  if (formState.template === 'purchase') {
    lines.push(`Plan: ${formState.planId}`)
    lines.push(`Billing interval: ${formState.billingInterval}`)
  }

  return lines
})

async function sendTestEmail() {
  isSending.value = true

  try {
    const body = schema.parse({
      template: formState.template,
      recipientEmail: formState.recipientEmail.trim(),
      recipientName: formState.recipientName.trim(),
      ...(formState.template === 'purchase'
        ? {
            planId: formState.planId,
            billingInterval: formState.billingInterval,
          }
        : {}),
    })

    const response = await requestFetch<{ message: string }>('/api/admin/emails/test', {
      method: 'POST',
      credentials: 'include',
      body,
    })

    toast.add({
      title: 'Test email sent',
      description: response.message,
      color: 'success',
    })
  }
  catch (error) {
    showErrorToast(error, 'Failed to send test email.')
  }
  finally {
    isSending.value = false
  }
}
</script>

<template>
  <UContainer class="space-y-6 py-8">
    <div class="space-y-1">
      <h1 class="text-2xl font-semibold text-highlighted">
        Emails
      </h1>
      <p class="text-sm text-muted">
        Send test versions of the transactional emails used for registration and plan purchases.
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <UCard variant="outline">
        <template #header>
          <div class="space-y-1">
            <p class="text-sm font-medium text-highlighted">
              Test delivery
            </p>
            <p class="text-sm text-muted">
              Use a real inbox to verify SMTP credentials, rendering, and content.
            </p>
          </div>
        </template>

        <div class="space-y-5">
          <UFormField label="Template" name="template" required>
            <USelect
              v-model="formState.template"
              :items="templateOptions"
              value-key="value"
              color="primary"
              variant="outline"
            />
          </UFormField>

          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Recipient email" name="recipientEmail" required>
              <UInput
                v-model="formState.recipientEmail"
                type="email"
                placeholder="qa@example.com"
              />
            </UFormField>

            <UFormField label="Recipient name" name="recipientName">
              <UInput
                v-model="formState.recipientName"
                placeholder="Optional display name"
              />
            </UFormField>
          </div>

          <div
            v-if="formState.template === 'purchase'"
            class="grid gap-4 md:grid-cols-2"
          >
            <UFormField label="Plan" name="planId" required>
              <USelect
                v-model="formState.planId"
                :items="planOptions"
                value-key="value"
                color="primary"
                variant="outline"
              />
            </UFormField>

            <UFormField label="Billing interval" name="billingInterval" required>
              <USelect
                v-model="formState.billingInterval"
                :items="billingIntervalOptions"
                value-key="value"
                color="primary"
                variant="outline"
              />
            </UFormField>
          </div>

          <div class="flex justify-end">
            <UButton
              color="primary"
              icon="i-lucide-send"
              :loading="isSending"
              @click="sendTestEmail"
            >
              Send test email
            </UButton>
          </div>
        </div>
      </UCard>

      <UCard variant="subtle">
        <template #header>
          <div class="space-y-1">
            <p class="text-sm font-medium text-highlighted">
              Current payload
            </p>
            <p class="text-sm text-muted">
              Quick check before you send.
            </p>
          </div>
        </template>

        <div class="space-y-4">
          <div class="rounded -lg border border-default bg-default/40 p-4">
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Template
            </p>
            <p class="mt-2 text-sm text-highlighted">
              {{ selectedTemplate.label }}
            </p>
          </div>

          <div class="rounded -lg border border-default bg-default/40 p-4 space-y-2">
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Details
            </p>
            <p
              v-for="line in previewLines"
              :key="line"
              class="text-sm text-toned break-all"
            >
              {{ line }}
            </p>
          </div>

          <div class="rounded -lg border border-default bg-default/40 p-4 space-y-2">
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Templates available
            </p>
            <p class="text-sm text-toned">
              `registration` sends the welcome email used after account creation.
            </p>
            <p class="text-sm text-toned">
              `purchase` sends the paid plan confirmation used after Stripe checkout completes.
            </p>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
