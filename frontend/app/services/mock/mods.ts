import type { CreateModInput, Mod, UpdateModInput } from '~/types/models'
import { createMockCrudService } from '~/services/mock/createMockCrudService'
import type { MockCollection } from '~/services/mock/store'

export function createMockModsService(collection: MockCollection<Mod>, delayMs = 300) {
  return createMockCrudService<Mod, CreateModInput, UpdateModInput>(
    collection,
    'mod',
    (id, input) => ({ id, ...input }),
    delayMs,
  )
}
