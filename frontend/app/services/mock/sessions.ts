import type { CreateSessionInput, Session, UpdateSessionInput } from '~/types/models'
import { createMockCrudService } from '~/services/mock/createMockCrudService'
import type { MockCollection } from '~/services/mock/store'

export function createMockSessionsService(collection: MockCollection<Session>, delayMs = 300) {
  return createMockCrudService<Session, CreateSessionInput, UpdateSessionInput>(
    collection,
    'session',
    (id, input) => ({ id, ...input }),
    delayMs,
  )
}
