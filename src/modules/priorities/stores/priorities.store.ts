import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { prioritiesService } from '@/modules/priorities/services/priorities.service'
import type {
  TodoPriorityCreateInput,
  TodoPriorityModel,
  TodoPriorityUpdateInput,
} from '@/modules/priorities/types/priority.model'
import { toAppErrorMessage } from '@/shared/utils/error-message'

function toStoreError(error: unknown): string {
  return toAppErrorMessage(error)
}

export const usePrioritiesStore = defineStore('priorities', () => {
  const items = ref<TodoPriorityModel[]>([])
  const isLoading = ref(false)
  const isMutating = ref(false)
  const hasLoaded = ref(false)
  const errorMessage = ref<string | null>(null)

  const isEmpty = computed(() => hasLoaded.value && items.value.length === 0)

  function setActionError(error: unknown): void {
    errorMessage.value = toStoreError(error)
  }

  function upsertItem(nextItem: TodoPriorityModel): void {
    const currentIndex = items.value.findIndex((item) => item.id === nextItem.id)
    if (currentIndex === -1) {
      items.value.unshift(nextItem)
      return
    }

    items.value.splice(currentIndex, 1, nextItem)
  }

  async function fetchAll(): Promise<void> {
    isLoading.value = true
    errorMessage.value = null

    try {
      items.value = await prioritiesService.list()
      hasLoaded.value = true
    } catch (error) {
      setActionError(error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function createPriority(payload: TodoPriorityCreateInput): Promise<TodoPriorityModel> {
    isMutating.value = true
    errorMessage.value = null

    try {
      const created = await prioritiesService.create(payload)
      upsertItem(created)
      return created
    } catch (error) {
      setActionError(error)
      throw error
    } finally {
      isMutating.value = false
    }
  }

  async function updatePriority(id: string, patch: TodoPriorityUpdateInput): Promise<void> {
    const current = items.value.find((item) => item.id === id)
    if (!current) {
      throw new Error('Priority was not found in local state')
    }

    isMutating.value = true
    errorMessage.value = null

    try {
      const merged: TodoPriorityModel = {
        ...current,
        name: patch.name ?? current.name,
        sort: patch.sort ?? current.sort,
        tag: patch.tag ?? current.tag,
      }

      await prioritiesService.update(merged)
      upsertItem(merged)
    } catch (error) {
      setActionError(error)
      throw error
    } finally {
      isMutating.value = false
    }
  }

  async function deletePriority(id: string): Promise<void> {
    isMutating.value = true
    errorMessage.value = null

    try {
      await prioritiesService.deleteById(id)
      items.value = items.value.filter((item) => item.id !== id)
    } catch (error) {
      setActionError(error)
      throw error
    } finally {
      isMutating.value = false
    }
  }

  function resetState(): void {
    items.value = []
    isLoading.value = false
    isMutating.value = false
    hasLoaded.value = false
    errorMessage.value = null
  }

  return {
    items,
    isLoading,
    isMutating,
    hasLoaded,
    isEmpty,
    errorMessage,
    fetchAll,
    createPriority,
    updatePriority,
    deletePriority,
    resetState,
  }
})
