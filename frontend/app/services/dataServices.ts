import type { DataSource } from '~/services/contracts'
import type { MockStore } from '~/services/mock/store'
import { createApiServices } from '~/services/api'
import { createMockServices } from '~/services/mock'

export function createDataServices(source: DataSource, apiBaseUrl: string, mockStore: MockStore) {
  if (source === 'api') return createApiServices(apiBaseUrl)
  return createMockServices(mockStore)
}
