import type { CreateServerInput, Server, UpdateServerInput } from '~/types/models'
import { createApiCrudService } from '~/services/api/createApiCrudService'
import type { HttpClient } from '~/services/httpClient'

export function createApiServersService(client: HttpClient) {
  return createApiCrudService<Server, CreateServerInput, UpdateServerInput>(client, '/servers')
}
