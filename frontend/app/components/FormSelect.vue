<script setup lang="ts">
type SelectValue = string | number
type SelectOption = string | number | { label: string, value: SelectValue }

const props = withDefaults(defineProps<{
  id: string
  label: string
  options: SelectOption[]
  name?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  labelHidden?: boolean
  hint?: string
  error?: string
}>(), { placeholder: 'Выберите значение' })

const value = defineModel<SelectValue>({ default: '' })
const isOpen = ref(false)
const activeIndex = ref(-1)
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)

const normalizedOptions = computed(() => props.options.map((option) => {
  if (typeof option === 'object') return option
  return { label: String(option), value: option }
}))
const selectedIndex = computed(() => normalizedOptions.value.findIndex(option => String(option.value) === String(value.value)))
const selectedLabel = computed(() => normalizedOptions.value[selectedIndex.value]?.label ?? props.placeholder)
const labelId = computed(() => `${props.id}-label`)
const messageId = computed(() => `${props.id}-message`)
const listboxId = computed(() => `${props.id}-options`)

function openMenu() {
  if (props.disabled || normalizedOptions.value.length === 0) return
  activeIndex.value = selectedIndex.value >= 0 ? selectedIndex.value : 0
  isOpen.value = true
}

function closeMenu(returnFocus = false) {
  isOpen.value = false
  if (returnFocus) trigger.value?.focus()
}

function toggleMenu() {
  if (isOpen.value) closeMenu()
  else openMenu()
}

function chooseOption(index: number) {
  const option = normalizedOptions.value[index]
  if (!option) return
  value.value = option.value
  closeMenu(true)
}

function handleKeydown(event: KeyboardEvent) {
  const lastIndex = normalizedOptions.value.length - 1

  if (event.key === 'Tab') {
    closeMenu()
    return
  }

  if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault()
    closeMenu(true)
    return
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End' || event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
  } else {
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    if (isOpen.value) chooseOption(activeIndex.value)
    else openMenu()
    return
  }

  if (event.key === 'Home' || event.key === 'End') {
    if (!isOpen.value) openMenu()
    activeIndex.value = event.key === 'Home' ? 0 : lastIndex
    return
  }

  if (!isOpen.value) {
    openMenu()
    return
  }

  const direction = event.key === 'ArrowDown' ? 1 : -1
  activeIndex.value = Math.max(0, Math.min(lastIndex, activeIndex.value + direction))
}

function closeOnOutsideClick(event: PointerEvent) {
  if (root.value && !root.value.contains(event.target as Node)) closeMenu()
}

onMounted(() => document.addEventListener('pointerdown', closeOnOutsideClick))
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeOnOutsideClick))
</script>

<template>
  <div ref="root" class="form-field">
    <label :id="labelId" :for="id" class="form-label" :class="{ 'sr-only': labelHidden }">{{ label }}</label>
    <span class="form-select-shell" :class="{ 'is-invalid': error, 'is-disabled': disabled }">
      <input v-if="name" type="hidden" :name="name" :value="value">
      <button
        :id="id"
        ref="trigger"
        class="select-control"
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        :aria-labelledby="labelId"
        :aria-controls="listboxId"
        :aria-expanded="isOpen"
        :aria-activedescendant="isOpen && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined"
        :aria-required="required ? 'true' : undefined"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error || hint ? messageId : undefined"
        :disabled="disabled"
        @click="toggleMenu"
        @keydown="handleKeydown"
      >
        <span class="select-value">{{ selectedLabel }}</span>
        <span class="select-indicator" :class="{ 'is-open': isOpen }" aria-hidden="true"><Icon class="select-arrow" name="lucide:chevron-down" :size="16" /></span>
      </button>
      <ul :id="listboxId" v-show="isOpen" class="select-menu" role="listbox" :aria-labelledby="labelId">
        <li
          v-for="(option, index) in normalizedOptions"
          :id="`${id}-option-${index}`"
          :key="String(option.value)"
          class="select-option"
          :class="{ 'is-selected': selectedIndex === index, 'is-active': activeIndex === index }"
          role="option"
          :aria-selected="selectedIndex === index"
          @mouseenter="activeIndex = index"
          @click="chooseOption(index)"
        >
          <span>{{ option.label }}</span>
          <Icon v-if="selectedIndex === index" name="lucide:check" :size="16" aria-hidden="true" />
        </li>
      </ul>
    </span>
    <span v-if="error || hint" :id="messageId" class="form-message" :class="{ 'is-error': error }" :role="error ? 'alert' : undefined">{{ error || hint }}</span>
  </div>
</template>
