export function usePaletteGenerationAccess() {
  const { user } = useAuth()
  const { getPaletteGenerationAccess } = usePaletteApi()
  const { data, status, refresh } = getPaletteGenerationAccess()

  const guestAccess = computed(() => ({
    canGenerate: false,
    isPaidUnlimited: false,
    isAdminUnlimited: false,
    freeLimit: 3,
    freeUsed: 0,
    freeRemaining: 3,
    reason: 'unauthenticated',
  } as const))
  const isGuest = computed(() => !user.value)
  const access = computed(() => isGuest.value ? guestAccess.value : data.value)
  const isDisabled = computed(() => isGuest.value || !access.value.canGenerate)

  watch(() => user.value?.id ?? null, () => {
    refresh()
  })

  const helperText = computed(() => {
    if (access.value.isAdminUnlimited) {
      return 'Unlimited AI palette generations enabled for admin accounts.'
    }

    if (access.value.isPaidUnlimited) {
      return 'Unlimited AI palette generations included with your plan.'
    }

    if (access.value.reason === 'unauthenticated') {
      return 'Register or log in to generate palettes'
    }

    if (access.value.reason === 'free_limit_reached') {
      return `You used all ${access.value.freeLimit} free generations. Upgrade for unlimited access.`
    }

    return `${access.value.freeRemaining} free generations left`
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
