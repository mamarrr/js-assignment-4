import { describe, expect, it } from 'vitest'

import { ApiClientError } from '@/core/api/http-client'
import { toAppErrorMessage, toUserMessage } from '@/shared/utils/error-message'

describe('error message utility', () => {
  it('parses singular message payload', () => {
    expect(
      toUserMessage({
        message: 'Entity cannot be deleted because it has 1 dependent TodoTask record(s)',
      }),
    ).toBe('Entity cannot be deleted because it has 1 dependent TodoTask record(s)')
  })

  it('returns backend 409 message through app error mapper', () => {
    const error = new ApiClientError({
      status: 409,
      message: 'Request failed with status 409',
      body: { message: 'Entity cannot be deleted because it has 1 dependent TodoTask record(s)' },
    })

    expect(toAppErrorMessage(error)).toBe(
      'Entity cannot be deleted because it has 1 dependent TodoTask record(s)',
    )
  })

  it('keeps messages array behavior', () => {
    expect(toUserMessage({ messages: ['First issue.', 'Second issue.'] })).toBe(
      'First issue. Second issue.',
    )
  })

  it('parses json string body and extracts singular message', () => {
    expect(
      toUserMessage(
        '{"message":"Entity cannot be deleted because it has 1 dependent TodoTask record(s)"}',
      ),
    ).toBe('Entity cannot be deleted because it has 1 dependent TodoTask record(s)')
  })
})
