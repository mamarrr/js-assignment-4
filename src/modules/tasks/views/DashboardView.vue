<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

import { useCategoriesStore } from '@/modules/categories/stores/categories.store'
import { usePrioritiesStore } from '@/modules/priorities/stores/priorities.store'
import { useTasksStore } from '@/modules/tasks/stores/tasks.store'
import type { TodoTaskModel } from '@/modules/tasks/types/task.model'
import { toAppErrorMessage } from '@/shared/utils/error-message'
import {
  validateTaskForm,
  validateTaxonomyForm,
  type TaskFormValues,
  type TaxonomyFormValues,
} from '@/shared/validation/forms'
import { useFeedbackStore } from '@/stores/feedback.store'

type TaskFormErrors = ReturnType<typeof validateTaskForm>
type TaxonomyFormErrors = ReturnType<typeof validateTaxonomyForm>

const tasksStore = useTasksStore()
const prioritiesStore = usePrioritiesStore()
const categoriesStore = useCategoriesStore()
const feedbackStore = useFeedbackStore()

const editingTaskId = ref<string | null>(null)
const editingPriorityId = ref<string | null>(null)
const editingCategoryId = ref<string | null>(null)

const createTaskForm = reactive<TaskFormValues>({
  name: '',
  dueAtLocal: '',
  categoryId: '',
  priorityId: '',
})

const editTaskForm = reactive<TaskFormValues>({
  name: '',
  dueAtLocal: '',
  categoryId: '',
  priorityId: '',
})

const createPriorityForm = reactive<TaxonomyFormValues>({
  name: '',
  sort: 0,
  tag: '',
})

const editPriorityForm = reactive<TaxonomyFormValues>({
  name: '',
  sort: 0,
  tag: '',
})

const createCategoryForm = reactive<TaxonomyFormValues>({
  name: '',
  sort: 0,
  tag: '',
})

const editCategoryForm = reactive<TaxonomyFormValues>({
  name: '',
  sort: 0,
  tag: '',
})

const createTaskErrors = reactive<TaskFormErrors>({})
const editTaskErrors = reactive<TaskFormErrors>({})
const createPriorityErrors = reactive<TaxonomyFormErrors>({})
const editPriorityErrors = reactive<TaxonomyFormErrors>({})
const createCategoryErrors = reactive<TaxonomyFormErrors>({})
const editCategoryErrors = reactive<TaxonomyFormErrors>({})

const isInitialLoading = computed(() => {
  return tasksStore.isLoading || prioritiesStore.isLoading || categoriesStore.isLoading
})

const canCreateTask = computed(() => {
  return Boolean(prioritiesStore.items.length && categoriesStore.items.length)
})

const priorityNameById = computed(() => {
  return new Map(prioritiesStore.items.map((item) => [item.id, item.name]))
})

const categoryNameById = computed(() => {
  return new Map(categoriesStore.items.map((item) => [item.id, item.name]))
})

function applyFormErrors<T extends Record<string, string | undefined>>(
  target: T,
  next: T,
): boolean {
  for (const key of Object.keys(target)) {
    delete target[key]
  }

  Object.assign(target, next)
  return Object.keys(next).length === 0
}

function validateCreateTaskInline(): void {
  applyFormErrors(createTaskErrors, validateTaskForm(createTaskForm))
}

function validateEditTaskInline(): void {
  applyFormErrors(editTaskErrors, validateTaskForm(editTaskForm))
}

function validateCreatePriorityInline(): void {
  applyFormErrors(createPriorityErrors, validateTaxonomyForm(createPriorityForm, 'Priority'))
}

function validateEditPriorityInline(): void {
  applyFormErrors(editPriorityErrors, validateTaxonomyForm(editPriorityForm, 'Priority'))
}

function validateCreateCategoryInline(): void {
  applyFormErrors(createCategoryErrors, validateTaxonomyForm(createCategoryForm, 'Category'))
}

function validateEditCategoryInline(): void {
  applyFormErrors(editCategoryErrors, validateTaxonomyForm(editCategoryForm, 'Category'))
}

function toIsoDateTime(value: string): string | null {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.toISOString()
}

function toLocalDateTime(isoDateTime: string | null): string {
  if (!isoDateTime) {
    return ''
  }

  const parsed = new Date(isoDateTime)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  const timezoneOffsetMs = parsed.getTimezoneOffset() * 60_000
  return new Date(parsed.getTime() - timezoneOffsetMs).toISOString().slice(0, 16)
}

