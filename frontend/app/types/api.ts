export interface ApiData<T> {
  data: T
}

export interface ApiList<T> {
  data: T[]
  total: number
}

export interface ApiErrorBody {
  error: {
    message: string
    code?: string
  }
}
