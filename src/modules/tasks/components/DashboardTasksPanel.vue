<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import { useCategoriesStore } from '@/modules/categories/stores/categories.store'
import { usePrioritiesStore } from '@/modules/priorities/stores/priorities.store'
import { useTasksStore } from '@/modules/tasks/stores/tasks.store'
import type { TodoTaskModel } from '@/modules/tasks/types/task.model'
import { toAppErrorMessage } from '@/shared/utils/error-message'
import { validateTaskForm, type TaskFormValues } from '@/shared/validation/forms'
import { useFeedbackStore } from '@/stores/feedback.store'

type TaskFormErrors = ReturnType<typeof validateTaskForm>

const tasksStore = useTasksStore()
const prioritiesStore = usePrioritiesStore()
const categoriesStore = useCategoriesStore()
const feedbackStore = useFeedbackStore()

const editingTaskId = ref<string | null>(null)
const isCreateTaskExpanded = ref(false)

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

const createTaskErrors = reactive<TaskFormErrors>({})
const editTaskErrors = reactive<TaskFormErrors>({})

const isInitialLoading = computed(() => {
  return tasksStore.isLoading || prioritiesStore.isLoading || categoriesStore.isLoading
})

const visibleTasks = computed(() => {
  return tasksStore.items.filter((task) => !task.archived)
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

watch(
  () => prioritiesStore.items,
  (items) => {
    if (!createTaskForm.priorityId && items.length > 0) {
      const first = items[0]
      if (first) {
        createTaskForm.priorityId = first.id
      }
    }
  },
  { immediate: true },
)

watch(
  () => categoriesStore.items,
  (items) => {
    if (!createTaskForm.categoryId && items.length > 0) {
      const first = items[0]
      if (first) {
        createTaskForm.categoryId = first.id
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <article class="panel tasks-panel">
    <h1>Dashboard</h1>

    <p v-if="!canCreateTask" class="status info">
      Create at least one priority and one category before adding tasks.
    </p>

    <form class="card" @submit.prevent="submitTaskCreate">
      <div class="section-header">
        <h2>Create task</h2>
        <button
          type="button"
          class="secondary"
          :disabled="tasksStore.isMutating || isInitialLoading"
          @click="isCreateTaskExpanded = !isCreateTaskExpanded"
        >
          {{ isCreateTaskExpanded ? 'Collapse' : 'Expand' }}
        </button>
      </div>

      <fieldset v-if="isCreateTaskExpanded" :disabled="tasksStore.isMutating || isInitialLoading">
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
    <p v-else-if="visibleTasks.length === 0" class="status empty">No tasks available yet.</p>

    <div v-else class="tasks-list">
      <article v-for="task in visibleTasks" :key="task.id" class="card task-card">
        <template v-if="editingTaskId === task.id">
          <h2>Edit task</h2>
          <label>
            Name
            <input v-model="editTaskForm.name" maxlength="128" @blur="validateEditTaskInline" />
            <small v-if="editTaskErrors.name" class="field-error">{{ editTaskErrors.name }}</small>
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
</template>

<style scoped>
.tasks-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.section-header h2 {
  margin: 0;
}

.status {
  margin: 0.35rem 0;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
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
</style>
