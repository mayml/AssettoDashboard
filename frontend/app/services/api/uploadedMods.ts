import { createHttpClient } from '~/services/httpClient'
import type { ApiData, ApiList } from '~/types/api'
import type { UploadedMod } from '~/types/backend'

export function createUploadedModsService(baseUrl: string) {
  const client = createHttpClient(baseUrl)

  return {
    async list(accessToken: string) {
      const response = await client.get<ApiList<UploadedMod>>('/mods', { accessToken })
      return response.data
    },
    async upload(accessToken: string, file: File) {
      const body = new FormData()
      body.append('file', file)
      const response = await client.upload<ApiData<UploadedMod>>('/mods', body, { accessToken })
      return response.data
    },
    remove(accessToken: string, id: string) {
      return client.delete(`/mods/${encodeURIComponent(id)}`, { accessToken })
    },
  }
}
