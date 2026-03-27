import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  clearStoredSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredSession,
  setStoredSession,
} from '@/core/auth/token-storage'
import { authService } from '@/modules/auth/services/auth.service'
import type { AuthRequestQuery } from '@/core/api/endpoints'
import type { JwtResponseDto } from '@/modules/auth/types/auth.dto'
import type {
  LoginRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
} from '@/modules/auth/types/auth.dto'
import { toAppErrorMessage } from '@/shared/utils/error-message'
import { resetFeatureStores } from '@/stores/reset'

function isNonEmpty(value: string | null | undefined): value is string {
  return Boolean(value && value.trim())
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const firstName = ref<string | null>(null)
  const lastName = ref<string | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(accessToken.value && refreshToken.value))

  function setSessionTokens(nextAccessToken: string, nextRefreshToken: string): void {
    accessToken.value = nextAccessToken
    refreshToken.value = nextRefreshToken
    setStoredSession({
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
    })
  }

  function clearSessionState(): void {
    accessToken.value = null
    refreshToken.value = null
    firstName.value = null
    lastName.value = null
    errorMessage.value = null
    clearStoredSession()
  }

  function initializeFromStorage(): void {
    const stored = getStoredSession()

    if (!stored) {
      return
    }

    accessToken.value = stored.accessToken
    refreshToken.value = stored.refreshToken
  }

  function applyJwtSession(payload: JwtResponseDto): void {
    if (!isNonEmpty(payload.token) || !isNonEmpty(payload.refreshToken)) {
      throw new Error('Invalid JWT response: token pair is incomplete')
    }

    setSessionTokens(payload.token, payload.refreshToken)
    firstName.value = payload.firstName
    lastName.value = payload.lastName
  }

  async function login(payload: LoginRequestDto, query?: AuthRequestQuery): Promise<void> {
    isLoading.value = true
    errorMessage.value = null

    try {
      const response = await authService.login(payload, query)
      applyJwtSession(response)
    } catch (error) {
      errorMessage.value = toAppErrorMessage(error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function register(payload: RegisterRequestDto, query?: AuthRequestQuery): Promise<void> {
    isLoading.value = true
    errorMessage.value = null

    try {
      const response = await authService.register(payload, query)
      applyJwtSession(response)
    } catch (error) {
      errorMessage.value = toAppErrorMessage(error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function refreshSession(query?: AuthRequestQuery): Promise<string> {
    const currentRefreshToken = refreshToken.value ?? getStoredRefreshToken()
    const currentAccessToken = accessToken.value ?? getStoredAccessToken()

    if (!isNonEmpty(currentRefreshToken)) {
      throw new Error('Missing refresh token for refresh flow')
    }

    const payload: RefreshTokenRequestDto = {
      jwt: currentAccessToken,
      refreshToken: currentRefreshToken,
    }

    try {
      const response = await authService.refreshToken(payload, query)

      if (!isNonEmpty(response.token) || !isNonEmpty(response.refreshToken)) {
        throw new Error('Refresh response missing required token pair')
      }

      applyJwtSession(response)
      return response.token
    } catch (error) {
      clearSessionState()
      resetFeatureStores()
      throw error
    }
  }

  async function ensureAuthenticated(): Promise<boolean> {
    if (isAuthenticated.value) {
      return true
    }

    const hasRefreshToken = Boolean(refreshToken.value ?? getStoredRefreshToken())
    if (!hasRefreshToken) {
      return false
    }

    try {
      await refreshSession()
      return true
    } catch {
      return false
    }
  }

  function logout(): void {
    clearSessionState()
    resetFeatureStores()
  }

  return {
    accessToken,
    refreshToken,
    firstName,
    lastName,
    isLoading,
    errorMessage,
    isAuthenticated,
    initializeFromStorage,
    login,
    register,
    refreshSession,
    ensureAuthenticated,
    applyJwtSession,
    logout,
  }
})
