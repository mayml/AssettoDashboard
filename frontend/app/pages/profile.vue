<script setup lang="ts">
import { normalizeDataError } from '~/services/dataError'
import type { AccountSession } from '~/services/api/auth'

definePageMeta({ middleware: 'auth' })

const { user, sessionReady, logout, refreshProfile, changePassword, loadSessions, revokeSession } = useAuth()
const isLoggingOut = ref(false)
const isLoadingAccount = ref(false)
const isSavingPassword = ref(false)
const busySessionId = ref<string | null>(null)
const sessions = ref<AccountSession[]>([])
const accountError = ref('')
const accountNotice = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const initials = computed(() => user.value?.email.slice(0, 2).toUpperCase() ?? '--')

async function loadAccount() {
  if (isLoadingAccount.value || !user.value) return
  isLoadingAccount.value = true
  accountError.value = ''
  try {
    await refreshProfile()
    sessions.value = await loadSessions()
  } catch (error) {
    accountError.value = normalizeDataError(error).message
  } finally {
    isLoadingAccount.value = false
  }
}

async function savePassword() {
  if (isSavingPassword.value) return
  accountError.value = ''
  accountNotice.value = ''

  if (newPassword.value !== confirmPassword.value) {
    accountError.value = 'Новые пароли не совпадают.'
    return
  }

  isSavingPassword.value = true
  try {
    await changePassword(currentPassword.value, newPassword.value)
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    accountNotice.value = 'Пароль изменён. Остальные входы завершены.'
    sessions.value = await loadSessions()
  } catch (error) {
    accountError.value = normalizeDataError(error).message
  } finally {
    isSavingPassword.value = false
  }
}

async function endSession(session: AccountSession) {
  if (session.isCurrent || busySessionId.value) return
  if (!window.confirm('Завершить этот вход в аккаунт?')) return

  busySessionId.value = session.id
  accountError.value = ''
  try {
    await revokeSession(session.id)
    sessions.value = sessions.value.filter(item => item.id !== session.id)
    accountNotice.value = 'Вход завершён.'
  } catch (error) {
    accountError.value = normalizeDataError(error).message
  } finally {
    busySessionId.value = null
  }
}

async function signOut() {
  if (isLoggingOut.value) return
  isLoggingOut.value = true
  await logout()
  await navigateTo('/')
}

watch([sessionReady, user], ([ready, currentUser]) => {
  if (ready && currentUser) void loadAccount()
}, { immediate: true })
</script>

<template>
  <section class="page">
    <header class="page-heading"><div><h1>Профиль</h1></div></header>

    <section v-if="!sessionReady || isLoadingAccount" class="panel empty-state" role="status">
      <strong>Загружаем данные аккаунта…</strong>
    </section>
    <section v-else-if="user" class="panel profile-card">
      <div class="avatar" aria-hidden="true">{{ initials }}</div>
      <div>
        <h2>Профиль аккаунта</h2>
        <p>{{ user.email }}</p>
        <span class="badge badge-running">Вход выполнен</span>
      </div>
    </section>
    <section v-else class="panel empty-state">
      <strong>Вход не выполнен</strong>
      <p>Войди в аккаунт, чтобы открыть профиль.</p>
      <NuxtLink to="/" class="btn login-submit">Войти в панель</NuxtLink>
    </section>

    <p v-if="accountError" class="auth-feedback is-error" role="alert">{{ accountError }}</p>
    <p v-if="accountNotice" class="auth-feedback" role="status">{{ accountNotice }}</p>

    <section v-if="sessionReady && user" class="panel account-security-panel">
      <header class="panel-heading">
        <div><h2>Сменить пароль</h2><p>После смены пароля другие активные входы завершатся.</p></div>
      </header>
      <form class="account-password-form" @submit.prevent="savePassword">
        <FormInput id="current-password" v-model="currentPassword" label="Текущий пароль" type="password" autocomplete="current-password" required :disabled="isSavingPassword" />
        <FormInput id="new-password" v-model="newPassword" label="Новый пароль" type="password" autocomplete="new-password" minlength="8" hint="Не менее 8 символов" required :disabled="isSavingPassword" />
        <FormInput id="confirm-password" v-model="confirmPassword" label="Повтори новый пароль" type="password" autocomplete="new-password" minlength="8" required :disabled="isSavingPassword" />
        <button class="btn btn-primary" type="submit" :disabled="isSavingPassword">
          {{ isSavingPassword ? 'Сохраняем…' : 'Сохранить пароль' }}
        </button>
      </form>
    </section>

    <section v-if="sessionReady && user" class="panel account-security-panel">
      <header class="panel-heading">
        <div><h2>Активные входы</h2><p>Другие входы можно завершить отдельно.</p></div>
        <button class="btn" type="button" :disabled="isLoadingAccount" @click="loadAccount">Обновить</button>
      </header>
      <div v-if="sessions.length" class="account-session-list">
        <article v-for="session in sessions" :key="session.id" class="account-session-row">
          <div>
            <strong>{{ session.isCurrent ? 'Текущий вход' : 'Другой вход' }}</strong>
            <p>Создан {{ new Date(session.createdAt).toLocaleString('ru-RU') }}</p>
          </div>
          <span v-if="session.isCurrent" class="badge badge-running">Сейчас</span>
          <button v-else class="btn btn-danger" type="button" :disabled="busySessionId === session.id" @click="endSession(session)">
            {{ busySessionId === session.id ? 'Завершаем…' : 'Завершить' }}
          </button>
        </article>
      </div>
      <div v-else class="empty-state account-empty-state"><strong>Активных входов нет</strong></div>
    </section>

    <section v-if="sessionReady && user" class="panel account-panel">
      <h2>Учётная запись</h2>
      <p>Завершить текущий вход в панель.</p>
      <button class="btn btn-danger" type="button" :disabled="isLoggingOut" @click="signOut">
        <Icon name="lucide:log-out" :size="16" aria-hidden="true" />{{ isLoggingOut ? 'Выход…' : 'Выйти' }}
      </button>
    </section>
  </section>
</template>
