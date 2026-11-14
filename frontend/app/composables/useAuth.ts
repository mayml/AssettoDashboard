import { createAuthService, type AuthSessionResponse, type AuthUser } from '~/services/api/auth'

const REFRESH_TOKEN_KEY = 'assetto-dash-refresh-token'

export function useAuth() {
  const config = useRuntimeConfig()
  const authService = createAuthService(config.public.authApiBaseUrl)
  const accessToken = useState<string | null>('auth-access-token', () => null)
  const user = useState<AuthUser | null>('auth-user', () => null)
  const sessionReady = useState<boolean>('auth-session-ready', () => false)
  let restorePromise: Promise<boolean> | null = null

  function storeSession(session: AuthSessionResponse) {
    accessToken.value = session.accessToken
    user.value = session.user
    if (import.meta.client) {
      window.sessionStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
    }
    sessionReady.value = true
  }

  function clearSession() {
    accessToken.value = null
    user.value = null
    if (import.meta.client) {
      window.sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    }
    sessionReady.value = true
  }

  async function login(email: string, password: string) {
    const session = await authService.login(email, password)
    storeSession(session)
    return session.user
  }

  async function register(email: string, password: string) {
    return authService.register(email, password)
  }

  async function restoreSession(): Promise<boolean> {
    if (import.meta.server) return false
    if (sessionReady.value) return Boolean(user.value)
    if (restorePromise) return restorePromise

    restorePromise = (async () => {
      const refreshToken = window.sessionStorage.getItem(REFRESH_TOKEN_KEY)
      if (!refreshToken) {
        clearSession()
        return false
      }

      try {
        const session = await authService.refresh(refreshToken)
        storeSession(session)
        return true
      } catch {
        clearSession()
        return false
      }
    })()

    try {
      return await restorePromise
    } finally {
      restorePromise = null
    }
  }

  async function logout() {
    const refreshToken = import.meta.client
      ? window.sessionStorage.getItem(REFRESH_TOKEN_KEY)
      : null
    let loggedOut = true

    if (refreshToken) {
      try {
        await authService.logout(refreshToken)
      } catch {
        loggedOut = false
      }
    }

    clearSession()
    return loggedOut
  }

  function requireAccessToken() {
    if (!accessToken.value) throw new Error('Сессия завершилась. Войди в аккаунт ещё раз.')
    return accessToken.value
  }

  async function refreshProfile() {
    const profile = await authService.me(requireAccessToken())
    user.value = profile
    return profile
  }

  function changePassword(currentPassword: string, newPassword: string) {
    return authService.changePassword(requireAccessToken(), currentPassword, newPassword)
  }

  async function loadSessions() {
    const response = await authService.sessions(requireAccessToken())
    return response.data
  }

  function revokeSession(sessionId: string) {
    return authService.revokeSession(requireAccessToken(), sessionId)
  }

  return {
    accessToken: readonly(accessToken),
    user: readonly(user),
    sessionReady: readonly(sessionReady),
    login,
    register,
    restoreSession,
    logout,
    refreshProfile,
    changePassword,
    loadSessions,
    revokeSession,
  }
}
