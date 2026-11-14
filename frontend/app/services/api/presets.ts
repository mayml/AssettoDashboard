import { createHttpClient } from '~/services/httpClient'
import type { ApiData, ApiList } from '~/types/api'
import type { SessionPreset, SessionPresetInput } from '~/types/backend'

export function createPresetsService(baseUrl: string) {
  const client = createHttpClient(baseUrl)

  return {
    async list(accessToken: string) {
      const response = await client.get<ApiList<SessionPreset>>('/presets', { accessToken })
      return response.data
    },
    async create(accessToken: string, input: SessionPresetInput) {
      const response = await client.post<ApiData<SessionPreset>>('/presets', input, { accessToken })
      return response.data
    },
    async update(accessToken: string, id: string, input: Partial<SessionPresetInput>) {
      const response = await client.patch<ApiData<SessionPreset>>(`/presets/${encodeURIComponent(id)}`, input, { accessToken })
      return response.data
    },
    remove(accessToken: string, id: string) {
      return client.delete(`/presets/${encodeURIComponent(id)}`, { accessToken })
    },
  }
}
