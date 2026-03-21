import type { AuthAccess } from '~/types/auth-access'

export default defineNuxtRouteMiddleware(async () => {
  const requestFetch = import.meta.server ? useRequestFetch() : $fetch
  const access = await requestFetch<AuthAccess>('/api/auth/access', {
    credentials: 'include',
  })

  if (!access.isAuthenticated) {
    return navigateTo('/login')
  }

  if (!access.isAdmin) {
    return navigateTo('/')
  }
})
