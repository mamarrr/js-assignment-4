import { onMounted } from 'vue'

import { useCategoriesStore } from '@/modules/categories/stores/categories.store'
import { usePrioritiesStore } from '@/modules/priorities/stores/priorities.store'
import { useTasksStore } from '@/modules/tasks/stores/tasks.store'
import { toAppErrorMessage } from '@/shared/utils/error-message'
import { useFeedbackStore } from '@/stores/feedback.store'

export function useDashboardBootstrap(): void {
  const tasksStore = useTasksStore()
  const prioritiesStore = usePrioritiesStore()
  const categoriesStore = useCategoriesStore()
  const feedbackStore = useFeedbackStore()

  async function loadDashboardData(): Promise<void> {
    try {
      await Promise.all([
        tasksStore.fetchAll(),
        prioritiesStore.fetchAll(),
        categoriesStore.fetchAll(),
      ])
    } catch (error) {
      feedbackStore.error(toAppErrorMessage(error))
    }
  }

  onMounted(() => {
    void loadDashboardData()
  })
}
