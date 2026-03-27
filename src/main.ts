import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { apiClient } from '@/core/api/http-client'
import { AUTH_STORAGE_KEYS } from '@/core/auth/token-keys'
import { getStoredAccessToken, getStoredRefreshToken } from '@/core/auth/token-storage'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { routeNames } from '@/router/route-names'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore(pinia)
authStore.initializeFromStorage()

apiClient.setAuthHandlers({
  refreshAccessToken: () => authStore.refreshSession(),
  onRefreshFailure: () => {
    authStore.logout()
    void router.push({ name: routeNames.login })
  },
})

if (!authStore.accessToken && authStore.refreshToken) {
  void authStore.refreshSession().catch(() => {
    authStore.logout()
    void router.push({ name: routeNames.login })
  })
}

window.addEventListener('storage', (event: StorageEvent) => {
  if (event.storageArea !== localStorage) {
    return
  }

  if (
    event.key !== null &&
    event.key !== AUTH_STORAGE_KEYS.accessToken &&
    event.key !== AUTH_STORAGE_KEYS.refreshToken
  ) {
    return
  }

  const hasAccessToken = Boolean(getStoredAccessToken())
  const hasRefreshToken = Boolean(getStoredRefreshToken())

  if (!hasAccessToken && !hasRefreshToken && (authStore.accessToken || authStore.refreshToken)) {
    authStore.logout()
    void router.push({ name: routeNames.login })
  }
})

app.mount('#app')
