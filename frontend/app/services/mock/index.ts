import type { DataServices } from '~/services/contracts'
import type { MockStore } from '~/services/mock/store'
import { createMockModsService } from '~/services/mock/mods'
import { createMockPlayersService } from '~/services/mock/players'
import { createMockServersService } from '~/services/mock/servers'
import { createMockSessionsService } from '~/services/mock/sessions'
import { createMockUsersService } from '~/services/mock/users'

export function createMockServices(store: MockStore, delayMs = 300): DataServices {
  return {
    servers: createMockServersService(store.servers, delayMs),
    players: createMockPlayersService(store.players, delayMs),
    sessions: createMockSessionsService(store.sessions, delayMs),
    mods: createMockModsService(store.mods, delayMs),
    users: createMockUsersService(store.users, delayMs),
  }
}
