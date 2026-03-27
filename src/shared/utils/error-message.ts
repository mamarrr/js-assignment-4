import { ApiClientError } from '@/core/api/http-client'
import type { ApiMessageDto, ProblemDetailsDto } from '@/shared/types/common'

export function toUserMessage(errorBody: unknown): string {
  if (!errorBody || typeof errorBody !== 'object') {
    return 'Unexpected error. Please try again.'
  }

  const messagePayload = errorBody as Partial<ApiMessageDto>
  if (Array.isArray(messagePayload.messages) && messagePayload.messages.length) {
    return messagePayload.messages.join(' ')
  }

  const problemDetails = errorBody as ProblemDetailsDto
  if (problemDetails.detail) {
    return problemDetails.detail
  }

  if (problemDetails.title) {
    return problemDetails.title
  }

  return 'Unexpected error. Please try again.'
}

function logTechnicalDetails(error: unknown): void {
  if (import.meta.env.DEV) {
    console.error('[ErrorPolicy]', error)
  }
}

function toStatusAwareMessage(status: number, body: unknown): string {
  const backendMessage = toUserMessage(body)

  if (status === 400) {
    return backendMessage !== 'Unexpected error. Please try again.'
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
    return backendMessage !== 'Unexpected error. Please try again.'
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
