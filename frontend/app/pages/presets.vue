<script setup lang="ts">
import { createPresetsService } from '~/services/api/presets'
import { normalizeDataError } from '~/services/dataError'
import type { SessionPreset, SessionPresetInput } from '~/types/backend'

definePageMeta({ middleware: 'auth' })

const config = useRuntimeConfig()
const { accessToken } = useAuth()
const { notify, serverFormOptions } = useDashboardData()
const service = createPresetsService(config.public.authApiBaseUrl)
const presets = ref<SessionPreset[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const busyDeleteId = ref<string | null>(null)
const errorMessage = ref('')
const notice = ref('')
const dialog = ref<HTMLDialogElement | null>(null)
const dialogOpen = ref(false)
const editingPreset = ref<SessionPreset | null>(null)
const pendingPreset = ref<SessionPreset | null>(null)
const deleteDialogOpen = ref(false)

const defaultPreset = (): SessionPresetInput => ({
  name: '',
  track: serverFormOptions.defaultTrack,
  trackConfig: serverFormOptions.defaultTrackConfig,
  mode: serverFormOptions.defaultMode,
  slots: serverFormOptions.defaultSlots,
  cars: [...serverFormOptions.defaultCars],
  practiceMinutes: serverFormOptions.defaultPracticeMinutes,
  qualifyingMinutes: serverFormOptions.defaultQualifyingMinutes,
  raceLaps: serverFormOptions.defaultRaceLaps,
  weather: serverFormOptions.defaultWeather,
  timeOfDay: serverFormOptions.defaultTimeOfDay,
})
const form = reactive<SessionPresetInput>(defaultPreset())
const trackConfigOptions = computed(() => serverFormOptions.trackConfigurations[form.track] ?? [])
const weatherOptions = serverFormOptions.weather
const timeOptions = serverFormOptions.timeOfDay

watch(() => form.track, (selectedTrack) => {
  const options = serverFormOptions.trackConfigurations[selectedTrack] ?? []
  if (!options.includes(form.trackConfig)) form.trackConfig = options[0] ?? ''
})

watch(dialogOpen, async (isOpen) => {
  await nextTick()
  if (!dialog.value) return
  if (isOpen && !dialog.value.open) dialog.value.showModal()
  if (!isOpen && dialog.value.open) dialog.value.close()
}, { flush: 'post' })

onMounted(() => { void loadPresets() })

async function loadPresets() {
  if (!accessToken.value || isLoading.value) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    presets.value = await service.list(accessToken.value)
  } catch (error) {
    errorMessage.value = normalizeDataError(error).message
  } finally {
    isLoading.value = false
  }
}

function openCreate() {
  editingPreset.value = null
  Object.assign(form, defaultPreset())
  dialogOpen.value = true
}

function openEdit(preset: SessionPreset) {
  editingPreset.value = preset
  Object.assign(form, {
    name: preset.name,
    track: preset.track,
    trackConfig: preset.trackConfig,
    mode: preset.mode,
    slots: preset.slots,
    cars: [...preset.cars],
    practiceMinutes: preset.practiceMinutes,
    qualifyingMinutes: preset.qualifyingMinutes,
    raceLaps: preset.raceLaps,
    weather: preset.weather,
    timeOfDay: preset.timeOfDay,
  })
  dialogOpen.value = true
}

function carName(carId: string) {
  return serverFormOptions.cars.find(car => car.value === carId)?.label ?? carId
}

function applyPreset(preset: SessionPreset) {
  void navigateTo({ path: '/servers', query: { preset: preset.id } })
}

function closeDialog() {
  if (!isSaving.value) dialogOpen.value = false
}

function handleDialogCancel(event: Event) {
  if (isSaving.value) event.preventDefault()
  else dialogOpen.value = false
}

function handleDialogBackdrop(event: MouseEvent) {
  if (event.target === dialog.value) closeDialog()
}

