<script setup lang="ts">
import { createPresetsService } from '~/services/api/presets'
import { normalizeDataError } from '~/services/dataError'
import type { ServerConfig } from '~/types/backend'

definePageMeta({ middleware: 'auth' })

const { servers, status, errorMessage, load, create, update, remove } = useServerConfigs()
const { serverFormOptions, notify } = useDashboardData()
const route = useRoute()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const { accessToken } = useAuth()
const presetsService = createPresetsService(runtimeConfig.public.authApiBaseUrl)
const createDialog = ref<HTMLDialogElement | null>(null)
const dialogOpen = ref(false)
const isSaving = ref(false)
const pendingServer = ref<Pick<ServerConfig, 'id' | 'name'> | null>(null)
const editingServer = ref<ServerConfig | null>(null)
const sourcePresetName = ref<string | null>(null)
const deleteDialogOpen = ref(false)
const isDeleting = ref(false)
const name = ref('')
const track = ref(serverFormOptions.defaultTrack)
const trackConfig = ref(serverFormOptions.defaultTrackConfig)
const mode = ref(serverFormOptions.defaultMode)
const slots = ref(serverFormOptions.defaultSlots)
const practiceMinutes = ref(serverFormOptions.defaultPracticeMinutes)
const qualifyingMinutes = ref(serverFormOptions.defaultQualifyingMinutes)
const raceLaps = ref(serverFormOptions.defaultRaceLaps)
const cars = ref([...serverFormOptions.defaultCars])
const weather = ref(serverFormOptions.defaultWeather)
const timeOfDay = ref(serverFormOptions.defaultTimeOfDay)
const trackConfigOptions = computed(() => serverFormOptions.trackConfigurations[track.value] ?? [])

watch(track, (selectedTrack) => {
  const options = serverFormOptions.trackConfigurations[selectedTrack] ?? []
  if (!options.includes(trackConfig.value)) trackConfig.value = options[0] ?? ''
})

watch(dialogOpen, async (isOpen) => {
  await nextTick()
  const element = createDialog.value
  if (!element) return
  if (isOpen && !element.open) element.showModal()
  if (!isOpen && element.open) element.close()
}, { flush: 'post' })

onMounted(async () => {
  await load()
  await loadPresetFromQuery()
})

function openCreateDialog() {
  editingServer.value = null
  sourcePresetName.value = null
  name.value = ''
  track.value = serverFormOptions.defaultTrack
  trackConfig.value = serverFormOptions.defaultTrackConfig
  mode.value = serverFormOptions.defaultMode
  slots.value = serverFormOptions.defaultSlots
  practiceMinutes.value = serverFormOptions.defaultPracticeMinutes
  qualifyingMinutes.value = serverFormOptions.defaultQualifyingMinutes
  raceLaps.value = serverFormOptions.defaultRaceLaps
  cars.value = [...serverFormOptions.defaultCars]
  weather.value = serverFormOptions.defaultWeather
  timeOfDay.value = serverFormOptions.defaultTimeOfDay
  dialogOpen.value = true
}

function openEditDialog(server: ServerConfig) {
  editingServer.value = server
  sourcePresetName.value = null
  name.value = server.name
  track.value = server.track
  trackConfig.value = server.trackConfig
  mode.value = server.mode
  slots.value = server.slots
  practiceMinutes.value = server.practiceMinutes
  qualifyingMinutes.value = server.qualifyingMinutes
  raceLaps.value = server.raceLaps
  cars.value = [...server.cars]
  weather.value = server.weather
  timeOfDay.value = server.timeOfDay
  dialogOpen.value = true
}

async function loadPresetFromQuery() {
  const presetId = route.query.preset
  if (typeof presetId !== 'string') return

  try {
    if (!accessToken.value) throw new Error('Сессия завершилась. Войди в аккаунт ещё раз.')
    const presets = await presetsService.list(accessToken.value)
    const preset = presets.find(item => item.id === presetId)
    if (!preset) {
      notify('Пресет не найден.', 'error')
      return
    }

    editingServer.value = null
    sourcePresetName.value = preset.name
    name.value = preset.name
    track.value = preset.track
    trackConfig.value = preset.trackConfig
    mode.value = preset.mode
    slots.value = preset.slots
    practiceMinutes.value = preset.practiceMinutes
    qualifyingMinutes.value = preset.qualifyingMinutes
    raceLaps.value = preset.raceLaps
    cars.value = [...preset.cars]
    weather.value = preset.weather
    timeOfDay.value = preset.timeOfDay
    dialogOpen.value = true
  } catch (error) {
    notify(normalizeDataError(error).message, 'error')
  } finally {
    await router.replace({ path: '/servers' })
  }
}

