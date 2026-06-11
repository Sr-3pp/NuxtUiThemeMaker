const DEFAULT_AI_COOLDOWN_SECONDS = 60

let cooldownTimer: ReturnType<typeof setInterval> | null = null

function normalizeCooldownSeconds(seconds: unknown) {
  return typeof seconds === 'number' && Number.isFinite(seconds) && seconds > 0
    ? Math.ceil(seconds)
    : DEFAULT_AI_COOLDOWN_SECONDS
}

function getAiCooldownSecondsFromError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return null
  }

  const candidate = error as {
    status?: unknown
    statusCode?: unknown
    data?: {
      retryAfter?: unknown
    }
  }

  const statusCode = [candidate.statusCode, candidate.status]
    .find(value => typeof value === 'number')

  if (statusCode !== 429) {
    return null
  }

  return normalizeCooldownSeconds(candidate.data?.retryAfter)
}

export function useAiGenerationCooldown() {
  const seconds = useState('ai-generation-cooldown-seconds', () => 0)
  const isCoolingDown = computed(() => seconds.value > 0)

  function clearCooldown() {
    if (cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }

    seconds.value = 0
  }

  function startCooldown(value: unknown) {
    const cooldownSeconds = normalizeCooldownSeconds(value)

    clearCooldown()
    seconds.value = cooldownSeconds

    if (!import.meta.client) {
      return
    }

    cooldownTimer = setInterval(() => {
      seconds.value = Math.max(0, seconds.value - 1)

      if (seconds.value === 0) {
        clearCooldown()
      }
    }, 1000)
  }

  function tryStartCooldownFromError(error: unknown) {
    const cooldownSeconds = getAiCooldownSecondsFromError(error)

    if (!cooldownSeconds) {
      return false
    }

    startCooldown(cooldownSeconds)
    return true
  }

  return {
    clearCooldown,
    cooldownSeconds: seconds,
    isCoolingDown,
    startCooldown,
    tryStartCooldownFromError,
  }
}
