import type { AuthAccess } from '~/types/auth-access'

export default defineNuxtRouteMiddleware(async (to) => {
  const requestFetch = import.meta.server ? useRequestFetch() : $fetch
  const access = await requestFetch<AuthAccess>('/api/auth/access', {
    credentials: 'include',
  })

  if (access.isAuthenticated) {
    return
  }

  return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
})
