import type {
  CreateModInput,
  CreatePlayerInput,
  CreateServerInput,
  CreateSessionInput,
  CreateUserInput,
  Mod,
  Player,
  Server,
  Session,
  UpdateModInput,
  UpdatePlayerInput,
  UpdateServerInput,
  UpdateSessionInput,
  UpdateUserInput,
  User,
} from '~/types/models'

export type DataSource = 'mock' | 'api'

export interface EntityService<T, CreateInput, UpdateInput> {
  list(): Promise<T[]>
  get(id: string): Promise<T>
  create(input: CreateInput): Promise<T>
  update(id: string, input: UpdateInput): Promise<T>
  remove(id: string): Promise<void>
}

export interface DataServices {
  servers: EntityService<Server, CreateServerInput, UpdateServerInput>
  players: EntityService<Player, CreatePlayerInput, UpdatePlayerInput>
  sessions: EntityService<Session, CreateSessionInput, UpdateSessionInput>
  mods: EntityService<Mod, CreateModInput, UpdateModInput>
  users: EntityService<User, CreateUserInput, UpdateUserInput>
}
