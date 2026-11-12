<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { sessions, toggleSession } = useDashboardData()
</script>

<template>
  <section class="page">
    <header class="page-heading">
      <div><h1>Сессии</h1></div>
    </header>

    <section v-if="sessions.length" class="panel session-list" aria-label="Список сессий">
      <article v-for="session in sessions" :key="session.id" class="session-row">
        <div class="session-copy">
          <span class="badge" :class="session.status === 'running' ? 'badge-running' : 'badge-stopped'">
            {{ session.status === 'running' ? 'Идёт сейчас' : 'Остановлена' }}
          </span>
          <h2>{{ session.name }}</h2>
          <p>{{ session.server }}, {{ session.track }}</p>
        </div>

        <dl class="session-details">
          <div><dt>Режим</dt><dd>{{ session.mode }}</dd></div>
          <div><dt>Игроки</dt><dd>{{ session.players }}</dd></div>
          <div><dt>Время</dt><dd>{{ session.time }}</dd></div>
        </dl>

        <button v-if="session.status === 'running'" class="btn btn-danger" type="button" @click="toggleSession(session.id)">Завершить</button>
        <button v-else class="btn btn-primary" type="button" @click="toggleSession(session.id)">Запустить</button>
      </article>
    </section>
    <section v-else class="panel empty-state">
      <strong>Сессий пока нет</strong>
      <p>Создай сервер, чтобы подготовить первый заезд.</p>
      <NuxtLink to="/servers" class="btn btn-primary">К серверам</NuxtLink>
    </section>
  </section>
</template>