async function savePreset() {
  if (!accessToken.value || isSaving.value || !form.name.trim()) return
  if (!form.cars.length) {
    errorMessage.value = 'Выбери хотя бы одну машину.'
    return
  }
  isSaving.value = true
  errorMessage.value = ''
  notice.value = ''
  const input = { ...form, name: form.name.trim() }
  try {
    if (editingPreset.value) {
      const updated = await service.update(accessToken.value, editingPreset.value.id, input)
      presets.value = presets.value.map(item => item.id === updated.id ? updated : item)
      notice.value = `Пресет «${updated.name}» обновлён.`
    } else {
      const created = await service.create(accessToken.value, input)
      presets.value = [created, ...presets.value]
      notice.value = `Пресет «${created.name}» сохранён.`
    }
    notify(notice.value)
    dialogOpen.value = false
  } catch (error) {
    errorMessage.value = normalizeDataError(error).message
  } finally {
    isSaving.value = false
  }
}

function askDelete(preset: SessionPreset) {
  pendingPreset.value = preset
  deleteDialogOpen.value = true
}

async function deletePreset() {
  if (!pendingPreset.value || !accessToken.value || busyDeleteId.value) return
  const preset = pendingPreset.value
  busyDeleteId.value = preset.id
  errorMessage.value = ''
  try {
    await service.remove(accessToken.value, preset.id)
    presets.value = presets.value.filter(item => item.id !== preset.id)
    deleteDialogOpen.value = false
    pendingPreset.value = null
    notice.value = `Пресет «${preset.name}» удалён.`
    notify(notice.value)
  } catch (error) {
    errorMessage.value = normalizeDataError(error).message
  } finally {
    busyDeleteId.value = null
  }
}
</script>

