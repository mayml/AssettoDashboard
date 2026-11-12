export type ServerStatus = 'running' | 'stopped'

export interface Server {
  id: string
  name: string
  track: string
  mode: string
  port: number
  players: number
  slots: number
  status: ServerStatus
}

export interface Player {
  id: string
  name: string
  car: string
  laps: number
  bestLap: string
  online: boolean
}

export interface Session {
  id: string
  name: string
  server: string
  track: string
  mode: string
  players: number
  time: string
  status: ServerStatus
}

export interface Mod {
  id: string
  name: string
  type: string
  version: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface CreateServerInput {
  name: string
  track: string
  mode: string
  slots: number
}

export interface CreatePlayerInput {
  name: string
  car: string
  laps: number
  bestLap: string
  online: boolean
}

export interface CreateSessionInput {
  name: string
  server: string
  track: string
  mode: string
  players: number
  time: string
  status: ServerStatus
}

export interface CreateModInput {
  name: string
  type: string
  version: string
}

export interface CreateUserInput {
  name: string
  email: string
  role: string
}

export type UpdateServerInput = Partial<Omit<Server, 'id'>>
export type UpdatePlayerInput = Partial<Omit<Player, 'id'>>
export type UpdateSessionInput = Partial<Omit<Session, 'id'>>
export type UpdateModInput = Partial<Omit<Mod, 'id'>>
export type UpdateUserInput = Partial<Omit<User, 'id'>>
