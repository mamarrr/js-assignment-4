import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { apiClient } from '@/core/api/http-client'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { routeNames } from '@/router/route-names'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore(pinia)
authStore.initializeFromStorage()

apiClient.setUnauthorizedHandler(() => {
  authStore.clearSession()
  void router.push({ name: routeNames.login })
})

app.mount('#app')
