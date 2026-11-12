import type { ApiData, ApiList } from '~/types/api'
import type { EntityService } from '~/services/contracts'
import type { HttpClient } from '~/services/httpClient'

export function createApiCrudService<T extends { id: string }, CreateInput, UpdateInput>(
  client: HttpClient,
  path: string,
): EntityService<T, CreateInput, UpdateInput> {
  return {
    async list() {
      const response = await client.get<ApiList<T>>(path)
      return response.data
    },

    async get(id) {
      const response = await client.get<ApiData<T>>(`${path}/${id}`)
      return response.data
    },

    async create(input) {
      const response = await client.post<ApiData<T>>(path, input as object)
      return response.data
    },

    async update(id, input) {
      const response = await client.patch<ApiData<T>>(`${path}/${id}`, input as object)
      return response.data
    },

    async remove(id) {
      await client.delete(`${path}/${id}`)
    },
  }
}
