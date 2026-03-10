import { authClient } from '~/utils/auth-client'

export function useAuth() {
  const sessionState = authClient.useSession()

  const session = computed(() => sessionState.value.data ?? null)
  const user = computed(() => session.value?.user ?? null)
  const isAuthenticated = computed(() => Boolean(user.value))

  function normalizeRedirectTarget(redirect: unknown, fallback = '/') {
    return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : fallback
  }

  async function refetchSession() {
    await sessionState.value.refetch()
  }

  async function signInWithEmail(email: string, password: string) {
    return authClient.signIn.email({
      email: email.trim(),
      password,
    })
  }

  async function signUpWithEmail(name: string, email: string, password: string) {
    return authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
    })
  }

  async function signOut() {
    return authClient.signOut()
  }

  return {
    isAuthenticated,
    normalizeRedirectTarget,
    refetchSession,
    session,
    sessionState,
    signInWithEmail,
    signOut,
    signUpWithEmail,
    user,
  }
}
