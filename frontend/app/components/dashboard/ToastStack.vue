<script setup lang="ts">
const { toasts } = useDashboardData()
</script>

<template>
  <div class="toast-stack" aria-live="polite" aria-relevant="additions">
    <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast-${toast.tone}`" role="status">
      <Icon :name="toast.tone === 'error' ? 'lucide:circle-alert' : toast.tone === 'info' ? 'lucide:info' : 'lucide:circle-check'" :size="17" aria-hidden="true" />
      <span>{{ toast.message }}</span>
      <button type="button" aria-label="Закрыть уведомление" @click="toasts = toasts.filter(item => item.id !== toast.id)"><Icon name="xmark" :size="15" /></button>
    </div>
  </div>
</template>
