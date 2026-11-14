import { createHttpClient } from '~/services/httpClient'

export interface AuthUser {
  id: string
  email: string
  createdAt?: string
}

export interface AuthSessionResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface AccountSession {
  id: string
  createdAt: string
  expiredAt: string
  isCurrent: boolean
}

export function createAuthService(baseUrl: string) {
  const client = createHttpClient(baseUrl)

  return {
    register(email: string, password: string) {
      return client.post<AuthUser>('/auth/register', { email, password })
    },
    login(email: string, password: string) {
      return client.post<AuthSessionResponse>('/auth/login', { email, password })
    },
    refresh(refreshToken: string) {
      return client.post<AuthSessionResponse>('/auth/refresh', { refreshToken })
    },
    logout(refreshToken: string) {
      return client.post<void>('/auth/logout', { refreshToken })
    },
    me(accessToken: string) {
      return client.get<AuthUser>('/auth/me', { accessToken })
    },
    changePassword(accessToken: string, currentPassword: string, newPassword: string) {
      return client.post<{ message: string }>('/auth/password', { currentPassword, newPassword }, { accessToken })
    },
    sessions(accessToken: string) {
      return client.get<{ data: AccountSession[] }>('/auth/sessions', { accessToken })
    },
    revokeSession(accessToken: string, sessionId: string) {
      return client.delete(`/auth/sessions/${encodeURIComponent(sessionId)}`, { accessToken })
    },
  }
}