function getNextTaskSort(): number {
  return tasksStore.items.reduce((maxSort, item) => Math.max(maxSort, item.sort), 0) + 1
}

function getNextPrioritySort(): number {
  return prioritiesStore.items.reduce((maxSort, item) => Math.max(maxSort, item.sort), 0) + 1
}

function getNextCategorySort(): number {
  return categoriesStore.items.reduce((maxSort, item) => Math.max(maxSort, item.sort), 0) + 1
}

function startTaskEdit(task: TodoTaskModel): void {
  editingTaskId.value = task.id
  editTaskForm.name = task.name
  editTaskForm.dueAtLocal = toLocalDateTime(task.dueAt)
  editTaskForm.categoryId = task.categoryId
  editTaskForm.priorityId = task.priorityId

  validateEditTaskInline()
}

function resolvePriorityName(priorityId: string): string {
  return priorityNameById.value.get(priorityId) || 'Unknown priority'
}

function resolveCategoryName(categoryId: string): string {
  return categoryNameById.value.get(categoryId) || 'Unknown category'
}

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

  if (!createTaskForm.priorityId && prioritiesStore.items.length) {
    const firstPriority = prioritiesStore.items[0]
    if (firstPriority) {
      createTaskForm.priorityId = firstPriority.id
    }
  }

  if (!createTaskForm.categoryId && categoriesStore.items.length) {
    const firstCategory = categoriesStore.items[0]
    if (firstCategory) {
      createTaskForm.categoryId = firstCategory.id
    }
  }

  if (!createPriorityForm.sort) {
    createPriorityForm.sort = getNextPrioritySort()
  }

  if (!createCategoryForm.sort) {
    createCategoryForm.sort = getNextCategorySort()
  }
}

async function submitTaskCreate(): Promise<void> {
  const isValid = applyFormErrors(createTaskErrors, validateTaskForm(createTaskForm))
  if (!isValid) {
    feedbackStore.error('Please correct task form errors before creating.')
    return
  }

  try {
    await tasksStore.createTask({
      name: createTaskForm.name.trim(),
      sort: getNextTaskSort(),
      dueAt: toIsoDateTime(createTaskForm.dueAtLocal),
      completed: false,
      archived: false,
      categoryId: createTaskForm.categoryId,
      priorityId: createTaskForm.priorityId,
    })

    createTaskForm.name = ''
    createTaskForm.dueAtLocal = ''
    feedbackStore.success('Task created.')
  } catch (error) {
    feedbackStore.error(toAppErrorMessage(error))
  }
}

async function submitTaskEdit(): Promise<void> {
  if (!editingTaskId.value) {
    return
  }

  const isValid = applyFormErrors(editTaskErrors, validateTaskForm(editTaskForm))
  if (!isValid) {
    feedbackStore.error('Please correct task form errors before saving.')
    return
  }

  try {
    await tasksStore.updateTask(editingTaskId.value, {
      name: editTaskForm.name.trim(),
      dueAt: toIsoDateTime(editTaskForm.dueAtLocal),
      categoryId: editTaskForm.categoryId,
      priorityId: editTaskForm.priorityId,
    })

    editingTaskId.value = null
    feedbackStore.success('Task updated.')
  } catch (error) {
    feedbackStore.error(toAppErrorMessage(error))
  }
}

async function toggleTaskCompleted(taskId: string): Promise<void> {
  try {
    await tasksStore.toggleCompleted(taskId)
    feedbackStore.success('Task completion updated.')
  } catch (error) {
    feedbackStore.error(toAppErrorMessage(error))
  }
}

async function toggleTaskArchived(taskId: string): Promise<void> {
  try {
    await tasksStore.toggleArchived(taskId)
    feedbackStore.success('Task archive state updated.')
  } catch (error) {
    feedbackStore.error(toAppErrorMessage(error))
  }
}

async function deleteTask(taskId: string): Promise<void> {
  try {
    await tasksStore.deleteTask(taskId)
    feedbackStore.success('Task deleted.')
  } catch (error) {
    feedbackStore.error(toAppErrorMessage(error))
  }
}

function startPriorityEdit(priorityId: string): void {
  const current = prioritiesStore.items.find((item) => item.id === priorityId)
  if (!current) {
    return
  }

  editingPriorityId.value = current.id
  editPriorityForm.name = current.name
  editPriorityForm.sort = current.sort
  editPriorityForm.tag = current.tag

  validateEditPriorityInline()
}

