import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCategoriesStore } from '@/modules/categories/stores/categories.store'
import { usePrioritiesStore } from '@/modules/priorities/stores/priorities.store'
import DashboardFiltersPanel from '@/modules/tasks/components/DashboardFiltersPanel.vue'
import DashboardTasksPanel from '@/modules/tasks/components/DashboardTasksPanel.vue'
import { useTasksStore } from '@/modules/tasks/stores/tasks.store'
import DashboardView from '@/modules/tasks/views/DashboardView.vue'

vi.mock('@/modules/tasks/composables/use-dashboard-bootstrap', () => ({
  useDashboardBootstrap: vi.fn(),
}))

describe('filtering UI integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders filter groups and updates controls via tasks store actions', async () => {
    const tasksStore = useTasksStore()
    const categoriesStore = useCategoriesStore()
    const prioritiesStore = usePrioritiesStore()

    categoriesStore.items = [
      { id: 'cat-a', name: 'Work', sort: 1, syncAt: '2026-01-01T00:00:00.000Z', tag: '#work' },
    ]
    prioritiesStore.items = [
      {
        id: 'pri-a',
        appUserId: 'user-1',
        name: 'High',
        sort: 1,
        syncAt: '2026-01-01T00:00:00.000Z',
        tag: '#high',
      },
    ]

    const wrapper = mount(DashboardFiltersPanel)

    expect(wrapper.text()).toContain('Search')
    expect(wrapper.text()).toContain('Status')
    expect(wrapper.text()).toContain('Due date')
    expect(wrapper.text()).toContain('Categories')
    expect(wrapper.text()).toContain('Priorities')

    await wrapper.get('#filter-global-text').setValue('Alpha')
    await wrapper.get('#filter-name-text').setValue('Report')

    expect(tasksStore.filterCriteria.globalText).toBe('Alpha')
    expect(tasksStore.filterCriteria.nameText).toBe('Report')

    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    expect(checkboxes).toHaveLength(2)
    await checkboxes[0]!.setValue(true)
    await checkboxes[1]!.setValue(true)

    expect(tasksStore.filterCriteria.categoryIds).toEqual(['cat-a'])
    expect(tasksStore.filterCriteria.priorityIds).toEqual(['pri-a'])

    await wrapper.get('button.secondary').trigger('click')
    expect(tasksStore.filterCriteria.globalText).toBe('')

    await wrapper.get('button:disabled').trigger('click')
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Reset all')
      ?.trigger('click')

    expect(tasksStore.hasActiveFilters).toBe(false)
    expect(tasksStore.activeFilterCount).toBe(0)
  })

  it('supports per-field clear and reset-all interactions on summary chips area', async () => {
    const tasksStore = useTasksStore()
    const categoriesStore = useCategoriesStore()
    const prioritiesStore = usePrioritiesStore()

    categoriesStore.items = [
      { id: 'cat-a', name: 'Work', sort: 1, syncAt: '2026-01-01T00:00:00.000Z', tag: '#work' },
    ]
    prioritiesStore.items = [
      {
        id: 'pri-a',
        appUserId: 'user-1',
        name: 'High',
        sort: 1,
        syncAt: '2026-01-01T00:00:00.000Z',
        tag: '#high',
      },
    ]

    tasksStore.items = [
      {
        id: 'task-1',
        name: 'Alpha task',
        sort: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        dueAt: null,
        completed: false,
        archived: false,
        categoryId: 'cat-a',
        priorityId: 'pri-a',
        syncAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'task-2',
        name: 'Beta task',
        sort: 2,
        createdAt: '2026-01-01T00:00:00.000Z',
        dueAt: null,
        completed: true,
        archived: false,
        categoryId: 'cat-a',
        priorityId: 'pri-a',
        syncAt: '2026-01-01T00:00:00.000Z',
      },
    ]
    tasksStore.updateFilterCriteria({ nameText: 'alpha' })

    const wrapper = mount(DashboardTasksPanel)

    expect(wrapper.get('.result-summary').text()).toBe('Showing 1 of 2 tasks')
    expect(wrapper.find('.chips-block').exists()).toBe(true)
    expect(wrapper.text()).toContain('Name: alpha')

    await wrapper.get('.chip').trigger('click')
    expect(tasksStore.filterCriteria.nameText).toBe('')

    tasksStore.updateFilterCriteria({ completion: 'completed' })
    await nextTick()

    const resetAllFilters = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Reset all filters')
    await resetAllFilters?.trigger('click')

    expect(tasksStore.hasActiveFilters).toBe(false)
  })

  it('handles mobile drawer open/close and keyboard escape deterministically', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 640, configurable: true, writable: true })

    const FiltersStub = defineComponent({
      name: 'DashboardFiltersPanel',
      setup(_, { expose }) {
        expose({ focusFirstControl: () => undefined })
        return () => '<div>Filters stub</div>'
      },
      template: '<div><button type="button">Focusable</button></div>',
    })

    const wrapper = mount(DashboardView, {
      global: {
        stubs: {
          DashboardFiltersPanel: FiltersStub,
          DashboardTasksPanel: { template: '<div>Tasks</div>' },
          DashboardPrioritiesPanel: { template: '<div>Priorities</div>' },
          DashboardCategoriesPanel: { template: '<div>Categories</div>' },
        },
      },
    })

    const trigger = wrapper.get('button.toggle-button')
    await trigger.trigger('click')

    expect(wrapper.find('#dashboard-filters-drawer').exists()).toBe(true)

    await wrapper.get('#dashboard-filters-drawer').trigger('keydown', { key: 'Escape' })
    await nextTick()

    expect(wrapper.find('#dashboard-filters-drawer').exists()).toBe(false)
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })
})
