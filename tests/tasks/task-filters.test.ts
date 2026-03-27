import { describe, expect, it } from 'vitest'

import {
  applyTaskFilters,
  buildActiveTaskFilterChips,
  clearTaskFilterField,
  createDefaultTaskFilterCriteria,
  getActiveTaskFilterCount,
  mergeTaskFilterCriteria,
} from '@/modules/tasks/composables/task-filters'
import type { TodoTaskModel } from '@/modules/tasks/types/task.model'

function makeTask(
  overrides: Partial<TodoTaskModel> & { description?: unknown; tags?: unknown } = {},
) {
  return {
    id: 'task-1',
    name: 'Write docs',
    sort: 1,
    createdAt: '2026-01-01T10:00:00.000Z',
    dueAt: '2026-01-10T12:00:00.000Z',
    completed: false,
    archived: false,
    categoryId: 'cat-a',
    priorityId: 'pri-a',
    syncAt: '2026-01-01T10:00:00.000Z',
    ...overrides,
  } as TodoTaskModel
}

describe('task-filters predicate utilities', () => {
  it('applies text matching for global text and name text', () => {
    const taskByName = makeTask({ id: '1', name: 'Alpha planning' })
    const taskByDescription = makeTask({ id: '2', name: 'Task', description: 'Contains Beta text' })
    const taskByTag = makeTask({ id: '3', name: 'Task', tags: ['Gamma'] })
    const unrelated = makeTask({ id: '4', name: 'Delta' })

    const globalResult = applyTaskFilters(
      [taskByName, taskByDescription, taskByTag, unrelated],
      mergeTaskFilterCriteria(createDefaultTaskFilterCriteria(), { globalText: '  beta ' }),
    )

    expect(globalResult.map((task) => task.id)).toEqual(['2'])

    const nameResult = applyTaskFilters(
      [taskByName, taskByDescription],
      mergeTaskFilterCriteria(createDefaultTaskFilterCriteria(), { nameText: 'alpha' }),
    )

    expect(nameResult.map((task) => task.id)).toEqual(['1'])
  })

  it('applies category and priority multi-select OR semantics with include-none flags', () => {
    const categoryAndPriority = makeTask({ id: '1', categoryId: 'cat-a', priorityId: 'pri-a' })
    const secondCategory = makeTask({ id: '2', categoryId: 'cat-b', priorityId: 'pri-a' })
    const noCategory = makeTask({ id: '3', categoryId: '' })
    const noPriority = makeTask({ id: '4', priorityId: '' })

    const byCategoryIds = applyTaskFilters(
      [categoryAndPriority, secondCategory, noCategory],
      mergeTaskFilterCriteria(createDefaultTaskFilterCriteria(), {
        categoryIds: ['cat-a', 'cat-b'],
      }),
    )

    expect(byCategoryIds.map((task) => task.id)).toEqual(['1', '2'])

    const withNoCategory = applyTaskFilters(
      [categoryAndPriority, noCategory],
      mergeTaskFilterCriteria(createDefaultTaskFilterCriteria(), {
        includeNoCategory: true,
      }),
    )

    expect(withNoCategory.map((task) => task.id)).toEqual(['3'])

    const withNoPriority = applyTaskFilters(
      [categoryAndPriority, noPriority],
      mergeTaskFilterCriteria(createDefaultTaskFilterCriteria(), {
        includeNoPriority: true,
      }),
    )

    expect(withNoPriority.map((task) => task.id)).toEqual(['4'])
  })

  it('applies completion and archive filters', () => {
    const completed = makeTask({ id: '1', completed: true })
    const open = makeTask({ id: '2', completed: false })
    const archived = makeTask({ id: '3', archived: true })

    const completedOnly = applyTaskFilters(
      [completed, open],
      mergeTaskFilterCriteria(createDefaultTaskFilterCriteria(), { completion: 'completed' }),
    )
    expect(completedOnly.map((task) => task.id)).toEqual(['1'])

    const openOnly = applyTaskFilters(
      [completed, open],
      mergeTaskFilterCriteria(createDefaultTaskFilterCriteria(), { completion: 'notCompleted' }),
    )
    expect(openOnly.map((task) => task.id)).toEqual(['2'])

    const archivedOnly = applyTaskFilters(
      [completed, archived],
      mergeTaskFilterCriteria(createDefaultTaskFilterCriteria(), { archive: 'archived' }),
    )
    expect(archivedOnly.map((task) => task.id)).toEqual(['3'])
  })

  it('applies AND semantics across fields and OR within each multiselect field', () => {
    const matching = makeTask({
      id: '1',
      name: 'Alpha task',
      categoryId: 'cat-a',
      priorityId: 'pri-a',
    })
    const wrongCategory = makeTask({
      id: '2',
      name: 'Alpha task',
      categoryId: 'cat-c',
      priorityId: 'pri-a',
    })
    const wrongText = makeTask({
      id: '3',
      name: 'Beta task',
      categoryId: 'cat-a',
      priorityId: 'pri-b',
    })

    const result = applyTaskFilters(
      [matching, wrongCategory, wrongText],
      mergeTaskFilterCriteria(createDefaultTaskFilterCriteria(), {
        globalText: 'alpha',
        categoryIds: ['cat-a', 'cat-b'],
        priorityIds: ['pri-a', 'pri-b'],
      }),
    )

    expect(result.map((task) => task.id)).toEqual(['1'])
  })

  it('handles date range edges, null due dates and invalid date values defensively', () => {
    const inRangeStart = makeTask({ id: '1', dueAt: '2026-02-01T00:00:00.000Z' })
    const inRangeEnd = makeTask({ id: '2', dueAt: '2026-02-10T12:00:00.000Z' })
    const outOfRange = makeTask({ id: '3', dueAt: '2026-02-11T00:00:00.000Z' })
    const noDueDate = makeTask({ id: '4', dueAt: null })
    const invalidDueDate = makeTask({ id: '5', dueAt: 'not-a-date' as TodoTaskModel['dueAt'] })

    const withRange = applyTaskFilters(
      [inRangeStart, inRangeEnd, outOfRange, noDueDate, invalidDueDate],
      mergeTaskFilterCriteria(createDefaultTaskFilterCriteria(), {
        dueDateFrom: '2026-02-01',
        dueDateTo: '2026-02-10',
      }),
    )

    expect(withRange.map((task) => task.id)).toEqual(['1', '2'])

    const invalidCriteriaDate = applyTaskFilters(
      [inRangeStart, noDueDate],
      mergeTaskFilterCriteria(createDefaultTaskFilterCriteria(), {
        dueDateFrom: 'invalid-date',
      }),
    )

    expect(invalidCriteriaDate.map((task) => task.id)).toEqual(['1', '4'])
  })

  it('generates active chips and supports per-field clear helpers', () => {
    const criteria = mergeTaskFilterCriteria(createDefaultTaskFilterCriteria(), {
      globalText: 'Alpha',
      categoryIds: ['cat-a', 'cat-b'],
      includeNoPriority: true,
      completion: 'completed',
      dueDateFrom: '2026-03-01',
    })

    const chips = buildActiveTaskFilterChips(criteria)
    expect(chips.map((chip) => chip.field)).toEqual([
      'globalText',
      'categoryIds',
      'includeNoPriority',
      'completion',
      'dueDateFrom',
    ])
    expect(getActiveTaskFilterCount(criteria)).toBe(5)

    const afterClearOne = clearTaskFilterField(criteria, 'globalText')
    expect(afterClearOne.globalText).toBe('')
    expect(afterClearOne.categoryIds).toEqual(['cat-a', 'cat-b'])
  })
})