async function submitPriorityCreate(): Promise<void> {
  const isValid = applyFormErrors(
    createPriorityErrors,
    validateTaxonomyForm(createPriorityForm, 'Priority'),
  )
  if (!isValid) {
    feedbackStore.error('Please correct priority form errors before creating.')
    return
  }

  try {
    await prioritiesStore.createPriority({
      name: createPriorityForm.name.trim(),
      sort: createPriorityForm.sort,
      tag: createPriorityForm.tag.trim(),
    })

    createPriorityForm.name = ''
    createPriorityForm.sort = getNextPrioritySort()
    createPriorityForm.tag = ''
    feedbackStore.success('Priority created.')
  } catch (error) {
    feedbackStore.error(toAppErrorMessage(error))
  }
}

async function submitPriorityEdit(): Promise<void> {
  if (!editingPriorityId.value) {
    return
  }

  const isValid = applyFormErrors(
    editPriorityErrors,
    validateTaxonomyForm(editPriorityForm, 'Priority'),
  )
  if (!isValid) {
    feedbackStore.error('Please correct priority form errors before saving.')
    return
  }

  try {
    await prioritiesStore.updatePriority(editingPriorityId.value, {
      name: editPriorityForm.name.trim(),
      sort: editPriorityForm.sort,
      tag: editPriorityForm.tag.trim(),
    })

    editingPriorityId.value = null
    feedbackStore.success('Priority updated.')
  } catch (error) {
    feedbackStore.error(toAppErrorMessage(error))
  }
}

async function deletePriority(priorityId: string): Promise<void> {
  try {
    await prioritiesStore.deletePriority(priorityId)
    feedbackStore.success('Priority deleted.')
  } catch (error) {
    feedbackStore.error(toAppErrorMessage(error))
  }
}

function startCategoryEdit(categoryId: string): void {
  const current = categoriesStore.items.find((item) => item.id === categoryId)
  if (!current) {
    return
  }

  editingCategoryId.value = current.id
  editCategoryForm.name = current.name
  editCategoryForm.sort = current.sort
  editCategoryForm.tag = current.tag

  validateEditCategoryInline()
}

async function submitCategoryCreate(): Promise<void> {
  const isValid = applyFormErrors(
    createCategoryErrors,
    validateTaxonomyForm(createCategoryForm, 'Category'),
  )
  if (!isValid) {
    feedbackStore.error('Please correct category form errors before creating.')
    return
  }

  try {
    await categoriesStore.createCategory({
      name: createCategoryForm.name.trim(),
      sort: createCategoryForm.sort,
      tag: createCategoryForm.tag.trim(),
    })

    createCategoryForm.name = ''
    createCategoryForm.sort = getNextCategorySort()
    createCategoryForm.tag = ''
    feedbackStore.success('Category created.')
  } catch (error) {
    feedbackStore.error(toAppErrorMessage(error))
  }
}

async function submitCategoryEdit(): Promise<void> {
  if (!editingCategoryId.value) {
    return
  }

  const isValid = applyFormErrors(
    editCategoryErrors,
    validateTaxonomyForm(editCategoryForm, 'Category'),
  )
  if (!isValid) {
    feedbackStore.error('Please correct category form errors before saving.')
    return
  }

  try {
    await categoriesStore.updateCategory(editingCategoryId.value, {
      name: editCategoryForm.name.trim(),
      sort: editCategoryForm.sort,
      tag: editCategoryForm.tag.trim(),
    })

    editingCategoryId.value = null
    feedbackStore.success('Category updated.')
  } catch (error) {
    feedbackStore.error(toAppErrorMessage(error))
  }
}

async function deleteCategory(categoryId: string): Promise<void> {
  try {
    await categoriesStore.deleteCategory(categoryId)
    feedbackStore.success('Category deleted.')
  } catch (error) {
    feedbackStore.error(toAppErrorMessage(error))
  }
}

onMounted(() => {
  void loadDashboardData()
})
</script>

