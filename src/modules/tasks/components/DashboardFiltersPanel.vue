<script setup lang="ts">
import { computed, ref } from 'vue'

import { useCategoriesStore } from '@/modules/categories/stores/categories.store'
import { usePrioritiesStore } from '@/modules/priorities/stores/priorities.store'
import { useTasksStore } from '@/modules/tasks/stores/tasks.store'
import type { TaskFilterField } from '@/modules/tasks'

const tasksStore = useTasksStore()
const categoriesStore = useCategoriesStore()
const prioritiesStore = usePrioritiesStore()

const globalSearchInputRef = ref<HTMLInputElement | null>(null)

const criteria = computed(() => tasksStore.filterCriteria)

const categorySelectionDisabled = computed(() => {
  return (
    categoriesStore.isLoading ||
    Boolean(categoriesStore.errorMessage) ||
    !categoriesStore.items.length
  )
})

const prioritySelectionDisabled = computed(() => {
  return (
    prioritiesStore.isLoading ||
    Boolean(prioritiesStore.errorMessage) ||
    !prioritiesStore.items.length
  )
})

function updateTextField(field: 'globalText' | 'nameText', value: string): void {
  tasksStore.updateFilterCriteria({ [field]: value })
}

function updateCompletion(value: 'all' | 'completed' | 'notCompleted'): void {
  tasksStore.updateFilterCriteria({ completion: value })
}

function updateArchive(value: 'all' | 'active' | 'archived'): void {
  tasksStore.updateFilterCriteria({ archive: value })
}

function updateDateField(field: 'dueDateFrom' | 'dueDateTo', value: string): void {
  tasksStore.updateFilterCriteria({ [field]: value || null })
}

function toggleMultiId(field: 'categoryIds' | 'priorityIds', id: string, checked: boolean): void {
  const source = field === 'categoryIds' ? criteria.value.categoryIds : criteria.value.priorityIds
  const next = checked ? [...source, id] : source.filter((value) => value !== id)

  tasksStore.updateFilterCriteria({ [field]: next })
}

function clearField(field: TaskFilterField): void {
  tasksStore.clearFilterCriteriaField(field)
}

function focusFirstControl(): void {
  globalSearchInputRef.value?.focus()
}

defineExpose({
  focusFirstControl,
})
</script>

