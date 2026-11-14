<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { normalizeDataError } from '~/services/dataError'

const props = defineProps<{ mode: 'login' | 'register' }>()
const router = useRouter()
const route = useRoute()
const { login, register } = useAuth()

const isRegister = computed(() => props.mode === 'register')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const didSubmit = ref(false)
const notice = ref('')
const noticeIsError = ref(false)
const isSubmitting = ref(false)
const confirmationError = computed(() => {
  if (!didSubmit.value || !isRegister.value || passwordConfirmation.value === password.value) return ''
  return 'Пароли не совпадают.'
})

async function submit() {
  if (isSubmitting.value) return

  didSubmit.value = true
  notice.value = ''
  noticeIsError.value = false

  if (isRegister.value) {
    if (confirmationError.value) return
  }

  isSubmitting.value = true
  try {
    if (isRegister.value) await register(email.value, password.value)
    await login(email.value, password.value)
    const redirect = route.query.redirect
    const destination = typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
      ? redirect
      : '/overview'
    await router.replace(destination)
  } catch (error) {
    const problem = normalizeDataError(error)
    notice.value = problem.statusCode === 0
      ? 'Не удалось подключиться к серверу. Проверь, что backend запущен на порту 8000.'
      : problem.message
    noticeIsError.value = true
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="login-form" :class="{ 'is-register': isRegister }" @submit.prevent="submit">

    <header class="login-heading">
      <h1 class="login-title">{{ isRegister ? 'Создать аккаунт' : 'Вход в панель' }}</h1>
    </header>

    <div class="login-fields">
      
      <FormInput
        :id="isRegister ? 'register-email' : 'login-email'"
        v-model="email"
        label="Электронная почта"
        type="email"
        name="email"
        placeholder="you@example.com"
        autocomplete="email"
        :disabled="isSubmitting"
        required
      >
        <template #leading><Icon name="lucide:mail" :size="17" /></template>
      </FormInput>
      <FormInput
        :id="isRegister ? 'register-password' : 'login-password'"
        v-model="password"
        label="Пароль"
        type="password"
        name="password"
        placeholder="••••••••"
        :autocomplete="isRegister ? 'new-password' : 'current-password'"
        :minlength="isRegister ? 8 : undefined"
        :disabled="isSubmitting"
        required
      >
        <template #leading><Icon name="lucide:lock-keyhole" :size="17" /></template>
      </FormInput>
      <FormInput
        v-if="isRegister"
        id="register-password-confirmation"
        v-model="passwordConfirmation"
        label="Повтори пароль"
        type="password"
        name="passwordConfirmation"
        placeholder="••••••••"
        autocomplete="new-password"
        :minlength="8"
        :error="confirmationError"
        :disabled="isSubmitting"
        required
      >
        <template #leading><Icon name="lucide:lock-keyhole" :size="17" /></template>
      </FormInput>
    </div>

    <p v-if="notice" class="auth-feedback" :class="{ 'is-error': noticeIsError }" :role="noticeIsError ? 'alert' : 'status'">{{ notice }}</p>

    <button class="btn login-submit" type="submit" :disabled="isSubmitting">
      <Icon v-if="isSubmitting" name="lucide:loader-circle" class="app-icon is-spinning" :size="17" aria-hidden="true" />
      <span>{{ isSubmitting ? 'Подключение…' : isRegister ? 'Создать аккаунт' : 'Войти в панель' }}</span>
      <Icon v-if="!isSubmitting" name="lucide:arrow-right" class="app-icon" :size="17" aria-hidden="true" />
    </button>

    <p class="login-switch">
      {{ isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?' }}
      <NuxtLink :to="isRegister ? '/' : '/register'">
        {{ isRegister ? 'Войти' : 'Зарегистрироваться' }}
      </NuxtLink>
    </p>
  </form>
</template>
