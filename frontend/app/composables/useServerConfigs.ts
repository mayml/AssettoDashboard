import { createServerConfigsService } from '~/services/api/serverConfigs'
import { normalizeDataError } from '~/services/dataError'
import type { ServerConfig, ServerConfigInput } from '~/types/backend'

export function useServerConfigs() {
  const config = useRuntimeConfig()
  const { accessToken } = useAuth()
  const { notify } = useDashboardData()
  const service = createServerConfigsService(config.public.authApiBaseUrl)
  const servers = useState<ServerConfig[]>('saved-server-configs', () => [])
  const status = useState<'idle' | 'loading' | 'loaded' | 'error'>('saved-server-configs-status', () => 'idle')
  const errorMessage = useState<string | null>('saved-server-configs-error', () => null)

  async function run<T>(action: () => Promise<T>): Promise<T | null> {
    try {
      errorMessage.value = null
      return await action()
    } catch (error) {
      const problem = normalizeDataError(error)
      errorMessage.value = problem.message
      notify(problem.message, 'error')
      return null
    }
  }

  async function load() {
    if (!accessToken.value || status.value === 'loading') return
    status.value = 'loading'
    const result = await run(() => service.list(accessToken.value!))
    if (result) {
      servers.value = result
      status.value = 'loaded'
    } else {
      status.value = 'error'
    }
  }

  async function create(input: ServerConfigInput) {
    const server = await run(() => service.create(accessToken.value!, input))
    if (!server) return null
    servers.value = [server, ...servers.value]
    notify(`Настройки «${server.name}» сохранены.`)
    return server
  }

  async function update(id: string, input: ServerConfigInput) {
    const server = await run(() => service.update(accessToken.value!, id, input))
    if (!server) return null
    servers.value = servers.value.map(item => item.id === id ? server : item)
    notify(`Настройки «${server.name}» обновлены.`)
    return server
  }

  async function remove(id: string) {
    const result = await run(async () => {
      await service.remove(accessToken.value!, id)
      return true
    })
    if (!result) return false
    servers.value = servers.value.filter(item => item.id !== id)
    notify('Настройки сервера удалены.')
    return true
  }

  return { servers, status, errorMessage, load, create, update, remove }
}
