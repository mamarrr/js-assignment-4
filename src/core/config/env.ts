const requiredEnvKeys = ['VITE_API_BASE_URL'] as const

function getRequiredEnvValue(key: (typeof requiredEnvKeys)[number]): string {
  const value = import.meta.env[key]

  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value.trim()
}

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

export const appEnv = {
  apiBaseUrl: normalizeBaseUrl(getRequiredEnvValue('VITE_API_BASE_URL')),
  apiVersion: (import.meta.env.VITE_API_VERSION?.trim() || '1.0').replace(/^v/i, ''),
} as const
