import type { CreateServerInput, Server, UpdateServerInput } from '~/types/models'
import { createMockCrudService } from '~/services/mock/createMockCrudService'
import type { MockCollection } from '~/services/mock/store'

export function createMockServersService(collection: MockCollection<Server>, delayMs = 300) {
  return createMockCrudService<Server, CreateServerInput, UpdateServerInput>(
    collection,
    'server',
    (id, input) => ({
      id,
      ...input,
      port: 9599 + Number(id.replace('server-', '')),
      players: 0,
      status: 'stopped',
    }),
    delayMs,
  )
}
