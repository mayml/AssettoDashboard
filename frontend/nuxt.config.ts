// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/icon'],
  css: ['~/assets/css/dashboard.css'],

  runtimeConfig: {
    public: {
      dataSource: process.env.NUXT_PUBLIC_DATA_SOURCE || 'mock',
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
      authApiBaseUrl: process.env.NUXT_PUBLIC_AUTH_API_BASE_URL || 'http://localhost:8000',
    }
  },

  icon: {
    mode: 'svg',
    aliases: {
      xmark: 'heroicons:x-mark-16-solid',
      server: 'heroicons:server-stack-16-solid',
      'chevron-right': 'heroicons:chevron-right-16-solid',
      'arrow-right': 'heroicons:arrow-right-16-solid',
      plus: 'heroicons:plus-16-solid',
      logout: 'lucide:log-out',
      users: 'lucide:users',
      mail: 'heroicons:envelope-16-solid',
      lock: 'heroicons:lock-closed-16-solid',
      flag: 'heroicons:flag-16-solid',
      logs: 'heroicons:document-text-16-solid',
      play: 'heroicons:play-16-solid',
      stop: 'heroicons:stop-16-solid',
    },
  },
})
