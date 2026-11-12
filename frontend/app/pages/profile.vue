<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { user, sessionReady, logout } = useAuth()
const isLoggingOut = ref(false)
const initials = computed(() => user.value?.email.slice(0, 2).toUpperCase() ?? '--')

async function signOut() {
  if (isLoggingOut.value) return
  isLoggingOut.value = true
  await logout()
  await navigateTo('/')
}
</script>

<template>
  <section class="page">
    <header class="page-heading">
      <div><h1>Профиль</h1></div>
    </header>

    <section v-if="!sessionReady" class="panel empty-state" role="status"><strong>Проверяем сессию…</strong></section>
    <section v-else-if="user" class="panel profile-card">
      <div class="avatar" aria-hidden="true">{{ initials }}</div>
      <div>
        <h2>Профиль аккаунта</h2>
        <p>{{ user.email }}</p>
        <span class="badge badge-running">Вход выполнен</span>
      </div>
    </section>
    <section v-else class="panel empty-state"><strong>Вход не выполнен</strong><p>Войди в аккаунт, чтобы открыть профиль.</p><NuxtLink to="/" class="btn login-submit">Войти в панель</NuxtLink></section>

    <section v-if="sessionReady && user" class="panel account-panel">
      <h2>Учётная запись</h2>
      <p>Управление учётной записью и выход из панели.</p>
      <button class="btn btn-danger" type="button" :disabled="isLoggingOut" @click="signOut">
        <Icon name="lucide:log-out" :size="16" aria-hidden="true" />{{ isLoggingOut ? 'Выход…' : 'Выйти' }}
      </button>
    </section>
  </section>
</template>
