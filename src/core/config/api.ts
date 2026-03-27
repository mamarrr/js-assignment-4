import { appEnv } from '@/core/config/env'

export const apiConfig = {
  baseUrl: appEnv.apiBaseUrl,
  version: appEnv.apiVersion,
} as const

export function withApiVersion(pathTemplate: string): string {
  return `/api/v${apiConfig.version}${pathTemplate}`
}
