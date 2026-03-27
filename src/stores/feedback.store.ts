import { ref } from 'vue'
import { defineStore } from 'pinia'

export type FeedbackType = 'success' | 'error' | 'info'

export interface FeedbackItem {
  id: number
  type: FeedbackType
  message: string
}

export const useFeedbackStore = defineStore('feedback', () => {
  const items = ref<FeedbackItem[]>([])
  let nextId = 1

  function push(type: FeedbackType, message: string, timeoutMs = 4500): number {
    const id = nextId++
    items.value.push({ id, type, message })

    window.setTimeout(() => {
      dismiss(id)
    }, timeoutMs)

    return id
  }

  function success(message: string): number {
    return push('success', message)
  }

  function error(message: string): number {
    return push('error', message)
  }

  function info(message: string): number {
    return push('info', message)
  }

  function dismiss(id: number): void {
    items.value = items.value.filter((item) => item.id !== id)
  }

  function clear(): void {
    items.value = []
  }

  return {
    items,
    push,
    success,
    error,
    info,
    dismiss,
    clear,
  }
})
