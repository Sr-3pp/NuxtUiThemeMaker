import { FREE_PLAN_PALETTE_GENERATION_LIMIT } from '~/data/pricing'

export function usePaletteGenerationAccess() {
  const { user } = useAuth()
  const { getPaletteGenerationAccess } = usePaletteApi()
  const { data, status, refresh } = getPaletteGenerationAccess()

  const guestAccess = computed(() => ({
    canGenerate: false,
    isPaidUnlimited: false,
    isAdminUnlimited: false,
    freeLimit: FREE_PLAN_PALETTE_GENERATION_LIMIT,
    freeUsed: 0,
    freeRemaining: FREE_PLAN_PALETTE_GENERATION_LIMIT,
    reason: 'unauthenticated',
  } as const))
  const isGuest = computed(() => !user.value)
  const access = computed(() => isGuest.value ? guestAccess.value : data.value)
  const isDisabled = computed(() => !access.value.canGenerate)

  watch(() => user.value?.id ?? null, () => {
    refresh()
  })

  const helperText = computed(() => {
    const currentPlan = user.value?.plan ?? 'free'

    if (access.value.isAdminUnlimited) {
      return 'Unlimited AI runs enabled for admin accounts.'
    }

    if (access.value.isPaidUnlimited) {
      return 'Unlimited AI runs included with your access.'
    }

    if (isGuest.value) {
      return 'AI palette generation requires an account. Register to get started with free AI runs.'
    }

    if (access.value.reason === 'free_limit_reached') {
      return currentPlan === 'pro'
        ? `You used all ${access.value.freeLimit} AI runs in your Pro plan. Upgrade for more access.`
        : `You used all ${access.value.freeLimit} free AI runs. Upgrade for more access.`
    }

    return currentPlan === 'pro'
      ? `${access.value.freeRemaining} AI runs left on your Pro plan`
      : currentPlan === 'teams'
        ? `${access.value.freeRemaining} AI runs left on your Teams plan`
        : `${access.value.freeRemaining} free AI runs left`
  })

  const cta = computed(() => {
    if (access.value.reason === 'unauthenticated') {
      return {
        label: 'Register',
        to: '/register?redirect=%2Fpricing',
      }
    }

    if (access.value.reason === 'free_limit_reached') {
      return {
        label: 'View pricing',
        to: '/pricing',
      }
    }

    return null
  })

  return {
    access,
    cta,
    helperText,
    isDisabled,
    isGuest,
    refresh,
    status,
  }
}
