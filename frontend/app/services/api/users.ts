import type { CreateUserInput, UpdateUserInput, User } from '~/types/models'
import { createApiCrudService } from '~/services/api/createApiCrudService'
import type { HttpClient } from '~/services/httpClient'

export function createApiUsersService(client: HttpClient) {
  return createApiCrudService<User, CreateUserInput, UpdateUserInput>(client, '/users')
}
