import { $fetch } from 'ofetch'
import { normalizeDataError } from '~/services/dataError'

export interface HttpClient {
  get<T>(path: string, options?: RequestOptions): Promise<T>
  post<T>(path: string, body: object, options?: RequestOptions): Promise<T>
  upload<T>(path: string, body: FormData, options?: RequestOptions): Promise<T>
  patch<T>(path: string, body: object, options?: RequestOptions): Promise<T>
  delete(path: string, options?: RequestOptions): Promise<void>
}

export interface RequestOptions {
  accessToken?: string
}

export function createHttpClient(baseURL: string): HttpClient {
  async function send<T>(path: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE', body?: object, options?: RequestOptions): Promise<T> {
    try {
      return await $fetch<T>(path, {
        baseURL,
        method,
        ...(body ? { body: body as Record<string, unknown> } : {}),
        ...(options?.accessToken ? { headers: { Authorization: `Bearer ${options.accessToken}` } } : {}),
      })
    } catch (error) {
      throw normalizeDataError(error)
    }
  }

  async function sendUpload<T>(path: string, body: FormData, options?: RequestOptions): Promise<T> {
    try {
      return await $fetch<T>(path, {
        baseURL,
        method: 'POST',
        body,
        ...(options?.accessToken ? { headers: { Authorization: `Bearer ${options.accessToken}` } } : {}),
      })
    } catch (error) {
      throw normalizeDataError(error)
    }
  }

  return {
    get: (path, options) => send(path, 'GET', undefined, options),
    post: (path, body, options) => send(path, 'POST', body, options),
    upload: (path, body, options) => sendUpload(path, body, options),
    patch: (path, body, options) => send(path, 'PATCH', body, options),
    delete: async (path, options) => { await send(path, 'DELETE', undefined, options) },
  }
}
