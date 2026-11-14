<script setup lang="ts">
const props = withDefaults(defineProps<{
  id: string
  label: string
  type?: string
  name?: string
  placeholder?: string
  autocomplete?: string
  required?: boolean
  disabled?: boolean
  maxlength?: number
  minlength?: number
  min?: number
  max?: number
  step?: number | 'any'
  labelHidden?: boolean
  hint?: string
  error?: string
}>(), { type: 'text' })

const value = defineModel<string | number>({ default: '' })
const messageId = computed(() => `${props.id}-message`)
</script>

<template>
  <div class="form-field">
    <label :for="id" class="form-label" :class="{ 'sr-only': labelHidden }">{{ label }}</label>
    <span class="form-control-shell" :class="{ 'is-invalid': error, 'is-disabled': disabled }">
      <span v-if="$slots.leading" class="form-control-addon" aria-hidden="true"><slot name="leading" /></span>
      <input
        :id="id"
        v-model="value"
        class="text-control"
        :type="type"
        :name="name"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :required="required"
        :disabled="disabled"
        :maxlength="maxlength"
        :minlength="minlength"
        :min="min"
        :max="max"
        :step="step"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error || hint ? messageId : undefined"
      >
      <span v-if="$slots.trailing" class="form-control-addon" aria-hidden="true"><slot name="trailing" /></span>
    </span>
    <span v-if="error || hint" :id="messageId" class="form-message" :class="{ 'is-error': error }" :role="error ? 'alert' : undefined">{{ error || hint }}</span>
  </div>
</template>
