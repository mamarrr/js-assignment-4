import { ApiClientError } from '@/core/api/http-client'
import type { ApiMessageDto, ProblemDetailsDto } from '@/shared/types/common'

const DEFAULT_USER_ERROR_MESSAGE = 'Unexpected error. Please try again.'

export function toUserMessage(errorBody: unknown): string {
  if (typeof errorBody === 'string') {
    const trimmedErrorBody = errorBody.trim()
    if (!trimmedErrorBody.length) {
      return DEFAULT_USER_ERROR_MESSAGE
    }

    const looksLikeJson =
      (trimmedErrorBody.startsWith('{') && trimmedErrorBody.endsWith('}')) ||
      (trimmedErrorBody.startsWith('[') && trimmedErrorBody.endsWith(']'))

    if (looksLikeJson) {
      try {
        return toUserMessage(JSON.parse(trimmedErrorBody))
      } catch {
        return trimmedErrorBody
      }
    }

    return trimmedErrorBody
  }

  if (!errorBody || typeof errorBody !== 'object') {
    return DEFAULT_USER_ERROR_MESSAGE
  }

  const messagePayload = errorBody as Partial<ApiMessageDto> & { message?: unknown }
  if (Array.isArray(messagePayload.messages) && messagePayload.messages.length) {
    return messagePayload.messages.join(' ')
  }

  if (typeof messagePayload.message === 'string' && messagePayload.message.trim().length) {
    return messagePayload.message
  }

  const problemDetails = errorBody as ProblemDetailsDto
  if (problemDetails.detail) {
    return problemDetails.detail
  }

  if (problemDetails.title) {
    return problemDetails.title
  }

  return DEFAULT_USER_ERROR_MESSAGE
}

function logTechnicalDetails(error: unknown): void {
  if (import.meta.env.DEV) {
    console.error('[ErrorPolicy]', error)
  }
}

function toStatusAwareMessage(status: number, body: unknown): string {
  const backendMessage = toUserMessage(body)

  if (status === 400) {
    return backendMessage !== DEFAULT_USER_ERROR_MESSAGE
      ? backendMessage
      : 'Please review the highlighted data and try again.'
  }

  if (status === 401) {
    return 'Your session has expired. Please log in again.'
  }

  if (status === 403) {
    return 'You do not have permission to perform this action.'
  }

  if (status === 404) {
    return 'The requested resource was not found.'
  }

  if (status === 409) {
    if (import.meta.env.DEV) {
      console.debug('[ErrorPolicy][409]', { body, backendMessage })
    }

    return backendMessage !== DEFAULT_USER_ERROR_MESSAGE
      ? backendMessage
      : 'Conflict detected. Refresh your data and try again.'
  }

  if (status >= 500) {
    return 'Server error occurred. Please try again in a moment.'
  }

  return backendMessage
}

export function toAppErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    logTechnicalDetails(error)
    return toStatusAwareMessage(error.status, error.body)
  }

  if (error instanceof Error) {
    logTechnicalDetails(error)
    return error.message || 'Network error occurred. Please try again.'
  }

  logTechnicalDetails(error)
  return 'Network error occurred. Please try again.'
}