function carName(carId: string) {
  return serverFormOptions.cars.find(car => car.value === carId)?.label ?? carId
}

function closeDialog() {
  if (!isSaving.value) dialogOpen.value = false
}

function handleDialogCancel(event: Event) {
  if (isSaving.value) {
    event.preventDefault()
    return
  }
  dialogOpen.value = false
}

function handleDialogBackdrop(event: MouseEvent) {
  if (event.target === createDialog.value) closeDialog()
}

async function submitServer() {
  const serverName = name.value.trim()
  if (!serverName || isSaving.value) return
  if (!cars.value.length) {
    notify('Выбери хотя бы одну машину.', 'error')
    return
  }

  isSaving.value = true
  try {
    const input = {
      name: serverName,
      track: track.value,
      trackConfig: trackConfig.value,
      mode: mode.value,
      slots: slots.value,
      practiceMinutes: practiceMinutes.value,
      qualifyingMinutes: qualifyingMinutes.value,
      raceLaps: raceLaps.value,
      cars: [...cars.value],
      weather: weather.value,
      timeOfDay: timeOfDay.value,
    }
    const saved = editingServer.value
      ? await update(editingServer.value.id, input)
      : await create(input)
    if (!saved) return
    dialogOpen.value = false
  } finally {
    isSaving.value = false
  }
}

function requestRemove(server: ServerConfig) {
  pendingServer.value = { id: server.id, name: server.name }
  deleteDialogOpen.value = true
}

