export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const { restoreSession, user, sessionReady } = useAuth()
  if (!sessionReady.value) await restoreSession()

  if (!user.value) {
    return navigateTo({ path: '/', query: { redirect: to.fullPath } })
  }
})
