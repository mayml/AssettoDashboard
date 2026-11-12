import type { CreatePlayerInput, Player, UpdatePlayerInput } from '~/types/models'
import { createMockCrudService } from '~/services/mock/createMockCrudService'
import type { MockCollection } from '~/services/mock/store'

export function createMockPlayersService(collection: MockCollection<Player>, delayMs = 300) {
  return createMockCrudService<Player, CreatePlayerInput, UpdatePlayerInput>(
    collection,
    'player',
    (id, input) => ({ id, ...input }),
    delayMs,
  )
}
