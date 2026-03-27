import { defineStore } from 'pinia'

export const useCategoriesStore = defineStore('categories', () => {
  function resetState(): void {
    // Domain state/actions will be implemented in a later subtask.
  }

  return {
    resetState,
  }
})
