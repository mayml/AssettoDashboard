<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { players } = useDashboardData()
const search = ref('')

const onlineCount = computed(() => players.value.filter(player => player.online).length)
const filteredPlayers = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return players.value

  return players.value.filter(player => `${player.name} ${player.car}`.toLowerCase().includes(query))
})
</script>

<template>
  <section class="page">
    <header class="page-heading">
      <div><h1>Игроки и результаты</h1></div>
      <span class="badge badge-running">{{ onlineCount }} онлайн</span>
    </header>

    <section class="panel">
      <header class="panel-heading player-toolbar">
        <div><h2>Список игроков</h2><p>{{ players.length }} пилотов</p></div>
        <FormInput id="player-search" v-model="search" class="search-field" label="Поиск игрока" label-hidden type="search" name="playerSearch" placeholder="Имя или машина">
          <template #leading><Icon name="lucide:search" :size="17" /></template>
        </FormInput>
      </header>

      <div v-if="filteredPlayers.length" class="table-scroll">
        <table class="data-table responsive-table">
          <thead><tr><th>Игрок</th><th>Машина</th><th>Круги</th><th>Лучший круг</th><th>Статус</th></tr></thead>
          <tbody>
            <tr v-for="player in filteredPlayers" :key="player.id">
              <td data-label="Игрок" class="table-player">{{ player.name }}</td>
              <td data-label="Машина">{{ player.car }}</td>
              <td data-label="Круги" class="num">{{ player.laps }}</td>
              <td data-label="Лучший круг" class="lap-time">{{ player.bestLap }}</td>
              <td data-label="Статус"><span class="badge" :class="player.online ? 'badge-running' : 'badge-stopped'">{{ player.online ? 'На сервере' : 'Не в сети' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <strong>{{ players.length ? 'Ничего не найдено' : 'Игроков пока нет' }}</strong>
        <p>{{ players.length ? 'Проверь имя игрока или название машины.' : 'Игроки появятся после подключения к серверу.' }}</p>
      </div>
    </section>
  </section>
</template>
