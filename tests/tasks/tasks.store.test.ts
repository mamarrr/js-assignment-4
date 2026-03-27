import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useTasksStore } from '@/modules/tasks/stores/tasks.store'
import type { TodoTaskModel } from '@/modules/tasks/types/task.model'

function makeTask(overrides: Partial<TodoTaskModel> = {}): TodoTaskModel {
  return {
    id: 'task-1',
    name: 'Default task',
    sort: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    dueAt: null,
    completed: false,
    archived: false,
    categoryId: 'cat-a',
    priorityId: 'pri-a',
    syncAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('tasks store filtering state and selectors', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('supports update, clear field and reset filter actions', () => {
    const store = useTasksStore()

    store.updateFilterCriteria({
      globalText: ' alpha ',
      categoryIds: ['cat-b', 'cat-a', 'cat-a'],
      includeNoCategory: true,
      completion: 'completed',
    })

    expect(store.filterCriteria.globalText).toBe('alpha')
    expect(store.filterCriteria.categoryIds).toEqual(['cat-a', 'cat-b'])
    expect(store.filterCriteria.includeNoCategory).toBe(true)
    expect(store.filterCriteria.completion).toBe('completed')

    store.clearFilterCriteriaField('categoryIds')
    expect(store.filterCriteria.categoryIds).toEqual([])
    expect(store.filterCriteria.includeNoCategory).toBe(true)

    store.resetFilters()
    expect(store.filterCriteria.globalText).toBe('')
    expect(store.filterCriteria.includeNoCategory).toBe(false)
    expect(store.filterCriteria.completion).toBe('all')
  })

  it('derives filtered items, count, summary and active state from filters', () => {
    const store = useTasksStore()

    store.items = [
      makeTask({ id: '1', name: 'Alpha task', completed: false }),
      makeTask({ id: '2', name: 'Beta task', completed: true }),
      makeTask({ id: '3', name: 'Alpha archived', completed: true, archived: true }),
    ]

    expect(store.filteredItems.map((item) => item.id)).toEqual(['1', '2', '3'])
    expect(store.resultSummary).toBe('Showing 3 of 3 tasks')
    expect(store.hasActiveFilters).toBe(false)
    expect(store.activeFilterCount).toBe(0)

    store.updateFilterCriteria({
      nameText: 'alpha',
      completion: 'notCompleted',
      archive: 'active',
    })

    expect(store.filteredItems.map((item) => item.id)).toEqual(['1'])
    expect(store.filteredTasks.map((item) => item.id)).toEqual(['1'])
    expect(store.hasActiveFilters).toBe(true)
    expect(store.activeFilterCount).toBe(3)
    expect(store.activeFilterChips.map((chip) => chip.field)).toEqual([
      'nameText',
      'completion',
      'archive',
    ])
    expect(store.resultSummary).toBe('Showing 1 of 3 tasks')
  })
})
