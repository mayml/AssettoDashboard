<script setup lang="ts">
const props = withDefaults(defineProps<{
  itemName: string
  itemType?: 'мод' | 'сервер' | 'пресет'
  busy?: boolean
}>(), {
  itemType: 'мод',
  busy: false,
})

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ confirm: [] }>()
const dialog = ref<HTMLDialogElement | null>(null)

watch(open, async (isOpen) => {
  await nextTick()
  const element = dialog.value
  if (!element) return

  if (isOpen && !element.open) element.showModal()
  if (!isOpen && element.open) element.close()
}, { flush: 'post' })

onMounted(() => {
  if (open.value && dialog.value && !dialog.value.open) dialog.value.showModal()
})

function handleCancel(event: Event) {
  if (props.busy) {
    event.preventDefault()
    return
  }
  open.value = false
}

function handleBackdrop(event: MouseEvent) {
  if (event.target === dialog.value && !props.busy) open.value = false
}
</script>

<template>
  <dialog
    ref="dialog"
    class="confirm-dialog"
    aria-labelledby="confirm-dialog-title"
    aria-describedby="confirm-dialog-description"
    @cancel="handleCancel"
    @click="handleBackdrop"
  >
    <h2 id="confirm-dialog-title">Удалить {{ itemType }}?</h2>
    <p id="confirm-dialog-description">
      {{ itemType === 'сервер' ? 'Сервер' : itemType === 'пресет' ? 'Пресет' : 'Мод' }} «{{ itemName }}» будет удалён из списка. Это действие нельзя отменить.
    </p>
    <div class="confirm-dialog-actions">
      <button class="btn" type="button" :disabled="busy" autofocus @click="open = false">Отмена</button>
      <button class="btn btn-primary" type="button" :disabled="busy" @click="emit('confirm')">
        {{ busy ? 'Удаление…' : `Удалить ${itemType}` }}
      </button>
    </div>
  </dialog>
</template>
