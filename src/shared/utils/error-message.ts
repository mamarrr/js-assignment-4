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