async function confirmRemove() {
  if (!pendingServer.value || isDeleting.value) return
  isDeleting.value = true
  try {
    const removed = await remove(pendingServer.value.id)
    if (!removed) return
    deleteDialogOpen.value = false
    pendingServer.value = null
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <section class="page">
    <header class="page-heading">
      <div><h1>Серверы</h1><p class="page-description">Сохраняй свои конфигурации для будущего запуска.</p></div>
      <button class="btn btn-primary" type="button" @click="openCreateDialog">
        <Icon name="lucide:plus" :size="17" aria-hidden="true" />Создать конфигурацию
      </button>
    </header>

    <section class="panel" aria-labelledby="my-servers-heading">
      <header class="panel-heading">
        <div><h2 id="my-servers-heading">Мои конфигурации</h2><p>Сохраняются в твоём аккаунте.</p></div>
      </header>

      <div v-if="status === 'idle' || status === 'loading'" class="empty-state" role="status"><strong>Загружаем конфигурации…</strong></div>
      <div v-else-if="status === 'error'" class="empty-state" role="alert">
        <strong>Не удалось загрузить конфигурации</strong><p>{{ errorMessage }}</p>
        <button class="btn" type="button" @click="load">Повторить</button>
      </div>
      <div v-else-if="servers.length" class="server-list">
        <article v-for="server in servers" :key="server.id" class="server-row">
          <div class="server-info">
            <span class="badge">Сохранено</span>
            <h3>{{ server.name }}</h3>
            <p>{{ server.track }} · {{ server.trackConfig }} · {{ server.mode }} · {{ server.slots }} мест</p>
            <p class="server-config-detail">Практика {{ server.practiceMinutes }} мин · квалификация {{ server.qualifyingMinutes }} мин · гонка {{ server.raceLaps }} кругов</p>
            <p class="server-config-detail">{{ server.cars.length ? server.cars.map(carName).join(', ') : 'Машины не выбраны' }}</p>
            <p class="server-config-detail">{{ server.weather }} · {{ server.timeOfDay }}</p>
          </div>
          <div class="server-actions">
            <button class="btn" type="button" @click="openEditDialog(server)">
              <Icon name="lucide:pencil" :size="16" aria-hidden="true" /><span>Изменить</span>
            </button>
            <button class="btn btn-danger server-remove" type="button" :aria-label="`Удалить конфигурацию ${server.name}`" @click="requestRemove(server)">
              <Icon name="lucide:trash-2" :size="16" aria-hidden="true" /><span>Удалить</span>
            </button>
          </div>
        </article>
      </div>
      <div v-else class="empty-state">
        <strong>Конфигураций пока нет</strong>
        <p>Создай первую, чтобы сохранить трассу, режим и число мест.</p>
        <button class="btn btn-primary" type="button" @click="openCreateDialog">Создать конфигурацию</button>
      </div>
    </section>

    <dialog
      ref="createDialog"
      class="server-create-dialog"
      aria-labelledby="create-server-title"
      aria-describedby="create-server-description"
      @cancel="handleDialogCancel"
      @click="handleDialogBackdrop"
    >
      <header class="panel-heading">
        <div>
          <h2 id="create-server-title">{{ editingServer ? 'Изменить конфигурацию' : sourcePresetName ? 'Новая конфигурация из пресета' : 'Новая конфигурация' }}</h2>
          <p id="create-server-description">{{ sourcePresetName ? `Настройки перенесены из «${sourcePresetName}». Проверь их и сохрани.` : 'Эти настройки сохранятся в твоём аккаунте.' }}</p>
        </div>
        <button class="dialog-close" type="button" aria-label="Закрыть окно" :disabled="isSaving" @click="closeDialog">
          <Icon name="lucide:x" :size="18" aria-hidden="true" />
        </button>
      </header>
      <form class="create-form" @submit.prevent="submitServer">
        <div class="form-fields">
          <FormInput id="server-name" v-model="name" label="Название" name="serverName" placeholder="Например, Friday Drift" :maxlength="32" :disabled="isSaving" required />
          <FormSelect id="server-track" v-model="track" :options="serverFormOptions.tracks" label="Трасса" name="track" :disabled="isSaving" />
          <FormSelect id="server-track-config" v-model="trackConfig" :options="trackConfigOptions" label="Конфигурация трассы" name="trackConfig" :disabled="isSaving" />
          <FormSelect id="server-mode" v-model="mode" :options="serverFormOptions.modes" label="Тип сессии" name="mode" :disabled="isSaving" />
          <FormSelect id="server-slots" v-model="slots" :options="serverFormOptions.slots" label="Мест для игроков" name="slots" :disabled="isSaving" />
          <FormInput id="server-practice" v-model="practiceMinutes" label="Практика, минут" type="number" min="0" max="300" required :disabled="isSaving" />
          <FormInput id="server-qualifying" v-model="qualifyingMinutes" label="Квалификация, минут" type="number" min="0" max="120" required :disabled="isSaving" />
          <FormInput id="server-race-laps" v-model="raceLaps" label="Кругов в гонке" type="number" min="1" max="200" required :disabled="isSaving" />
          <fieldset class="car-picker" :disabled="isSaving">
            <legend class="form-label">Машины</legend>
            <p class="car-picker-hint">Выбрано: {{ cars.length }}. Выбери хотя бы одну машину.</p>
            <label v-for="car in serverFormOptions.cars" :key="car.value" class="car-option">
              <input v-model="cars" type="checkbox" :value="car.value">
              <span>{{ car.label }}</span>
            </label>
          </fieldset>
          <FormSelect id="server-weather" v-model="weather" :options="serverFormOptions.weather" label="Погода" name="weather" :disabled="isSaving" />
          <FormSelect id="server-time" v-model="timeOfDay" :options="serverFormOptions.timeOfDay" label="Время суток" name="timeOfDay" :disabled="isSaving" />
        </div>
        <div class="form-actions">
          <button class="btn" type="button" :disabled="isSaving" @click="closeDialog">Отмена</button>
          <button class="btn btn-primary" type="submit" :disabled="isSaving">
            <Icon :name="isSaving ? 'lucide:loader-circle' : 'lucide:save'" :size="17" aria-hidden="true" />
            {{ isSaving ? 'Сохраняем…' : 'Сохранить' }}
          </button>
        </div>
      </form>
    </dialog>

    <ConfirmDialog v-model:open="deleteDialogOpen" :item-name="pendingServer?.name ?? ''" item-type="сервер" :busy="isDeleting" @confirm="confirmRemove" />
  </section>
</template>
