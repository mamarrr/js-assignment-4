import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { categoriesService } from '@/modules/categories/services/categories.service'
import type {
  TodoCategoryCreateInput,
  TodoCategoryModel,
  TodoCategoryUpdateInput,
} from '@/modules/categories/types/category.model'
import { toAppErrorMessage } from '@/shared/utils/error-message'

function toStoreError(error: unknown): string {
  return toAppErrorMessage(error)
}

export const useCategoriesStore = defineStore('categories', () => {
  const items = ref<TodoCategoryModel[]>([])
  const isLoading = ref(false)
  const isMutating = ref(false)
  const hasLoaded = ref(false)
  const errorMessage = ref<string | null>(null)

  const isEmpty = computed(() => hasLoaded.value && items.value.length === 0)

  function setActionError(error: unknown): void {
    errorMessage.value = toStoreError(error)
  }

  function upsertItem(nextItem: TodoCategoryModel): void {
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
      items.value = await categoriesService.list()
      hasLoaded.value = true
    } catch (error) {
      setActionError(error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function createCategory(payload: TodoCategoryCreateInput): Promise<TodoCategoryModel> {
    isMutating.value = true
    errorMessage.value = null

    try {
      const created = await categoriesService.create(payload)
      upsertItem(created)
      return created
    } catch (error) {
      setActionError(error)
      throw error
    } finally {
      isMutating.value = false
    }
  }

  async function updateCategory(
    id: string,
    patch: TodoCategoryUpdateInput,
  ): Promise<TodoCategoryModel> {
    const current = items.value.find((item) => item.id === id)
    if (!current) {
      throw new Error('Category was not found in local state')
    }

    isMutating.value = true
    errorMessage.value = null

    try {
      const merged: TodoCategoryModel = {
        ...current,
        name: patch.name ?? current.name,
        sort: patch.sort ?? current.sort,
        tag: patch.tag ?? current.tag,
      }

      const updated = await categoriesService.update(merged)
      upsertItem(updated)
      return updated
    } catch (error) {
      setActionError(error)
      throw error
    } finally {
      isMutating.value = false
    }
  }

  async function deleteCategory(id: string): Promise<void> {
    isMutating.value = true
    errorMessage.value = null

    try {
      await categoriesService.deleteById(id)
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
    createCategory,
    updateCategory,
    deleteCategory,
    resetState,
  }
})
