export interface ServerConfig {
  id: string
  name: string
  track: string
  trackConfig: string
  mode: string
  slots: number
  practiceMinutes: number
  qualifyingMinutes: number
  raceLaps: number
  cars: string[]
  weather: string
  timeOfDay: string
  createdAt: string
  updatedAt: string
}

export interface ServerConfigInput {
  name: string
  track: string
  trackConfig: string
  mode: string
  slots: number
  practiceMinutes: number
  qualifyingMinutes: number
  raceLaps: number
  cars: string[]
  weather: string
  timeOfDay: string
}

export interface SessionPreset {
  id: string
  name: string
  track: string
  trackConfig: string
  mode: string
  slots: number
  cars: string[]
  practiceMinutes: number
  qualifyingMinutes: number
  raceLaps: number
  weather: string
  timeOfDay: string
  createdAt: string
  updatedAt: string
}

export type SessionPresetInput = Omit<SessionPreset, 'id' | 'createdAt' | 'updatedAt'>

export interface ActivityEntry {
  id: string
  action: string
  details: string
  createdAt: string
}

export interface UploadedMod {
  id: string
  name: string
  originalName: string
  extension: string
  sizeBytes: number
  createdAt: string
}
