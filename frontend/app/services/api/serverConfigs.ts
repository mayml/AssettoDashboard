import { createHttpClient } from '~/services/httpClient'
import type { ApiData, ApiList } from '~/types/api'
import type { ServerConfig, ServerConfigInput } from '~/types/backend'

export function createServerConfigsService(baseUrl: string) {
  const client = createHttpClient(baseUrl)

  return {
    async list(accessToken: string) {
      const response = await client.get<ApiList<ServerConfig>>('/servers', { accessToken })
      return response.data
    },
    async create(accessToken: string, input: ServerConfigInput) {
      const response = await client.post<ApiData<ServerConfig>>('/servers', input, { accessToken })
      return response.data
    },
    async update(accessToken: string, id: string, input: Partial<ServerConfigInput>) {
      const response = await client.patch<ApiData<ServerConfig>>(`/servers/${encodeURIComponent(id)}`, input, { accessToken })
      return response.data
    },
    remove(accessToken: string, id: string) {
      return client.delete(`/servers/${encodeURIComponent(id)}`, { accessToken })
    },
  }
}
