<script setup lang="ts">
import { createUploadedModsService } from '~/services/api/uploadedMods'
import { normalizeDataError } from '~/services/dataError'
import type { UploadedMod } from '~/types/backend'

definePageMeta({ middleware: 'auth' })

const MAX_MOD_FILE_BYTES = 50 * 1024 * 1024
const config = useRuntimeConfig()
const { accessToken } = useAuth()
const { notify } = useDashboardData()
const service = createUploadedModsService(config.public.authApiBaseUrl)
const mods = ref<UploadedMod[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isLoading = ref(false)
const isUploading = ref(false)
const busyDeleteId = ref<string | null>(null)
const loadError = ref('')
const uploadError = ref('')
const actionError = ref('')
const pendingMod = ref<UploadedMod | null>(null)
const deleteDialogOpen = ref(false)

onMounted(() => { void loadMods() })

function selectFile(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
  uploadError.value = ''

  if (selectedFile.value && selectedFile.value.size > MAX_MOD_FILE_BYTES) {
    uploadError.value = 'Архив слишком большой. Максимальный размер — 50 МБ.'
  }
}

async function loadMods() {
  if (!accessToken.value || isLoading.value) return
  isLoading.value = true
  loadError.value = ''
  try {
    mods.value = await service.list(accessToken.value)
  } catch (error) {
    loadError.value = normalizeDataError(error).message
  } finally {
    isLoading.value = false
  }
}

async function uploadMod() {
  if (!selectedFile.value || isUploading.value) return
  if (!/\.(zip|7z|rar)$/i.test(selectedFile.value.name)) {
    uploadError.value = 'Выбери архив ZIP, 7Z или RAR.'
    return
  }
  if (selectedFile.value.size > MAX_MOD_FILE_BYTES) {
    uploadError.value = 'Архив слишком большой. Максимальный размер — 50 МБ.'
    return
  }
  if (!accessToken.value) {
    uploadError.value = 'Сессия завершилась. Войди в аккаунт ещё раз.'
    return
  }

  isUploading.value = true
  uploadError.value = ''
  try {
    const mod = await service.upload(accessToken.value, selectedFile.value)
    mods.value = [mod, ...mods.value]
    notify(`Мод «${mod.name}» загружен.`)
    selectedFile.value = null
    if (fileInput.value) fileInput.value.value = ''
  } catch (error) {
    uploadError.value = normalizeDataError(error).message
    notify(uploadError.value, 'error')
  } finally {
    isUploading.value = false
  }
}

function askDelete(mod: UploadedMod) {
  pendingMod.value = mod
  deleteDialogOpen.value = true
}

async function deleteMod() {
  if (!pendingMod.value || !accessToken.value || busyDeleteId.value) return
  const mod = pendingMod.value
  busyDeleteId.value = mod.id
  actionError.value = ''
  try {
    await service.remove(accessToken.value, mod.id)
    mods.value = mods.value.filter(item => item.id !== mod.id)
    deleteDialogOpen.value = false
    pendingMod.value = null
    notify(`Мод «${mod.name}» удалён.`)
  } catch (error) {
    actionError.value = normalizeDataError(error).message
    notify(actionError.value, 'error')
  } finally {
    busyDeleteId.value = null
  }
}

function formatSize(sizeBytes: number) {
  return sizeBytes < 1024 * 1024
    ? `${Math.max(1, Math.round(sizeBytes / 1024))} КБ`
    : `${(sizeBytes / 1024 / 1024).toFixed(1)} МБ`
}
</script>

<template>
  <section class="page">
    <header class="page-heading"><div><h1>Моды</h1><p class="page-description">Загружай архивы и храни их в своём аккаунте.</p></div></header>

    <section class="panel upload-panel">
      <header class="panel-heading">
        <div><h2>Добавить мод</h2><p>Архивы ZIP, 7Z или RAR до 50 МБ.</p></div>
      </header>
      <div class="upload-row">
        <input ref="fileInput" class="control file-control" type="file" accept=".zip,.7z,.rar" :disabled="isUploading" @change="selectFile">
        <button class="btn btn-primary" type="button" :disabled="!selectedFile || isUploading || selectedFile.size > MAX_MOD_FILE_BYTES" @click="uploadMod">
          <Icon :name="isUploading ? 'lucide:loader-circle' : 'lucide:upload'" :size="16" aria-hidden="true" />
          {{ isUploading ? 'Загружаем…' : 'Добавить' }}
        </button>
      </div>
      <p v-if="selectedFile" class="selected-file">Выбран файл: {{ selectedFile.name }} · {{ formatSize(selectedFile.size) }}</p>
      <p v-if="uploadError" class="auth-feedback is-error" role="alert">{{ uploadError }}</p>
      <p class="upload-note">Архив сохранится на backend, но пока не распаковывается и не устанавливается в Assetto Corsa.</p>
    </section>

    <section class="panel">
      <header class="panel-heading">
        <div><h2>Мои архивы</h2><p>{{ mods.length }} {{ mods.length === 1 ? 'мод' : 'модов' }}</p></div>
      </header>
      <p v-if="actionError" class="auth-feedback is-error" role="alert">{{ actionError }}</p>
      <div v-if="isLoading" class="empty-state" role="status"><strong>Загружаем список модов…</strong></div>
      <div v-else-if="loadError && !mods.length" class="empty-state" role="alert">
        <strong>Не удалось загрузить список</strong><p>{{ loadError }}</p>
        <button class="btn" type="button" @click="loadMods">Повторить</button>
      </div>
      <div v-else-if="mods.length" class="mod-list">
        <article v-for="mod in mods" :key="mod.id" class="mod-row">
          <span class="mod-icon"><Icon name="lucide:package" :size="18" aria-hidden="true" /></span>
          <div class="mod-info">
            <strong>{{ mod.name }}</strong>
            <span>{{ mod.originalName }} · {{ formatSize(mod.sizeBytes) }} · {{ new Date(mod.createdAt).toLocaleDateString('ru-RU') }}</span>
          </div>
          <span class="badge badge-running">Загружен</span>
          <button class="btn btn-danger mod-remove" type="button" :aria-label="`Удалить мод ${mod.name}`" :disabled="busyDeleteId === mod.id" @click="askDelete(mod)">
            <Icon name="lucide:trash-2" :size="16" aria-hidden="true" /><span>Удалить</span>
          </button>
        </article>
      </div>
      <div v-else class="empty-state"><strong>Пока архивов нет</strong><p>Выбери ZIP, 7Z или RAR выше, чтобы загрузить первый мод.</p></div>
    </section>

    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      :item-name="pendingMod?.name ?? ''"
      item-type="мод"
      :busy="Boolean(busyDeleteId)"
      @confirm="deleteMod"
    />
  </section>
</template>
