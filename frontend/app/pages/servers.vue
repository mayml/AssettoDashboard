<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { servers, createServer, removeServer, toggleServer, serverFormOptions } = useDashboardData()

const createDialog = ref<HTMLDialogElement | null>(null)
const dialogOpen = ref(false)
const isCreating = ref(false)
const pendingServer = ref<{ id: string, name: string } | null>(null)
const deleteDialogOpen = ref(false)
const isDeleting = ref(false)
const name = ref('')
const track = ref(serverFormOptions.defaultTrack)
const mode = ref(serverFormOptions.defaultMode)
const slots = ref(serverFormOptions.defaultSlots)

watch(dialogOpen, async (isOpen) => {
  await nextTick()
  const element = createDialog.value
  if (!element) return

  if (isOpen && !element.open) element.showModal()
  if (!isOpen && element.open) element.close()
}, { flush: 'post' })

function closeDialog() {
  if (!isCreating.value) dialogOpen.value = false
}

function handleDialogCancel(event: Event) {
  if (isCreating.value) {
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
  if (!serverName || isCreating.value) return

  isCreating.value = true
  try {
    const created = await createServer({ name: serverName, track: track.value, mode: mode.value, slots: slots.value })
    if (!created) return

    name.value = ''
    track.value = serverFormOptions.defaultTrack
    mode.value = serverFormOptions.defaultMode
    slots.value = serverFormOptions.defaultSlots
    dialogOpen.value = false
  } finally {
    isCreating.value = false
  }
}

function requestRemove(server: { id: string, name: string }) {
  pendingServer.value = { id: server.id, name: server.name }
  deleteDialogOpen.value = true
}

async function confirmRemove() {
  if (!pendingServer.value || isDeleting.value) return

  isDeleting.value = true
  try {
    const removed = await removeServer(pendingServer.value.id)
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
      <div><h1>Серверы</h1></div>
      <button class="btn btn-primary" type="button" @click="dialogOpen = true">
        <Icon name="lucide:plus" :size="17" aria-hidden="true" />Создать сервер
      </button>
    </header>

    <section class="panel" aria-labelledby="my-servers-heading">
      <header class="panel-heading">
        <div><h2 id="my-servers-heading">Мои серверы</h2><p>Текущие конфигурации серверов</p></div>
      </header>
      <div v-if="servers.length" class="server-list">
        <article v-for="server in servers" :key="server.id" class="server-row">
          <div class="server-info">
            <span class="badge" :class="server.status === 'running' ? 'badge-running' : 'badge-stopped'">
              {{ server.status === 'running' ? 'Работает' : 'Остановлен' }}
            </span>
            <h3>{{ server.name }}</h3>
            <p>{{ server.track }}, {{ server.mode }}</p>
            <span class="server-roster">{{ server.players }} из {{ server.slots }} мест занято</span>
          </div>
          <div class="server-actions">
            <button v-if="server.status === 'running'" class="btn btn-danger" type="button" @click="toggleServer(server.id)">Остановить</button>
            <button v-else class="btn btn-primary" type="button" @click="toggleServer(server.id)">Запустить</button>
            <button class="btn btn-danger server-remove" type="button" :aria-label="`Удалить сервер ${server.name}`" @click="requestRemove(server)">
              <Icon name="lucide:trash-2" :size="16" aria-hidden="true" /><span>Удалить</span>
            </button>
          </div>
        </article>
      </div>
      <div v-else class="empty-state">
        <strong>Серверов пока нет</strong>
        <p>Создай первый сервер, чтобы начать.</p>
        <button class="btn btn-primary" type="button" @click="dialogOpen = true">Создать сервер</button>
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
          <h2 id="create-server-title">Новый сервер</h2>
          <p id="create-server-description">Настрой основные параметры.</p>
        </div>
        <button class="dialog-close" type="button" aria-label="Закрыть окно" :disabled="isCreating" @click="closeDialog">
          <Icon name="lucide:x" :size="18" aria-hidden="true" />
        </button>
      </header>
      <form class="create-form" @submit.prevent="submitServer">
        <div class="form-fields">
          <FormInput id="server-name" v-model="name" label="Название сервера" name="serverName" placeholder="Например, Friday Drift" :maxlength="32" :disabled="isCreating" required />
          <FormSelect id="server-track" v-model="track" :options="serverFormOptions.tracks" label="Трасса" name="track" :disabled="isCreating" />
          <FormSelect id="server-mode" v-model="mode" :options="serverFormOptions.modes" label="Тип сессии" name="mode" :disabled="isCreating" />
          <FormSelect id="server-slots" v-model="slots" :options="serverFormOptions.slots" label="Мест для игроков" name="slots" :disabled="isCreating" />
        </div>
        <div class="form-actions">
          <button class="btn" type="button" :disabled="isCreating" @click="closeDialog">Отмена</button>
          <button class="btn btn-primary" type="submit" :disabled="isCreating">
            <Icon :name="isCreating ? 'lucide:loader-circle' : 'lucide:plus'" :size="17" aria-hidden="true" />
            {{ isCreating ? 'Создание…' : 'Создать сервер' }}
          </button>
        </div>
      </form>
    </dialog>

    <ConfirmDialog
      v-model:open="deleteDialogOpen"
      :item-name="pendingServer?.name ?? ''"
      item-type="сервер"
      :busy="isDeleting"
      @confirm="confirmRemove"
    />
  </section>
</template>
