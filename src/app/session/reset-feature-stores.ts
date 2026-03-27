import { useCategoriesStore } from '@/modules/categories/stores/categories.store'
import { usePrioritiesStore } from '@/modules/priorities/stores/priorities.store'
import { useTasksStore } from '@/modules/tasks/stores/tasks.store'

export function resetFeatureStores(): void {
  useTasksStore().resetState()
  usePrioritiesStore().resetState()
  useCategoriesStore().resetState()
}
