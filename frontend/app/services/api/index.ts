import type { DataServices } from '~/services/contracts'
import { createHttpClient } from '~/services/httpClient'
import { createApiModsService } from '~/services/api/mods'
import { createApiPlayersService } from '~/services/api/players'
import { createApiServersService } from '~/services/api/servers'
import { createApiSessionsService } from '~/services/api/sessions'
import { createApiUsersService } from '~/services/api/users'

export function createApiServices(baseURL: string): DataServices {
  const client = createHttpClient(baseURL)

  return {
    servers: createApiServersService(client),
    players: createApiPlayersService(client),
    sessions: createApiSessionsService(client),
    mods: createApiModsService(client),
    users: createApiUsersService(client),
  }
}
