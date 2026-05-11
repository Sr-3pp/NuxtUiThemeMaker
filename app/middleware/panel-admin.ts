export default defineNuxtRouteMiddleware(async () => {
  const access = await fetchAuthAccess()

  if (!access.isAuthenticated) {
    return navigateTo('/login')
  }

  if (!access.isAdmin) {
    return navigateTo('/')
  }
})
