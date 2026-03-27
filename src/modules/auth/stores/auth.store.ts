import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
  type StoredSession,
} from '@/core/auth/token-storage'
import type { JwtResponseDto } from '@/modules/auth/types/auth.dto'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const firstName = ref<string | null>(null)
  const lastName = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(accessToken.value && refreshToken.value))

  function initializeFromStorage(): void {
    const stored = getStoredSession()

    if (!stored) {
      return
    }

    accessToken.value = stored.accessToken
    refreshToken.value = stored.refreshToken
  }

  function applyJwtSession(payload: JwtResponseDto): void {
    accessToken.value = payload.token
    refreshToken.value = payload.refreshToken
    firstName.value = payload.firstName
    lastName.value = payload.lastName

    if (payload.token && payload.refreshToken) {
      const session: StoredSession = {
        accessToken: payload.token,
        refreshToken: payload.refreshToken,
      }
      setStoredSession(session)
    }
  }

  function clearSession(): void {
    accessToken.value = null
    refreshToken.value = null
    firstName.value = null
    lastName.value = null
    clearStoredSession()
  }

  return {
    accessToken,
    refreshToken,
    firstName,
    lastName,
    isAuthenticated,
    initializeFromStorage,
    applyJwtSession,
    clearSession,
  }
})