<template>
  <section class="dashboard-grid">
    <article class="panel tasks-panel">
      <h1>Dashboard</h1>

      <p v-if="!canCreateTask" class="status info">
        Create at least one priority and one category before adding tasks.
      </p>

      <form class="card" @submit.prevent="submitTaskCreate">
        <h2>Create task</h2>
        <fieldset :disabled="tasksStore.isMutating || isInitialLoading">
          <label>
            Name
            <input v-model="createTaskForm.name" maxlength="128" @blur="validateCreateTaskInline" />
            <small v-if="createTaskErrors.name" class="field-error">{{
              createTaskErrors.name
            }}</small>
          </label>
          <label>
            Due date
            <input
              v-model="createTaskForm.dueAtLocal"
              type="datetime-local"
              @blur="validateCreateTaskInline"
            />
            <small v-if="createTaskErrors.dueAtLocal" class="field-error">
              {{ createTaskErrors.dueAtLocal }}
            </small>
          </label>
          <label>
            Priority
            <select v-model="createTaskForm.priorityId" @change="validateCreateTaskInline">
              <option value="">Select priority</option>
              <option
                v-for="priority in prioritiesStore.items"
                :key="priority.id"
                :value="priority.id"
              >
                {{ priority.name || '(Unnamed)' }}
              </option>
            </select>
            <small v-if="createTaskErrors.priorityId" class="field-error">
              {{ createTaskErrors.priorityId }}
            </small>
          </label>
          <label>
            Category
            <select v-model="createTaskForm.categoryId" @change="validateCreateTaskInline">
              <option value="">Select category</option>
              <option
                v-for="category in categoriesStore.items"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name || '(Unnamed)' }}
              </option>
            </select>
            <small v-if="createTaskErrors.categoryId" class="field-error">
              {{ createTaskErrors.categoryId }}
            </small>
          </label>
          <button type="submit" :disabled="!canCreateTask || tasksStore.isMutating">
            {{ tasksStore.isMutating ? 'Creating...' : 'Create task' }}
          </button>
        </fieldset>
      </form>

      <p v-if="tasksStore.isLoading" class="status info">Loading tasks...</p>
      <p v-else-if="tasksStore.errorMessage" class="status error">{{ tasksStore.errorMessage }}</p>
      <p v-else-if="tasksStore.isEmpty" class="status empty">No tasks available yet.</p>

      <div v-else class="tasks-list">
        <article v-for="task in tasksStore.items" :key="task.id" class="card task-card">
          <template v-if="editingTaskId === task.id">
            <h2>Edit task</h2>
            <label>
              Name
              <input v-model="editTaskForm.name" maxlength="128" @blur="validateEditTaskInline" />
              <small v-if="editTaskErrors.name" class="field-error">{{
                editTaskErrors.name
              }}</small>
            </label>
            <label>
              Due date
              <input
                v-model="editTaskForm.dueAtLocal"
                type="datetime-local"
                @blur="validateEditTaskInline"
              />
              <small v-if="editTaskErrors.dueAtLocal" class="field-error">
                {{ editTaskErrors.dueAtLocal }}
              </small>
            </label>
            <label>
              Priority
              <select v-model="editTaskForm.priorityId" @change="validateEditTaskInline">
                <option value="">Select priority</option>
                <option
                  v-for="priority in prioritiesStore.items"
                  :key="priority.id"
                  :value="priority.id"
                >
                  {{ priority.name || '(Unnamed)' }}
                </option>
              </select>
              <small v-if="editTaskErrors.priorityId" class="field-error">
                {{ editTaskErrors.priorityId }}
              </small>
            </label>
            <label>
              Category
              <select v-model="editTaskForm.categoryId" @change="validateEditTaskInline">
                <option value="">Select category</option>
                <option
                  v-for="category in categoriesStore.items"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name || '(Unnamed)' }}
                </option>
              </select>
              <small v-if="editTaskErrors.categoryId" class="field-error">
                {{ editTaskErrors.categoryId }}
              </small>
            </label>
            <div class="actions-row">
              <button type="button" :disabled="tasksStore.isMutating" @click="submitTaskEdit">
                Save
              </button>
              <button
                type="button"
                class="secondary"
                :disabled="tasksStore.isMutating"
                @click="editingTaskId = null"
              >
                Cancel
              </button>
            </div>
          </template>

          <template v-else>
            <h2>{{ task.name || 'Untitled task' }}</h2>
            <p>Priority: {{ resolvePriorityName(task.priorityId) }}</p>
            <p>Category: {{ resolveCategoryName(task.categoryId) }}</p>
            <p v-if="task.dueAt">Due: {{ new Date(task.dueAt).toLocaleString() }}</p>
            <p>Status: {{ task.completed ? 'Completed' : 'Open' }}</p>
            <p>Archived: {{ task.archived ? 'Yes' : 'No' }}</p>

            <div class="actions-row">
              <button type="button" :disabled="tasksStore.isMutating" @click="startTaskEdit(task)">
                Edit
              </button>
              <button
                type="button"
                :disabled="tasksStore.isMutating"
                @click="toggleTaskCompleted(task.id)"
              >
                {{ task.completed ? 'Mark open' : 'Mark complete' }}
              </button>
              <button
                type="button"
                :disabled="tasksStore.isMutating"
                @click="toggleTaskArchived(task.id)"
              >
                {{ task.archived ? 'Unarchive' : 'Archive' }}
              </button>
              <button
                type="button"
                class="danger"
                :disabled="tasksStore.isMutating"
                @click="deleteTask(task.id)"
              >
                Delete
              </button>
            </div>
          </template>
        </article>
      </div>
    </article>

    <aside class="side-tools">
      <article class="panel">
        <h2>Priorities</h2>
        <details open>
          <summary>Manage priorities</summary>

          <form class="card" @submit.prevent="submitPriorityCreate">
            <fieldset :disabled="prioritiesStore.isMutating || prioritiesStore.isLoading">
              <label>
                Name
                <input
                  v-model="createPriorityForm.name"
                  maxlength="128"
                  @blur="validateCreatePriorityInline"
                />
                <small v-if="createPriorityErrors.name" class="field-error">
                  {{ createPriorityErrors.name }}
                </small>
              </label>
              <label>
                Sort
                <input
                  v-model.number="createPriorityForm.sort"
                  type="number"
                  @blur="validateCreatePriorityInline"
                />
                <small v-if="createPriorityErrors.sort" class="field-error">
                  {{ createPriorityErrors.sort }}
                </small>
              </label>
              <label>
                Tag
                <input
                  v-model="createPriorityForm.tag"
                  maxlength="64"
                  @blur="validateCreatePriorityInline"
                />
                <small v-if="createPriorityErrors.tag" class="field-error">
                  {{ createPriorityErrors.tag }}
                </small>
              </label>
              <button type="submit">
                {{ prioritiesStore.isMutating ? 'Adding...' : 'Add priority' }}
              </button>
            </fieldset>
          </form>

          <p v-if="prioritiesStore.isLoading" class="status info">Loading priorities...</p>
          <p v-else-if="prioritiesStore.errorMessage" class="status error">
            {{ prioritiesStore.errorMessage }}
          </p>
          <p v-else-if="prioritiesStore.isEmpty" class="status empty">No priorities available.</p>

          <div v-else class="mini-list">
            <article v-for="priority in prioritiesStore.items" :key="priority.id" class="card">
              <template v-if="editingPriorityId === priority.id">
                <label>
                  Name
                  <input
                    v-model="editPriorityForm.name"
                    maxlength="128"
                    @blur="validateEditPriorityInline"
                  />
                  <small v-if="editPriorityErrors.name" class="field-error">
                    {{ editPriorityErrors.name }}
                  </small>
                </label>
                <label>
                  Sort
                  <input
                    v-model.number="editPriorityForm.sort"
                    type="number"
                    @blur="validateEditPriorityInline"
                  />
                  <small v-if="editPriorityErrors.sort" class="field-error">
                    {{ editPriorityErrors.sort }}
                  </small>
                </label>
                <label>
                  Tag
                  <input
                    v-model="editPriorityForm.tag"
                    maxlength="64"
                    @blur="validateEditPriorityInline"
                  />
                  <small v-if="editPriorityErrors.tag" class="field-error">
                    {{ editPriorityErrors.tag }}
                  </small>
                </label>
                <div class="actions-row">
                  <button
                    type="button"
                    :disabled="prioritiesStore.isMutating"
                    @click="submitPriorityEdit"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    class="secondary"
                    :disabled="prioritiesStore.isMutating"
                    @click="editingPriorityId = null"
                  >
                    Cancel
                  </button>
                </div>
              </template>

              <template v-else>
                <strong>{{ priority.name || 'Unnamed priority' }}</strong>
                <small>Sort: {{ priority.sort }}</small>
                <small v-if="priority.tag">Tag: {{ priority.tag }}</small>
                <div class="actions-row">
                  <button
                    type="button"
                    :disabled="prioritiesStore.isMutating"
                    @click="startPriorityEdit(priority.id)"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="danger"
                    :disabled="prioritiesStore.isMutating"
                    @click="deletePriority(priority.id)"
                  >
                    Delete
                  </button>
                </div>
              </template>
            </article>
          </div>
        </details>
      </article>

      <article class="panel">
        <h2>Categories</h2>
        <details open>
          <summary>Manage categories</summary>

          <form class="card" @submit.prevent="submitCategoryCreate">
            <fieldset :disabled="categoriesStore.isMutating || categoriesStore.isLoading">
              <label>
                Name
                <input
                  v-model="createCategoryForm.name"
                  maxlength="128"
                  @blur="validateCreateCategoryInline"
                />
                <small v-if="createCategoryErrors.name" class="field-error">
                  {{ createCategoryErrors.name }}
                </small>
              </label>
              <label>
                Sort
                <input
                  v-model.number="createCategoryForm.sort"
                  type="number"
                  @blur="validateCreateCategoryInline"
                />
                <small v-if="createCategoryErrors.sort" class="field-error">
                  {{ createCategoryErrors.sort }}
                </small>
              </label>
              <label>
                Tag
                <input
                  v-model="createCategoryForm.tag"
                  maxlength="64"
                  @blur="validateCreateCategoryInline"
                />
                <small v-if="createCategoryErrors.tag" class="field-error">
                  {{ createCategoryErrors.tag }}
                </small>
              </label>
              <button type="submit">
                {{ categoriesStore.isMutating ? 'Adding...' : 'Add category' }}
              </button>
            </fieldset>
          </form>

          <p v-if="categoriesStore.isLoading" class="status info">Loading categories...</p>
          <p v-else-if="categoriesStore.errorMessage" class="status error">
            {{ categoriesStore.errorMessage }}
          </p>
          <p v-else-if="categoriesStore.isEmpty" class="status empty">No categories available.</p>

          <div v-else class="mini-list">
            <article v-for="category in categoriesStore.items" :key="category.id" class="card">
              <template v-if="editingCategoryId === category.id">
                <label>
                  Name
                  <input
                    v-model="editCategoryForm.name"
                    maxlength="128"
                    @blur="validateEditCategoryInline"
                  />
                  <small v-if="editCategoryErrors.name" class="field-error">
                    {{ editCategoryErrors.name }}
                  </small>
                </label>
                <label>
                  Sort
                  <input
                    v-model.number="editCategoryForm.sort"
                    type="number"
                    @blur="validateEditCategoryInline"
                  />
                  <small v-if="editCategoryErrors.sort" class="field-error">
                    {{ editCategoryErrors.sort }}
                  </small>
                </label>
                <label>
                  Tag
                  <input
                    v-model="editCategoryForm.tag"
                    maxlength="64"
                    @blur="validateEditCategoryInline"
                  />
                  <small v-if="editCategoryErrors.tag" class="field-error">
                    {{ editCategoryErrors.tag }}
                  </small>
                </label>
                <div class="actions-row">
                  <button
                    type="button"
                    :disabled="categoriesStore.isMutating"
                    @click="submitCategoryEdit"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    class="secondary"
                    :disabled="categoriesStore.isMutating"
                    @click="editingCategoryId = null"
                  >
                    Cancel
                  </button>
                </div>
              </template>

              <template v-else>
                <strong>{{ category.name || 'Unnamed category' }}</strong>
                <small>Sort: {{ category.sort }}</small>
                <small v-if="category.tag">Tag: {{ category.tag }}</small>
                <div class="actions-row">
                  <button
                    type="button"
                    :disabled="categoriesStore.isMutating"
                    @click="startCategoryEdit(category.id)"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="danger"
                    :disabled="categoriesStore.isMutating"
                    @click="deleteCategory(category.id)"
                  >
                    Delete
                  </button>
                </div>
              </template>
            </article>
          </div>
        </details>
      </article>
    </aside>
  </section>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.tasks-list,
.mini-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.side-tools {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.panel {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
}

.card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0.85rem;
  display: grid;
  gap: 0.5rem;
}

fieldset {
  margin: 0;
  border: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
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
  opacity: 0.8;
}

button.danger {
  border-color: #b52a2a;
}

.actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.status {
  margin: 0.35rem 0;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.status.success {
  border-color: #1d8143;
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

.field-error {
  color: #c23f3f;
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 2fr minmax(240px, 320px);
  }
}
</style>
