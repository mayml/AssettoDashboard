import { createHttpClient } from '~/services/httpClient'
import type { ApiList } from '~/types/api'
import type { ActivityEntry } from '~/types/backend'

export function createActivityService(baseUrl: string) {
  const client = createHttpClient(baseUrl)

  return {
    async list(accessToken: string) {
      const response = await client.get<ApiList<ActivityEntry>>('/activity', { accessToken })
      return response.data
    },
  }
}
