<script setup lang="ts">
import { createActivityService } from '~/services/api/activity'
import { normalizeDataError } from '~/services/dataError'
import type { ActivityEntry } from '~/types/backend'

definePageMeta({ middleware: 'auth' })

const config = useRuntimeConfig()
const { accessToken } = useAuth()
const service = createActivityService(config.public.authApiBaseUrl)
const entries = ref<ActivityEntry[]>([])
const search = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const visibleEntries = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return entries.value
  return entries.value.filter((entry) => `${entry.details} ${entry.action}`.toLowerCase().includes(query))
})

const actionNames: Record<string, string> = {
  account_registered: 'Создание аккаунта',
  login: 'Вход в аккаунт',
  logout: 'Выход из аккаунта',
  password_changed: 'Смена пароля',
  session_revoked: 'Завершение другого входа',
  server_created: 'Создание конфигурации сервера',
  server_updated: 'Изменение конфигурации сервера',
  server_deleted: 'Удаление конфигурации сервера',
  preset_created: 'Создание пресета',
  preset_updated: 'Изменение пресета',
  preset_deleted: 'Удаление пресета',
  mod_uploaded: 'Загрузка мода',
  mod_deleted: 'Удаление мода',
}

onMounted(() => { void loadActivity() })

async function loadActivity() {
  if (!accessToken.value || isLoading.value) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    entries.value = await service.list(accessToken.value)
  } catch (error) {
    errorMessage.value = normalizeDataError(error).message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="page">
    <header class="page-heading">
      <div><h1>Журнал действий</h1><p class="page-description">Последние действия в твоём аккаунте.</p></div>
      <button class="btn" type="button" :disabled="isLoading" @click="loadActivity"><Icon name="lucide:refresh-cw" :size="16" aria-hidden="true" />Обновить</button>
    </header>

    <section class="panel activity-panel">
      <div class="activity-toolbar">
        <label class="search-field">
          <Icon name="lucide:search" :size="17" aria-hidden="true" />
          <input v-model="search" class="text-control" type="search" placeholder="Поиск по журналу" aria-label="Поиск по журналу">
        </label>
        <span class="activity-count">{{ visibleEntries.length }} записей</span>
      </div>

      <div v-if="isLoading" class="empty-state" role="status"><strong>Загружаем журнал…</strong></div>
      <div v-else-if="errorMessage" class="empty-state" role="alert"><strong>Не удалось загрузить журнал</strong><p>{{ errorMessage }}</p><button class="btn" type="button" @click="loadActivity">Повторить</button></div>
      <div v-else-if="visibleEntries.length" class="activity-list">
        <article v-for="entry in visibleEntries" :key="entry.id" class="activity-row">
          <span class="activity-mark" aria-hidden="true"><Icon name="lucide:history" :size="16" /></span>
          <div class="activity-copy"><strong>{{ actionNames[entry.action] ?? entry.action }}</strong><p>{{ entry.details }}</p></div>
          <time :datetime="entry.createdAt">{{ new Date(entry.createdAt).toLocaleString('ru-RU') }}</time>
        </article>
      </div>
      <div v-else class="empty-state"><strong>{{ search ? 'Ничего не найдено' : 'Пока нет записей' }}</strong><p>{{ search ? 'Попробуй изменить поисковый запрос.' : 'Здесь появятся действия с аккаунтом, конфигурациями и пресетами.' }}</p></div>
    </section>
  </section>
</template>
