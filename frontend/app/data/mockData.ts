import type { Mod, Player, Server, Session, User } from '~/types/models'

// Эти исходные записи показываются в режиме mock.
export const mockServers: Server[] = [
  { id: 'server-1', name: 'Sunday Sprint', track: 'Monza', mode: 'Практика', port: 9600, players: 5, slots: 24, status: 'running' },
  { id: 'server-2', name: 'Nordschleife Nights', track: 'Nürburgring', mode: 'Дрифт', port: 9601, players: 3, slots: 16, status: 'stopped' },
]

export const mockPlayers: Player[] = [
  { id: 'player-1', name: 'Alex Morozov', car: 'BMW M4 GT3', laps: 18, bestLap: '1:49.382', online: true },
  { id: 'player-2', name: 'Nikita Drift', car: 'Nissan Silvia S15', laps: 12, bestLap: '1:51.024', online: true },
  { id: 'player-3', name: 'Kaito_77', car: 'Porsche 911 GT3 R', laps: 9, bestLap: '1:50.116', online: true },
  { id: 'player-4', name: 'm1shanya', car: 'Ferrari 296 GT3', laps: 7, bestLap: '1:52.643', online: true },
  { id: 'player-5', name: 'VladRacing', car: 'Mercedes-AMG GT3', laps: 5, bestLap: '1:53.907', online: true },
  { id: 'player-6', name: 'LenaRacing', car: 'Porsche 911 GT3 R', laps: 22, bestLap: '1:48.905', online: false },
]

export const mockSessions: Session[] = [
  { id: 'session-1', name: 'Воскресный спринт', server: 'Sunday Sprint', track: 'Monza · GP', mode: 'Практика', players: 5, time: 'Сейчас', status: 'running' },
  { id: 'session-2', name: 'Ночной дрифт', server: 'Nordschleife Nights', track: 'Nürburgring', mode: 'Дрифт', players: 3, time: 'Не запущена', status: 'stopped' },
]

export const mockMods: Mod[] = [
  { id: 'mod-1', name: 'Traffic Pack', type: 'Трафик', version: '1.4' },
  { id: 'mod-2', name: 'Akina Drift', type: 'Трасса', version: '2.1' },
  { id: 'mod-3', name: 'BMW M4 GT3', type: 'Машина', version: '1.0' },
]

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Alex Morozov', email: 'alex@assettodash.dev', role: 'Администратор' },
]