<template>
  <section class="page">
    <header class="page-heading">
      <div><h1>Пресеты сессий</h1><p class="page-description">Сохраняй часто используемые наборы настроек.</p></div>
      <button class="btn btn-primary" type="button" @click="openCreate"><Icon name="lucide:plus" :size="17" aria-hidden="true" />Новый пресет</button>
    </header>

    <p v-if="errorMessage" class="auth-feedback is-error" role="alert">{{ errorMessage }}</p>
    <p v-if="notice" class="auth-feedback" role="status">{{ notice }}</p>

    <section v-if="isLoading" class="panel empty-state" role="status"><strong>Загружаем пресеты…</strong></section>
    <section v-else-if="presets.length" class="preset-grid" aria-label="Сохранённые пресеты">
      <article v-for="preset in presets" :key="preset.id" class="panel preset-card">
        <div class="preset-card-heading">
          <div><span class="badge">{{ preset.mode }}</span><h2>{{ preset.name }}</h2></div>
          <span class="preset-slots">{{ preset.slots }} мест</span>
        </div>
        <p class="preset-track"><Icon name="lucide:map" :size="16" aria-hidden="true" />{{ preset.track }} · {{ preset.trackConfig }}</p>
        <p class="preset-car-list">{{ preset.cars.length ? preset.cars.map(carName).join(', ') : 'Машины не выбраны' }}</p>
        <dl class="preset-facts">
          <div><dt>Практика</dt><dd>{{ preset.practiceMinutes }} мин</dd></div>
          <div><dt>Квалификация</dt><dd>{{ preset.qualifyingMinutes }} мин</dd></div>
          <div><dt>Гонка</dt><dd>{{ preset.raceLaps }} кругов</dd></div>
          <div><dt>Условия</dt><dd>{{ preset.weather }}, {{ preset.timeOfDay }}</dd></div>
        </dl>
        <div class="preset-actions">
          <button class="btn btn-primary" type="button" @click="applyPreset(preset)"><Icon name="lucide:copy-plus" :size="16" aria-hidden="true" />Создать конфигурацию</button>
          <button class="btn" type="button" @click="openEdit(preset)"><Icon name="lucide:pencil" :size="16" aria-hidden="true" />Изменить</button>
          <button class="btn btn-danger" type="button" @click="askDelete(preset)"><Icon name="lucide:trash-2" :size="16" aria-hidden="true" />Удалить</button>
        </div>
      </article>
    </section>
    <section v-else class="panel empty-state">
      <strong>{{ errorMessage ? 'Не удалось загрузить список' : 'Пресетов пока нет' }}</strong>
      <p>{{ errorMessage || 'Сохрани набор трассы, погоды и формата заезда, чтобы быстро найти его позже.' }}</p>
      <button v-if="!errorMessage" class="btn btn-primary" type="button" @click="openCreate">Создать пресет</button>
      <button v-else class="btn" type="button" @click="loadPresets">Повторить</button>
    </section>

    <dialog ref="dialog" class="server-create-dialog preset-dialog" aria-labelledby="preset-dialog-title" @cancel="handleDialogCancel" @click="handleDialogBackdrop">
      <header class="panel-heading">
        <div><h2 id="preset-dialog-title">{{ editingPreset ? 'Изменить пресет' : 'Новый пресет' }}</h2><p>Задай параметры будущей сессии.</p></div>
        <button class="dialog-close" type="button" aria-label="Закрыть окно" :disabled="isSaving" @click="closeDialog"><Icon name="lucide:x" :size="18" aria-hidden="true" /></button>
      </header>
      <form class="create-form" @submit.prevent="savePreset">
        <div class="form-fields preset-form-fields">
          <FormInput id="preset-name" v-model="form.name" label="Название пресета" maxlength="32" placeholder="Например, вечерний дрифт" required :disabled="isSaving" />
          <FormSelect id="preset-track" v-model="form.track" :options="serverFormOptions.tracks" label="Трасса" :disabled="isSaving" />
          <FormSelect id="preset-track-config" v-model="form.trackConfig" :options="trackConfigOptions" label="Конфигурация трассы" :disabled="isSaving" />
          <FormSelect id="preset-mode" v-model="form.mode" :options="serverFormOptions.modes" label="Тип сессии" :disabled="isSaving" />
          <FormSelect id="preset-slots" v-model="form.slots" :options="serverFormOptions.slots" label="Места для игроков" :disabled="isSaving" />
          <fieldset class="car-picker" :disabled="isSaving">
            <legend class="form-label">Машины</legend>
            <p class="car-picker-hint">Выбрано: {{ form.cars.length }}. Выбери хотя бы одну машину.</p>
            <label v-for="car in serverFormOptions.cars" :key="car.value" class="car-option">
              <input v-model="form.cars" type="checkbox" :value="car.value">
              <span>{{ car.label }}</span>
            </label>
          </fieldset>
          <FormInput id="preset-practice" v-model="form.practiceMinutes" label="Практика, минут" type="number" min="0" max="300" required :disabled="isSaving" />
          <FormInput id="preset-qualifying" v-model="form.qualifyingMinutes" label="Квалификация, минут" type="number" min="0" max="120" required :disabled="isSaving" />
          <FormInput id="preset-laps" v-model="form.raceLaps" label="Кругов в гонке" type="number" min="1" max="200" required :disabled="isSaving" />
          <FormSelect id="preset-weather" v-model="form.weather" :options="weatherOptions" label="Погода" :disabled="isSaving" />
          <FormSelect id="preset-time" v-model="form.timeOfDay" :options="timeOptions" label="Время суток" :disabled="isSaving" />
        </div>
        <p v-if="errorMessage" class="auth-feedback is-error" role="alert">{{ errorMessage }}</p>
        <div class="form-actions">
          <button class="btn" type="button" :disabled="isSaving" @click="closeDialog">Отмена</button>
          <button class="btn btn-primary" type="submit" :disabled="isSaving">{{ isSaving ? 'Сохраняем…' : 'Сохранить пресет' }}</button>
        </div>
      </form>
    </dialog>

    <ConfirmDialog v-model:open="deleteDialogOpen" :item-name="pendingPreset?.name ?? ''" item-type="пресет" :busy="Boolean(busyDeleteId)" @confirm="deletePreset" />
  </section>
</template>
