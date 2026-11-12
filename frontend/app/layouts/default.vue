<script setup lang="ts">
const route = useRoute()
const { dataStatus, loading, errorMessage, loadAll, clearError } = useDashboardData()
const mobileMenuOpen = ref(false)

const menu = [
  { label: 'Обзор', to: '/overview', icon: 'lucide:layout-dashboard' },
  { label: 'Серверы', to: '/servers', icon: 'server' },
  { label: 'Сессии', to: '/session', icon: 'lucide:flag' },
  { label: 'Игроки и результаты', to: '/players', icon: 'lucide:users' },
  { label: 'Моды', to: '/mods', icon: 'lucide:package' },
]

watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">К содержимому</a>
    <aside class="sidebar" @keydown.esc="mobileMenuOpen = false">
      <div class="sidebar-top">
        <NuxtLink to="/overview" class="brand" aria-label="AssettoDash, обзор">
          <span class="brand-wordmark"><span>ASSETTO</span><span class="brand-red">DASH</span></span>
        </NuxtLink>
        <button
          class="mobile-menu-toggle"
          type="button"
          :aria-expanded="mobileMenuOpen"
          aria-controls="dashboard-navigation"
          :aria-label="mobileMenuOpen ? 'Скрыть разделы' : 'Открыть разделы'"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <Icon :name="mobileMenuOpen ? 'lucide:x' : 'lucide:menu'" :size="20" aria-hidden="true" />
        </button>
      </div>

      <nav id="dashboard-navigation" class="main-nav" :class="{ 'is-open': mobileMenuOpen }" aria-label="Разделы панели">
        <NuxtLink
          v-for="item in menu"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ active: route.path === item.to }"
          :aria-current="route.path === item.to ? 'page' : undefined"
        >
          <Icon :name="item.icon" :size="18" aria-hidden="true" />
          <span>{{ item.label }}</span>
        </NuxtLink>
        <NuxtLink
          to="/profile"
          class="nav-link mobile-profile-link"
          :class="{ active: route.path === '/profile' }"
          :aria-current="route.path === '/profile' ? 'page' : undefined"
        >
          <Icon name="lucide:user-round" :size="18" aria-hidden="true" />
          <span>Профиль</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-bottom">
        <NuxtLink to="/profile" class="profile-link" :class="{ active: route.path === '/profile' }" :aria-current="route.path === '/profile' ? 'page' : undefined">
          <Icon name="lucide:user-round" :size="17" aria-hidden="true" />
          <span>Профиль</span>
        </NuxtLink>
      </div>
    </aside>

    <button
      v-if="mobileMenuOpen"
      class="mobile-menu-backdrop"
      type="button"
      aria-label="Закрыть меню"
      @click="mobileMenuOpen = false"
    />

    <div class="main-column">
      <main id="main-content" class="main-content">
        <div v-if="loading" class="loading-state" role="status" aria-live="polite">
          <span class="sr-only">Загружаем данные…</span>
          <span class="skeleton-line skeleton-heading"></span>
          <span class="skeleton-line skeleton-copy"></span>
          <span class="skeleton-block"></span>
        </div>
        <section v-else-if="dataStatus === 'error'" class="global-state error-state" role="alert">
          <strong>Не удалось загрузить данные</strong>
          <p>{{ errorMessage }}</p>
          <button class="btn btn-primary" type="button" @click="loadAll">Повторить</button>
        </section>
        <template v-else>
          <div v-if="errorMessage" class="error-notice" role="alert">
            <span>{{ errorMessage }}</span>
            <button type="button" @click="clearError">Закрыть</button>
          </div>
          <slot />
        </template>
      </main>

    </div>

    <DashboardToastStack />
  </div>
</template>
