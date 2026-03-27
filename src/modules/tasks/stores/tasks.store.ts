import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { tasksService } from '@/modules/tasks/services/tasks.service'
import type {
  TodoTaskCreateInput,
  TodoTaskModel,
  TodoTaskUpdateInput,
} from '@/modules/tasks/types/task.model'
import { toAppErrorMessage } from '@/shared/utils/error-message'

function toStoreError(error: unknown): string {
  return toAppErrorMessage(error)
}

export const useTasksStore = defineStore('tasks', () => {
  const items = ref<TodoTaskModel[]>([])
  const isLoading = ref(false)
  const isMutating = ref(false)
  const hasLoaded = ref(false)
  const errorMessage = ref<string | null>(null)

  const isEmpty = computed(() => hasLoaded.value && items.value.length === 0)

  function setActionError(error: unknown): void {
    errorMessage.value = toStoreError(error)
  }

  function upsertItem(nextItem: TodoTaskModel): void {
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
      items.value = await tasksService.list()
      hasLoaded.value = true
    } catch (error) {
      setActionError(error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function createTask(payload: TodoTaskCreateInput): Promise<TodoTaskModel> {
    isMutating.value = true
    errorMessage.value = null

    try {
      const created = await tasksService.create(payload)
      upsertItem(created)
      return created
    } catch (error) {
      setActionError(error)
      throw error
    } finally {
      isMutating.value = false
    }
  }

  async function updateTask(id: string, patch: TodoTaskUpdateInput): Promise<TodoTaskModel> {
    const current = items.value.find((item) => item.id === id)
    if (!current) {
      throw new Error('Task was not found in local state')
    }

    isMutating.value = true
    errorMessage.value = null

    try {
      const updated = await tasksService.update({
        ...current,
        name: patch.name ?? current.name,
        sort: patch.sort ?? current.sort,
        dueAt: patch.dueAt ?? current.dueAt,
        completed: patch.completed ?? current.completed,
        archived: patch.archived ?? current.archived,
        categoryId: patch.categoryId ?? current.categoryId,
        priorityId: patch.priorityId ?? current.priorityId,
      })

      upsertItem(updated)
      return updated
    } catch (error) {
      setActionError(error)
      throw error
    } finally {
      isMutating.value = false
    }
  }

  async function deleteTask(id: string): Promise<void> {
    isMutating.value = true
    errorMessage.value = null

    try {
      await tasksService.deleteById(id)
      items.value = items.value.filter((item) => item.id !== id)
    } catch (error) {
      setActionError(error)
      throw error
    } finally {
      isMutating.value = false
    }
  }

  async function toggleCompleted(id: string): Promise<void> {
    const current = items.value.find((item) => item.id === id)
    if (!current) {
      throw new Error('Task was not found in local state')
    }

    await updateTask(id, { completed: !current.completed })
  }

  async function toggleArchived(id: string): Promise<void> {
    const current = items.value.find((item) => item.id === id)
    if (!current) {
      throw new Error('Task was not found in local state')
    }

    await updateTask(id, { archived: !current.archived })
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
    createTask,
    updateTask,
    deleteTask,
    toggleCompleted,
    toggleArchived,
    resetState,
  }
})
