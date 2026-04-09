import { getStoredAccessToken } from '@/core/auth/token-storage'
import { apiConfig, withApiVersion } from '@/core/config/api'
import type { ApiErrorResponse, QueryParams, RequestOptions } from '@/core/api/types'

interface AuthHandlers {
  refreshAccessToken: (() => Promise<string>) | null
  onRefreshFailure: (() => void | Promise<void>) | null
}

export class ApiClientError extends Error {
  status: number
  body: unknown

  constructor({ status, message, body }: ApiErrorResponse) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.body = body
  }
}

function buildQueryString(query?: QueryParams): string {
  if (!query) {
    return ''
  }

  const searchParams = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.set(key, String(value))
    }
  })

  const stringified = searchParams.toString()
  return stringified ? `?${stringified}` : ''
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type')
  const isJson = contentType?.toLowerCase().includes('json')

  if (isJson) {
    return response.json()
  }

  const text = await response.text()
  return text.length ? text : null
}

class ApiClient {
  private refreshAccessToken: (() => Promise<string>) | null = null
  private onRefreshFailure: (() => void | Promise<void>) | null = null
  private refreshInFlight: Promise<string> | null = null

  setAuthHandlers(handlers: AuthHandlers): void {
    this.refreshAccessToken = handlers.refreshAccessToken
    this.onRefreshFailure = handlers.onRefreshFailure
  }

  private async runRefreshSingleFlight(): Promise<string> {
    if (!this.refreshAccessToken) {
      throw new Error('Missing refresh handler')
    }

    if (!this.refreshInFlight) {
      this.refreshInFlight = this.refreshAccessToken()
        .then((newAccessToken) => {
          if (!newAccessToken) {
            throw new Error('Refresh handler returned empty access token')
          }

          return newAccessToken
        })
        .catch(async (error) => {
          if (this.onRefreshFailure) {
            await this.onRefreshFailure()
          }

          throw error
        })
        .finally(() => {
          this.refreshInFlight = null
        })
    }

    return this.refreshInFlight
  }

  async request<TResponse, TBody = unknown>(
    options: RequestOptions<TBody>,
    hasRetried = false,
  ): Promise<TResponse> {
    const accessToken = getStoredAccessToken()
    const path = withApiVersion(options.path)
    const queryString = buildQueryString(options.query)
    const requestUrl = `${apiConfig.baseUrl}${path}${queryString}`

    const headers: Record<string, string> = {
      ...options.headers,
    }

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json'
    }

    if (options.requiresAuth !== false && accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    const response = await fetch(requestUrl, {
      method: options.method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    })

    const parsedBody = await parseResponseBody(response)

    if (!response.ok) {
      const shouldAttemptRefresh =
        response.status === 401 &&
        options.requiresAuth !== false &&
        options.skipAuthRefresh !== true &&
        !hasRetried

      if (shouldAttemptRefresh) {
        await this.runRefreshSingleFlight()
        return this.request(options, true)
      }

      throw new ApiClientError({
        status: response.status,
        message: `Request failed with status ${response.status}`,
        body: parsedBody,
      })
    }

    return parsedBody as TResponse
  }
}

export const apiClient = new ApiClient()
