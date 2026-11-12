<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { servers, players, sessions, mods, toggleServer, restartServer } = useDashboardData()

const mainServer = computed(() => servers.value[0])
const activeSessions = computed(() => sessions.value.filter(session => session.status === 'running'))
const activeSessionsCaption = computed(() => {
  if (activeSessions.value.length === 0) return 'заездов пока нет'
  return activeSessions.value.length === 1 ? 'сессия запущена' : 'сессии запущены'
})
const onlinePlayers = computed(() => players.value.filter(player => player.online))
const serverAction = ref<'start' | 'stop' | 'restart' | null>(null)

async function powerServer() {
  if (!mainServer.value || serverAction.value) return

  serverAction.value = mainServer.value.status === 'running' ? 'stop' : 'start'
  try {
    await toggleServer(mainServer.value.id)
  } finally {
    serverAction.value = null
  }
}

async function restartMainServer() {
  if (!mainServer.value || serverAction.value || mainServer.value.status !== 'running') return

  serverAction.value = 'restart'
  try {
    await restartServer(mainServer.value.id)
  } finally {
    serverAction.value = null
  }
}
</script>

<template>
  <section class="page page-overview">
    <header class="page-heading">
      <div>
        <h1>Обзор</h1>
      </div>
      <NuxtLink to="/servers" class="btn btn-primary"><Icon name="lucide:plus" :size="17" aria-hidden="true" />Создать сервер</NuxtLink>
    </header>

    <section v-if="mainServer" class="server-lead panel" aria-label="Текущий сервер">
      <div class="server-lead-copy">
        <h2>{{ mainServer.name }}</h2>
      </div>
      <dl class="server-facts">
        <div><dt>Трасса</dt><dd>{{ mainServer.track }}</dd></div>
        <div><dt>Сессия</dt><dd>{{ mainServer.mode }}</dd></div>
        <div><dt>Игроки</dt><dd>{{ mainServer.players }} из {{ mainServer.slots }}</dd></div>
        <div><dt>Порт</dt><dd class="num">{{ mainServer.port }}</dd></div>
      </dl>
      <div class="server-lead-actions">
        <span class="badge server-lead-status" :class="mainServer.status === 'running' && serverAction !== 'restart' ? 'badge-running' : 'badge-stopped'">
          {{ serverAction === 'restart' ? 'Перезапуск' : mainServer.status === 'running' ? 'Работает' : 'Остановлен' }}
        </span>
        <button class="btn server-lead-action" type="button" :disabled="serverAction !== null || mainServer.status !== 'running'" @click="restartMainServer">
          <Icon :name="serverAction === 'restart' ? 'lucide:loader-circle' : 'lucide:rotate-cw'" :size="16" aria-hidden="true" />
          {{ serverAction === 'restart' ? 'Перезапуск…' : 'Перезагрузить' }}
        </button>
        <button
          v-if="mainServer.status === 'running' || serverAction === 'restart' || serverAction === 'stop'"
          class="btn btn-danger server-lead-action"
          type="button"
          :disabled="serverAction !== null"
          @click="powerServer"
        >
          <Icon name="lucide:square" :size="16" aria-hidden="true" />{{ serverAction === 'stop' ? 'Остановка…' : 'Остановить' }}
        </button>
        <button v-else class="btn btn-primary server-lead-action" type="button" :disabled="serverAction !== null" @click="powerServer">
          <Icon :name="serverAction === 'start' ? 'lucide:loader-circle' : 'lucide:play'" :size="16" aria-hidden="true" />
          {{ serverAction === 'start' ? 'Запуск…' : 'Запустить' }}
        </button>
      </div>
    </section>
    <section v-else class="panel empty-state">
      <strong>Серверов пока нет</strong>
      <p>Создай первый сервер, чтобы начать.</p>
      <NuxtLink to="/servers" class="btn btn-primary">Перейти к серверам</NuxtLink>
    </section>

    <section class="quick-summary" aria-label="Сводка">
      <article class="summary-card">
        <div class="summary-card-heading"><span>Игроки онлайн</span><Icon name="lucide:users-round" :size="17" aria-hidden="true" /></div>
        <strong>{{ onlinePlayers.length }}</strong>
        <p>участников на трассе</p>
      </article>
      <article class="summary-card">
        <div class="summary-card-heading"><span>Активные сессии</span><Icon name="lucide:flag" :size="17" aria-hidden="true" /></div>
        <strong>{{ activeSessions.length }}</strong>
        <p>{{ activeSessionsCaption }}</p>
      </article>
      <article class="summary-card">
        <div class="summary-card-heading"><span>Серверы</span><Icon name="lucide:server" :size="17" aria-hidden="true" /></div>
        <strong>{{ servers.length }}</strong>
        <p>в панели управления</p>
      </article>
      <article class="summary-card">
        <div class="summary-card-heading"><span>Моды</span><Icon name="lucide:package" :size="17" aria-hidden="true" /></div>
        <strong>{{ mods.length }}</strong>
        <p>в библиотеке</p>
      </article>
    </section>

    <div class="overview-lower">
      <section class="panel overview-panel">
        <header class="panel-heading">
          <div><h2>Игроки и лучшие круги</h2></div>
          <NuxtLink to="/players" class="simple-link">Все игроки</NuxtLink>
        </header>
        <div v-if="players.length" class="table-scroll">
          <table class="data-table responsive-table">
            <thead><tr><th>Игрок</th><th>Машина</th><th>Круги</th><th>Лучший круг</th></tr></thead>
            <tbody>
              <tr v-for="player in players.slice(0, 4)" :key="player.id">
                <td data-label="Игрок" class="table-player">{{ player.name }}</td>
                <td data-label="Машина">{{ player.car }}</td>
                <td data-label="Круги" class="num">{{ player.laps }}</td>
                <td data-label="Лучший круг" class="lap-time">{{ player.bestLap }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-state"><strong>Пока нет результатов</strong><p>Они появятся, когда игроки проедут круг.</p></div>
      </section>

      <section class="panel overview-panel">
        <header class="panel-heading">
          <div><h2>Сессии на трассе</h2><p>Текущие заезды</p></div>
          <NuxtLink to="/session" class="simple-link">Все сессии</NuxtLink>
        </header>
        <div v-if="activeSessions.length" class="active-session-list">
          <article v-for="session in activeSessions" :key="session.id" class="active-session">
            <div class="active-session-copy">
              <strong>{{ session.name }}</strong>
              <span>{{ session.track }}, {{ session.mode }}</span>
            </div>
            <span class="badge badge-running">{{ session.players }} игроков</span>
          </article>
        </div>
        <div v-else class="empty-state"><strong>Активных сессий нет</strong><p>Запусти сессию, чтобы она появилась здесь.</p></div>
      </section>
    </div>
  </section>
</template>