<template>
  <article class="panel filters-panel" aria-labelledby="filters-title">
    <div class="panel-header">
      <h2 id="filters-title">Filters</h2>
      <button
        type="button"
        class="secondary"
        :disabled="!tasksStore.hasActiveFilters"
        @click="tasksStore.resetFilters"
      >
        Reset all
      </button>
    </div>

    <fieldset>
      <legend>Search</legend>

      <label for="filter-global-text">Global text</label>
      <input
        id="filter-global-text"
        ref="globalSearchInputRef"
        :value="criteria.globalText"
        type="search"
        autocomplete="off"
        @input="updateTextField('globalText', ($event.target as HTMLInputElement).value)"
      />

      <label for="filter-name-text">Task name</label>
      <input
        id="filter-name-text"
        :value="criteria.nameText"
        type="search"
        autocomplete="off"
        @input="updateTextField('nameText', ($event.target as HTMLInputElement).value)"
      />

      <button type="button" class="secondary" @click="clearField('globalText')">Clear text</button>
      <button type="button" class="secondary" @click="clearField('nameText')">Clear name</button>
    </fieldset>

    <fieldset>
      <legend>Status</legend>

      <label for="filter-completion">Completion</label>
      <select
        id="filter-completion"
        :value="criteria.completion"
        @change="
          updateCompletion(
            ($event.target as HTMLSelectElement).value as 'all' | 'completed' | 'notCompleted',
          )
        "
      >
        <option value="all">All</option>
        <option value="completed">Completed</option>
        <option value="notCompleted">Not completed</option>
      </select>

      <label for="filter-archive">Archive state</label>
      <select
        id="filter-archive"
        :value="criteria.archive"
        @change="
          updateArchive(($event.target as HTMLSelectElement).value as 'all' | 'active' | 'archived')
        "
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>

      <div class="actions-row">
        <button type="button" class="secondary" @click="clearField('completion')">
          Clear completion
        </button>
        <button type="button" class="secondary" @click="clearField('archive')">
          Clear archive
        </button>
      </div>
    </fieldset>

    <fieldset>
      <legend>Due date</legend>

      <label for="filter-due-date-from">From</label>
      <input
        id="filter-due-date-from"
        :value="criteria.dueDateFrom || ''"
        type="date"
        @input="updateDateField('dueDateFrom', ($event.target as HTMLInputElement).value)"
      />

      <label for="filter-due-date-to">To</label>
      <input
        id="filter-due-date-to"
        :value="criteria.dueDateTo || ''"
        type="date"
        @input="updateDateField('dueDateTo', ($event.target as HTMLInputElement).value)"
      />

      <button type="button" class="secondary" @click="clearField('dueDateFrom')">
        Clear due from
      </button>
      <button type="button" class="secondary" @click="clearField('dueDateTo')">Clear due to</button>
    </fieldset>

    <fieldset>
      <legend>Categories</legend>

      <p v-if="categoriesStore.isLoading" class="status info">Loading categories…</p>
      <p v-else-if="categoriesStore.errorMessage" class="status error">
        Categories unavailable: {{ categoriesStore.errorMessage }}
      </p>
      <p v-else-if="categoriesStore.items.length === 0" class="status empty">
        No categories available.
      </p>

      <fieldset :disabled="categorySelectionDisabled" class="group-list">
        <legend class="sr-only">Category selection options</legend>

        <label v-for="category in categoriesStore.items" :key="category.id" class="check-row">
          <input
            :checked="criteria.categoryIds.includes(category.id)"
            type="checkbox"
            @change="
              toggleMultiId('categoryIds', category.id, ($event.target as HTMLInputElement).checked)
            "
          />
          <span>{{ category.name || '(Unnamed)' }}</span>
        </label>
      </fieldset>

      <div class="actions-row">
        <button type="button" class="secondary" @click="clearField('categoryIds')">
          Clear categories
        </button>
      </div>
    </fieldset>

    <fieldset>
      <legend>Priorities</legend>

      <p v-if="prioritiesStore.isLoading" class="status info">Loading priorities…</p>
      <p v-else-if="prioritiesStore.errorMessage" class="status error">
        Priorities unavailable: {{ prioritiesStore.errorMessage }}
      </p>
      <p v-else-if="prioritiesStore.items.length === 0" class="status empty">
        No priorities available.
      </p>

      <fieldset :disabled="prioritySelectionDisabled" class="group-list">
        <legend class="sr-only">Priority selection options</legend>

        <label v-for="priority in prioritiesStore.items" :key="priority.id" class="check-row">
          <input
            :checked="criteria.priorityIds.includes(priority.id)"
            type="checkbox"
            @change="
              toggleMultiId('priorityIds', priority.id, ($event.target as HTMLInputElement).checked)
            "
          />
          <span>{{ priority.name || '(Unnamed)' }}</span>
        </label>
      </fieldset>

      <div class="actions-row">
        <button type="button" class="secondary" @click="clearField('priorityIds')">
          Clear priorities
        </button>
      </div>
    </fieldset>
  </article>
</template>

<style scoped>
.filters-panel {
  display: grid;
  gap: 0.75rem;
}

.panel {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.panel-header h2 {
  margin: 0;
}

fieldset {
  margin: 0;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0.65rem;
  display: grid;
  gap: 0.4rem;
}

legend {
  font-size: 0.9rem;
  padding: 0 0.35rem;
}

label {
  display: grid;
  gap: 0.25rem;
  font-size: 0.9rem;
}

input,
select,
button {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.45rem 0.6rem;
  background: var(--color-background-soft);
  color: var(--color-text);
}

button {
  cursor: pointer;
}

button.secondary {
  opacity: 0.9;
}

.actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.check-row input {
  padding: 0;
}

.group-list {
  max-height: 180px;
  overflow: auto;
}

.status {
  margin: 0;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  font-size: 0.85rem;
}

.status.error {
  border-color: #b52a2a;
}

.status.info {
  border-color: #447ab4;
}

.status.empty {
  border-color: #74808b;
}

.sr-only {
  border: 0;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
</style>
