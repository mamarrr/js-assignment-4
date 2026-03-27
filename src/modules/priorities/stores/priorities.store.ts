import { defineStore } from 'pinia'

export const usePrioritiesStore = defineStore('priorities', () => {
  function resetState(): void {
    // Domain state/actions will be implemented in a later subtask.
  }

  return {
    resetState,
  }
})
