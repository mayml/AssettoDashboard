import type { CreateModInput, Mod, UpdateModInput } from '~/types/models'
import { createApiCrudService } from '~/services/api/createApiCrudService'
import type { HttpClient } from '~/services/httpClient'

export function createApiModsService(client: HttpClient) {
  return createApiCrudService<Mod, CreateModInput, UpdateModInput>(client, '/mods')
}
