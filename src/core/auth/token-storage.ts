import { AUTH_STORAGE_KEYS } from '@/core/auth/token-keys'

export interface StoredSession {
  accessToken: string
  refreshToken: string
}

export function getStoredSession(): StoredSession | null {
  const accessToken = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)
  const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken)

  if (!accessToken || !refreshToken) {
    return null
  }

  return { accessToken, refreshToken }
}

export function setStoredSession(session: StoredSession): void {
  localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, session.accessToken)
  localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, session.refreshToken)
}

export function clearStoredSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken)
  localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken)
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)
}
