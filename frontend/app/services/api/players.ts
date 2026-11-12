import type { CreatePlayerInput, Player, UpdatePlayerInput } from '~/types/models'
import { createApiCrudService } from '~/services/api/createApiCrudService'
import type { HttpClient } from '~/services/httpClient'

export function createApiPlayersService(client: HttpClient) {
  return createApiCrudService<Player, CreatePlayerInput, UpdatePlayerInput>(client, '/players')
}
