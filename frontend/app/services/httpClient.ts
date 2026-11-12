import { $fetch } from 'ofetch'
import { normalizeDataError } from '~/services/dataError'

export interface HttpClient {
  get<T>(path: string): Promise<T>
  post<T>(path: string, body: object): Promise<T>
  patch<T>(path: string, body: object): Promise<T>
  delete(path: string): Promise<void>
}

export function createHttpClient(baseURL: string): HttpClient {
  async function send<T>(path: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE', body?: object): Promise<T> {
    try {
      return await $fetch<T>(path, {
        baseURL,
        method,
        ...(body ? { body: body as Record<string, unknown> } : {}),
      })
    } catch (error) {
      throw normalizeDataError(error)
    }
  }

  return {
    get: path => send(path, 'GET'),
    post: (path, body) => send(path, 'POST', body),
    patch: (path, body) => send(path, 'PATCH', body),
    delete: async path => { await send(path, 'DELETE') },
  }
}
