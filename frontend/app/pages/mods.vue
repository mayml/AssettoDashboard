<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { mods, addMod, notify } = useDashboardData()
const fileInput = ref<HTMLInputElement | null>(null)
const fileName = ref('')

function selectFile(event: Event) {
  const input = event.target as HTMLInputElement
  fileName.value = input.files?.[0]?.name ?? ''
}

// TODO: Функция для загрузки мода
function uploadMod() {
  if (!fileName.value) {
    notify('Сначала выбери архив мода.', 'error')
    return
  }

  if (!/\.(zip|7z|rar)$/i.test(fileName.value)) {
    notify('Выбери архив ZIP, 7Z или RAR.', 'error')
    return
  }

  addMod(fileName.value)
  fileName.value = ''
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <section class="page">
    <header class="page-heading">
      <div><h1>Моды</h1></div>
    </header>

    <section class="panel upload-panel">
      <header class="panel-heading">
        <div><h2>Добавить мод</h2><p>Выбери архив ZIP, 7Z или RAR. Сейчас это только демо формы.</p></div>
      </header>
      <div class="upload-row">
        <input ref="fileInput" class="control file-control" type="file" accept=".zip,.7z,.rar" @change="selectFile">
        <button class="btn btn-primary" type="button" @click="uploadMod">Добавить</button>
      </div>
      <p v-if="fileName" class="selected-file">Выбран файл: {{ fileName }}</p>
      <p class="upload-note">Файл пока не загружается на сервер. Backend подключим позже.</p>
    </section>

    <section class="panel">
      <header class="panel-heading">
        <div><h2>Моды в списке</h2><p>{{ mods.length }} элемента</p></div>
      </header>
      <div v-if="mods.length" class="mod-list">
        <article v-for="mod in mods" :key="mod.id" class="mod-row">
          <span class="mod-icon"><Icon name="lucide:package" :size="18" aria-hidden="true" /></span>
          <div class="mod-info"><strong>{{ mod.name }}</strong><span>{{ mod.type }} · версия {{ mod.version }}</span></div>
          <span class="badge badge-stopped">Демо</span>
        </article>
      </div>
      <div v-else class="empty-state"><strong>Пока модов нет</strong><p>Выбери архив выше, чтобы добавить запись в этот список.</p></div>
    </section>
  </section>
</template>

<style scoped>
.upload-row { display: flex; align-items: center; gap: 10px; }
.file-control { min-width: 0; flex: 1; padding: 7px; }
.upload-note, .selected-file { margin: 10px 0 0; color: var(--ad-muted); font-size: 11px; overflow-wrap: anywhere; }
.selected-file { color: var(--ad-text); }
.mod-list { display: grid; }
.mod-row { display: flex; min-width: 0; align-items: center; gap: 12px; padding: 13px 0; border-top: 1px solid var(--ad-border); }
.mod-icon { display: grid; width: 38px; height: 38px; flex: 0 0 auto; place-items: center; color: #ff817b; background: #34211f; border-radius: 8px; }
.mod-info { display: grid; min-width: 0; flex: 1; gap: 5px; }
.mod-info strong { overflow-wrap: anywhere; font-size: 13px; }
.mod-info span { color: var(--ad-muted); font-size: 11px; }
@media (max-width: 520px) {
  .upload-row { align-items: stretch; flex-direction: column; }
  .upload-row .btn { width: 100%; }
}
</style>
