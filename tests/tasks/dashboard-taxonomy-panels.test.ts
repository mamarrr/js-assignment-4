import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'

import { useCategoriesStore } from '@/modules/categories/stores/categories.store'
import { usePrioritiesStore } from '@/modules/priorities/stores/priorities.store'
import DashboardCategoriesPanel from '@/modules/tasks/components/DashboardCategoriesPanel.vue'
import DashboardPrioritiesPanel from '@/modules/tasks/components/DashboardPrioritiesPanel.vue'

describe('dashboard taxonomy panels error rendering', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('keeps category list visible when an error message exists', () => {
    const categoriesStore = useCategoriesStore()

    categoriesStore.items = [
      {
        id: 'cat-1',
        name: 'Work',
        sort: 1,
        syncAt: '2026-01-01T00:00:00.000Z',
        tag: '#work',
      },
    ]
    categoriesStore.isLoading = false
    categoriesStore.hasLoaded = true
    categoriesStore.errorMessage =
      'Entity cannot be deleted because it has 1 dependent TodoTask record(s)'

    const wrapper = mount(DashboardCategoriesPanel)

    expect(wrapper.find('.status.error').text()).toContain('Entity cannot be deleted')
    expect(wrapper.find('.mini-list').exists()).toBe(true)
    expect(wrapper.text()).toContain('Work')
  })

  it('keeps priority list visible when an error message exists', () => {
    const prioritiesStore = usePrioritiesStore()

    prioritiesStore.items = [
      {
        id: 'pri-1',
        appUserId: 'user-1',
        name: 'High',
        sort: 1,
        syncAt: '2026-01-01T00:00:00.000Z',
        tag: '#high',
      },
    ]
    prioritiesStore.isLoading = false
    prioritiesStore.hasLoaded = true
    prioritiesStore.errorMessage =
      'Entity cannot be deleted because it has 1 dependent TodoTask record(s)'

    const wrapper = mount(DashboardPrioritiesPanel)

    expect(wrapper.find('.status.error').text()).toContain('Entity cannot be deleted')
    expect(wrapper.find('.mini-list').exists()).toBe(true)
    expect(wrapper.text()).toContain('High')
  })
})
