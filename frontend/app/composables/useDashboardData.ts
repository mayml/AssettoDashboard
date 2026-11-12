import { mockMods, mockPlayers, mockServers, mockSessions, mockUsers } from '~/data/mockData'
import { serverFormOptions } from '~/data/serverFormOptions'
import { normalizeDataError } from '~/services/dataError'
import { createDataServices } from '~/services/dataServices'
import type { DataSource } from '~/services/contracts'
import type { MockStore } from '~/services/mock/store'
import type { CreateServerInput, Mod, Player, Server, Session, User } from '~/types/models'

interface DashboardToast {
  id: number
  message: string
  tone: 'success' | 'error' | 'info'
}

export function useDashboardData() {
  const config = useRuntimeConfig()
  const dataSource: DataSource = config.public.dataSource === 'api' ? 'api' : 'mock'
  const useMockData = dataSource === 'mock'

  const servers = useState<Server[]>('dashboard-servers', () => useMockData ? mockServers.map(item => ({ ...item })) : [])
  const players = useState<Player[]>('dashboard-players', () => useMockData ? mockPlayers.map(item => ({ ...item })) : [])
  const sessions = useState<Session[]>('dashboard-sessions', () => useMockData ? mockSessions.map(item => ({ ...item })) : [])
  const mods = useState<Mod[]>('dashboard-mods', () => useMockData ? mockMods.map(item => ({ ...item })) : [])
  const users = useState<User[]>('dashboard-users', () => useMockData ? mockUsers.map(item => ({ ...item })) : [])

  const store: MockStore = {
    servers: { items: servers, nextId: useState('mock-next-server-id', () => 3) },
    players: { items: players, nextId: useState('mock-next-player-id', () => 7) },
    sessions: { items: sessions, nextId: useState('mock-next-session-id', () => 3) },
    mods: { items: mods, nextId: useState('mock-next-mod-id', () => 4) },
    users: { items: users, nextId: useState('mock-next-user-id', () => 2) },
  }

  const services = createDataServices(dataSource, config.public.apiBaseUrl, store)
  const dataStatus = useState<'idle' | 'loading' | 'loaded' | 'error'>('dashboard-data-status', () => 'idle')
  const errorMessage = useState<string | null>('dashboard-data-error', () => null)
  const toasts = useState<DashboardToast[]>('dashboard-toasts', () => [])
  const toastCounter = useState('dashboard-toast-counter', () => 0)
  const loading = computed(() => dataStatus.value === 'loading')
  const loaded = computed(() => dataStatus.value === 'loaded')
  const currentUser = computed(() => users.value[0] ?? null)

  function notify(message: string, tone: DashboardToast['tone'] = 'success') {
    toastCounter.value += 1
    const id = toastCounter.value
    toasts.value.push({ id, message, tone })
    setTimeout(() => {
      toasts.value = toasts.value.filter(toast => toast.id !== id)
    }, 3000)
  }

  async function loadAll() {
    if (dataStatus.value === 'loaded' || dataStatus.value === 'loading') return

    dataStatus.value = 'loading'
    errorMessage.value = null

    try {
      const [serverList, playerList, sessionList, modList, userList] = await Promise.all([
        services.servers.list(),
        services.players.list(),
        services.sessions.list(),
        services.mods.list(),
        services.users.list(),
      ])

      servers.value = serverList
      players.value = playerList
      sessions.value = sessionList
      mods.value = modList
      users.value = userList
      dataStatus.value = 'loaded'
    } catch (error) {
      dataStatus.value = 'error'
      errorMessage.value = normalizeDataError(error).message
    }
  }

  async function runAction<T>(action: () => Promise<T>): Promise<T | null> {
    errorMessage.value = null
    try {
      return await action()
    } catch (error) {
      const problem = normalizeDataError(error)
      errorMessage.value = problem.message
      notify(problem.message, 'error')
      return null
    }
  }

  async function createServer(input: CreateServerInput) {
    const server = await runAction(() => services.servers.create(input))
    if (!server) return false
    servers.value = [server, ...servers.value.filter(item => item.id !== server.id)]
    notify(`Сервер «${server.name}» создан.`)
    return true
  }

  async function removeServer(id: string) {
    const result = await runAction(() => services.servers.remove(id))
    if (result === null) return false

    servers.value = servers.value.filter(server => server.id !== id)
    notify('Сервер удалён.')
    return true
  }

  async function toggleServer(id: string) {
    const current = servers.value.find(server => server.id === id)
    if (!current) return

    const server = await runAction(() => services.servers.update(id, {
      status: current.status === 'running' ? 'stopped' : 'running',
    }))
    if (!server) return

    servers.value = servers.value.map(item => item.id === id ? server : item)
    notify(server.status === 'running' ? 'Сервер запущен.' : 'Сервер остановлен.', 'info')
  }

  async function restartServer(id: string) {
    const current = servers.value.find(server => server.id === id)
    if (!current || current.status !== 'running') return false

    const stopped = await runAction(() => services.servers.update(id, { status: 'stopped' }))
    if (!stopped) return false
    servers.value = servers.value.map(server => server.id === id ? stopped : server)

    await new Promise(resolve => setTimeout(resolve, 500))

    const restarted = await runAction(() => services.servers.update(id, { status: 'running' }))
    if (!restarted) return false
    servers.value = servers.value.map(server => server.id === id ? restarted : server)
    notify('Сервер перезапущен.', 'info')
    return true
  }

  async function toggleSession(id: string) {
    const current = sessions.value.find(session => session.id === id)
    if (!current) return

    const status = current.status === 'running' ? 'stopped' : 'running'
    const session = await runAction(() => services.sessions.update(id, {
      status,
      time: status === 'running' ? 'Сейчас' : 'Не запущена',
    }))
    if (!session) return

    sessions.value = sessions.value.map(item => item.id === id ? session : item)
    notify(status === 'running' ? 'Сессия запущена.' : 'Сессия остановлена.', 'info')
  }

  async function addMod(name: string) {
    if (mods.value.some(mod => mod.name.toLowerCase() === name.toLowerCase())) {
      notify('Такой мод уже есть в списке.', 'error')
      return
    }

    const mod = await runAction(() => services.mods.create({ name, type: 'Новый мод', version: 'Демо' }))
    if (!mod) return
    mods.value = [mod, ...mods.value.filter(item => item.id !== mod.id)]
    notify('Мод добавлен в список.')
  }

  async function removeMod(id: string) {
    const result = await runAction(() => services.mods.remove(id))
    if (result === null) return false

    mods.value = mods.value.filter(mod => mod.id !== id)
    notify('Мод удалён.')
    return true
  }

  function clearError() {
    errorMessage.value = null
  }

  onServerPrefetch(loadAll)
  onMounted(() => { void loadAll() })

  return {
    servers,
    players,
    sessions,
    mods,
    users,
    currentUser,
    serverFormOptions,
    toasts,
    dataSource,
    dataStatus,
    loading,
    loaded,
    errorMessage,
    services,
    loadAll,
    clearError,
    notify,
    createServer,
    removeServer,
    toggleServer,
    restartServer,
    toggleSession,
    addMod,
    removeMod,
  }
}
