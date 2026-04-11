<script setup lang="ts">
import { z } from 'zod'

usePageSeo({
  title: 'Sign In',
  description: 'Sign in to manage saved Nuxt UI palettes and sharing settings.',
  path: '/login',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const { normalizeRedirectTarget, refetchSession, session, signInWithEmail } = useAuth()
const isSubmitting = ref(false)
const errorMessage = ref('')

const redirectTarget = computed(() => normalizeRedirectTarget(route.query.redirect))

const formState = reactive({
  email: '',
  password: '',
})

const loginSchema = z.object({
  email: z.email('A valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

watch(session, async (currentSession) => {
  if (currentSession?.user) {
    await navigateTo(redirectTarget.value)
  }
}, { immediate: true })

async function submit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    loginSchema.parse(formState)

    const result = await signInWithEmail(formState.email, formState.password)

    if (result.error) {
      errorMessage.value = result.error.message ?? 'Sign in failed'
      return
    }

    await refetchSession()
    await navigateTo(redirectTarget.value)
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Sign in failed'
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UMain class="flex min-h-screen items-center justify-center px-4 py-10">
    <UCard class="w-full max-w-md rounded-3xl border-white/10 bg-black/60 shadow-2xl">
      <template #header>
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.16em] text-white/45">
            Account Access
          </p>
          <h1 class="text-2xl font-semibold text-white">
            Sign in
          </h1>
          <p class="text-sm text-white/55">
            Access your saved palettes and sharing controls.
          </p>
        </div>
      </template>

      <UForm :schema="loginSchema" :state="formState" class="space-y-4" @submit.prevent="submit">
        <UFormField label="Email" name="email" required>
          <UInput v-model="formState.email" type="email" placeholder="you@example.com" />
        </UFormField>

        <UFormField label="Password" name="password" required>
          <UInput v-model="formState.password" type="password" placeholder="Minimum 8 characters" />
        </UFormField>

        <p v-if="errorMessage" class="text-sm text-red-400">
          {{ errorMessage }}
        </p>

        <div class="space-y-3">
          <UButton type="submit" color="primary" block :loading="isSubmitting" class="bg-[#4cd964] text-black hover:bg-[#65e27c]">
            Sign in
          </UButton>

          <UButton to="/" color="neutral" variant="outline" block>
            Back to home
          </UButton>
        </div>
      </UForm>

      <template #footer>
        <p class="text-sm text-white/55">
          Need an account?
          <NuxtLink :to="`/register?redirect=${encodeURIComponent(redirectTarget)}`" class="text-[#4cd964]">
            Register
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </UMain>
</template>
