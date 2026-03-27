import { defineStore } from 'pinia'

export const useTasksStore = defineStore('tasks', () => {
  function resetState(): void {
    // Domain state/actions will be implemented in a later subtask.
  }

  return {
    resetState,
  }
})
