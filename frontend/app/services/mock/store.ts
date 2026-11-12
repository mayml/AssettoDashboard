import type { Ref } from 'vue'
import type { Mod, Player, Server, Session, User } from '~/types/models'

export interface MockCollection<T> {
  items: Ref<T[]>
  nextId: Ref<number>
}

export interface MockStore {
  servers: MockCollection<Server>
  players: MockCollection<Player>
  sessions: MockCollection<Session>
  mods: MockCollection<Mod>
  users: MockCollection<User>
}
