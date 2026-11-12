export class DataError extends Error {
  statusCode: number
  code: string

  constructor(message: string, statusCode = 0, code = 'REQUEST_FAILED') {
    super(message)
    this.name = 'DataError'
    this.statusCode = statusCode
    this.code = code
  }
}

export function normalizeDataError(error: unknown): DataError {
  if (error instanceof DataError) return error

  const details = typeof error === 'object' && error !== null
    ? error as {
        status?: number
        statusCode?: number
        message?: string
        data?: { message?: string; error?: { message?: string; code?: string } }
      }
    : {}
  const message = details.data?.error?.message
    ?? details.data?.message
    ?? details.message
    ?? (error instanceof Error ? error.message : 'Не удалось получить данные.')
  const statusCode = details.statusCode ?? details.status ?? 0
  const code = details.data?.error?.code ?? 'REQUEST_FAILED'

  return new DataError(message, statusCode, code)
}
