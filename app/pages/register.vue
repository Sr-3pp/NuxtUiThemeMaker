<script setup lang="ts">
import { z } from 'zod'

const route = useRoute()
const { normalizeRedirectTarget, refetchSession, session, signUpWithEmail } = useAuth()
const isSubmitting = ref(false)
const errorMessage = ref('')

const redirectTarget = computed(() => normalizeRedirectTarget(route.query.redirect))

const formState = reactive({
  name: '',
  email: '',
  password: '',
})

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
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
    registerSchema.parse(formState)

    const result = await signUpWithEmail(formState.name, formState.email, formState.password)

    if (result.error) {
      errorMessage.value = result.error.message ?? 'Registration failed'
      return
    }

    await refetchSession()
    await navigateTo(redirectTarget.value)
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Registration failed'
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
            Create Account
          </p>
          <h1 class="text-2xl font-semibold text-white">
            Register
          </h1>
          <p class="text-sm text-white/55">
            Create an account to save palettes, manage visibility, and share links.
          </p>
        </div>
      </template>

      <UForm :schema="registerSchema" :state="formState" class="space-y-4" @submit.prevent="submit">
        <UFormField label="Name" name="name" required>
          <UInput v-model="formState.name" placeholder="Ada Lovelace" />
        </UFormField>

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
            Create account
          </UButton>

          <UButton to="/" color="neutral" variant="outline" block>
            Back to builder
          </UButton>
        </div>
      </UForm>

      <template #footer>
        <p class="text-sm text-white/55">
          Already have an account?
          <NuxtLink :to="`/login?redirect=${encodeURIComponent(redirectTarget)}`" class="text-[#4cd964]">
            Sign in
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </UMain>
</template>
