import type { CreateSessionInput, Session, UpdateSessionInput } from '~/types/models'
import { createApiCrudService } from '~/services/api/createApiCrudService'
import type { HttpClient } from '~/services/httpClient'

export function createApiSessionsService(client: HttpClient) {
  return createApiCrudService<Session, CreateSessionInput, UpdateSessionInput>(client, '/sessions')
}
