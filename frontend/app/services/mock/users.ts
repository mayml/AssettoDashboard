import type { CreateUserInput, UpdateUserInput, User } from '~/types/models'
import { createMockCrudService } from '~/services/mock/createMockCrudService'
import type { MockCollection } from '~/services/mock/store'

export function createMockUsersService(collection: MockCollection<User>, delayMs = 300) {
  return createMockCrudService<User, CreateUserInput, UpdateUserInput>(
    collection,
    'user',
    (id, input) => ({ id, ...input }),
    delayMs,
  )
}
