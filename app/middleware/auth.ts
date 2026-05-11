export default defineNuxtRouteMiddleware(async (to) => {
  const access = await fetchAuthAccess()

  if (access.isAuthenticated) {
    return
  }

  return navigateTo({
    path: '/login',
    query: {
      redirect: to.fullPath,
    },
  })
})
