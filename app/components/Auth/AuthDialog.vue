<script setup lang="ts">
import { z } from 'zod'

const props = defineProps<{
  mode: 'sign-in' | 'sign-up'
  open: boolean
}>()

const emit = defineEmits<{
  authenticated: []
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const { signInWithEmail, signUpWithEmail } = useAuth()
const formState = reactive({
  name: '',
  email: '',
  password: '',
})

const authSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  email: z.email('A valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const title = computed(() => props.mode === 'sign-up' ? 'Create Account' : 'Sign In')
const description = computed(() => props.mode === 'sign-up'
  ? 'Create an account to save, share, and manage palettes.'
  : 'Sign in to access your saved palettes.')

watch(() => props.open, (open) => {
  if (!open) {
    errorMessage.value = ''
    return
  }

  errorMessage.value = ''
})

async function submit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    authSchema.parse({
      name: props.mode === 'sign-up' ? formState.name : undefined,
      email: formState.email,
      password: formState.password,
    })

    const result = props.mode === 'sign-up'
      ? await signUpWithEmail(formState.name, formState.email, formState.password)
      : await signInWithEmail(formState.email, formState.password)

    if (result.error) {
      errorMessage.value = result.error.message ?? 'Authentication failed'
      return
    }

    emit('authenticated')
    isOpen.value = false
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Authentication failed'
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UModal v-model:open="isOpen" :title="title" :description="description">
    <template #body>
      <UForm :schema="authSchema" :state="formState" class="space-y-4" @submit.prevent="submit">
        <UFormField v-if="props.mode === 'sign-up'" label="Name" name="name" required>
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

        <UButton type="submit" color="primary" block :loading="isSubmitting">
          {{ props.mode === 'sign-up' ? 'Create account' : 'Sign in' }}
        </UButton>
      </UForm>
    </template>
  </UModal>
</template>
