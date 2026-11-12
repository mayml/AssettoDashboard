import { createHttpClient } from '~/services/httpClient'

export interface AuthUser {
  id: string
  email: string
}

export interface AuthSessionResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
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
  }
}
