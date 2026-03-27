export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type QueryValue = string | number | boolean | null | undefined

export type QueryParams = Record<string, QueryValue>

export interface ApiEndpoint<TRequest = never, TResponse = unknown> {
  method: HttpMethod
  path: string
  requiresAuth: boolean
  __request?: TRequest
  __response?: TResponse
}

export interface RequestOptions<TBody = unknown> {
  method: HttpMethod
  path: string
  query?: QueryParams
  body?: TBody
  requiresAuth?: boolean
  skipAuthRefresh?: boolean
  headers?: Record<string, string>
  signal?: AbortSignal
}

export interface ApiErrorResponse {
  status: number
  message: string
  body: unknown
}
