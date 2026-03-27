<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

import { useCategoriesStore } from '@/modules/categories/stores/categories.store'
import { usePrioritiesStore } from '@/modules/priorities/stores/priorities.store'
import { useTasksStore } from '@/modules/tasks/stores/tasks.store'
import type { TodoTaskModel } from '@/modules/tasks/types/task.model'

const tasksStore = useTasksStore()
const prioritiesStore = usePrioritiesStore()
const categoriesStore = useCategoriesStore()

const feedbackMessage = ref<string | null>(null)
const editingTaskId = ref<string | null>(null)
const editingPriorityId = ref<string | null>(null)
const editingCategoryId = ref<string | null>(null)

const createTaskForm = reactive({
  name: '',
  dueAtLocal: '',
  categoryId: '',
  priorityId: '',
})

const editTaskForm = reactive({
  name: '',
  dueAtLocal: '',
  categoryId: '',
  priorityId: '',
})

const createPriorityForm = reactive({
  name: '',
  sort: 0,
  tag: '',
})

const editPriorityForm = reactive({
  name: '',
  sort: 0,
  tag: '',
})

const createCategoryForm = reactive({
  name: '',
  sort: 0,
  tag: '',
})

const editCategoryForm = reactive({
  name: '',
  sort: 0,
  tag: '',
})

const isInitialLoading = computed(() => {
  return tasksStore.isLoading || prioritiesStore.isLoading || categoriesStore.isLoading
})

const globalErrorMessage = computed(() => {
  return tasksStore.errorMessage || prioritiesStore.errorMessage || categoriesStore.errorMessage
})

const priorityNameById = computed(() => {
  return new Map(prioritiesStore.items.map((item) => [item.id, item.name]))
})

const categoryNameById = computed(() => {
  return new Map(categoriesStore.items.map((item) => [item.id, item.name]))
})

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
}

function resolvePriorityName(priorityId: string): string {
  return priorityNameById.value.get(priorityId) || 'Unknown priority'
}

function resolveCategoryName(categoryId: string): string {
  return categoryNameById.value.get(categoryId) || 'Unknown category'
}

async function loadDashboardData(): Promise<void> {
  await Promise.all([tasksStore.fetchAll(), prioritiesStore.fetchAll(), categoriesStore.fetchAll()])

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
  feedbackMessage.value = null

  await tasksStore.createTask({
    name: createTaskForm.name,
    sort: getNextTaskSort(),
    dueAt: toIsoDateTime(createTaskForm.dueAtLocal),
    completed: false,
    archived: false,
    categoryId: createTaskForm.categoryId,
    priorityId: createTaskForm.priorityId,
  })

  createTaskForm.name = ''
  createTaskForm.dueAtLocal = ''
  feedbackMessage.value = 'Task created.'
}

async function submitTaskEdit(): Promise<void> {
  if (!editingTaskId.value) {
    return
  }

  feedbackMessage.value = null

  await tasksStore.updateTask(editingTaskId.value, {
    name: editTaskForm.name,
    dueAt: toIsoDateTime(editTaskForm.dueAtLocal),
    categoryId: editTaskForm.categoryId,
    priorityId: editTaskForm.priorityId,
  })

  editingTaskId.value = null
  feedbackMessage.value = 'Task updated.'
}

async function toggleTaskCompleted(taskId: string): Promise<void> {
  feedbackMessage.value = null
  await tasksStore.toggleCompleted(taskId)
  feedbackMessage.value = 'Task completion updated.'
}

async function toggleTaskArchived(taskId: string): Promise<void> {
  feedbackMessage.value = null
  await tasksStore.toggleArchived(taskId)
  feedbackMessage.value = 'Task archive state updated.'
}

async function deleteTask(taskId: string): Promise<void> {
  feedbackMessage.value = null
  await tasksStore.deleteTask(taskId)
  feedbackMessage.value = 'Task deleted.'
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
}

async function submitPriorityCreate(): Promise<void> {
  feedbackMessage.value = null

  await prioritiesStore.createPriority({
    name: createPriorityForm.name,
    sort: createPriorityForm.sort,
    tag: createPriorityForm.tag,
  })

  createPriorityForm.name = ''
  createPriorityForm.sort = getNextPrioritySort()
  createPriorityForm.tag = ''
  feedbackMessage.value = 'Priority created.'
}

async function submitPriorityEdit(): Promise<void> {
  if (!editingPriorityId.value) {
    return
  }

  feedbackMessage.value = null

  await prioritiesStore.updatePriority(editingPriorityId.value, {
    name: editPriorityForm.name,
    sort: editPriorityForm.sort,
    tag: editPriorityForm.tag,
  })

  editingPriorityId.value = null
  feedbackMessage.value = 'Priority updated.'
}

async function deletePriority(priorityId: string): Promise<void> {
  feedbackMessage.value = null
  await prioritiesStore.deletePriority(priorityId)
  feedbackMessage.value = 'Priority deleted.'
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
}

async function submitCategoryCreate(): Promise<void> {
  feedbackMessage.value = null

  await categoriesStore.createCategory({
    name: createCategoryForm.name,
    sort: createCategoryForm.sort,
    tag: createCategoryForm.tag,
  })

  createCategoryForm.name = ''
  createCategoryForm.sort = getNextCategorySort()
  createCategoryForm.tag = ''
  feedbackMessage.value = 'Category created.'
}

async function submitCategoryEdit(): Promise<void> {
  if (!editingCategoryId.value) {
    return
  }

  feedbackMessage.value = null

  await categoriesStore.updateCategory(editingCategoryId.value, {
    name: editCategoryForm.name,
    sort: editCategoryForm.sort,
    tag: editCategoryForm.tag,
  })

  editingCategoryId.value = null
  feedbackMessage.value = 'Category updated.'
}

async function deleteCategory(categoryId: string): Promise<void> {
  feedbackMessage.value = null
  await categoriesStore.deleteCategory(categoryId)
  feedbackMessage.value = 'Category deleted.'
}

onMounted(() => {
  void loadDashboardData()
})
</script>

<template>
  <section class="dashboard-grid">
    <article class="panel tasks-panel">
      <h1>Dashboard</h1>

      <p v-if="feedbackMessage" class="status success">{{ feedbackMessage }}</p>
      <p v-if="globalErrorMessage" class="status error">{{ globalErrorMessage }}</p>

      <form class="card" @submit.prevent="submitTaskCreate">
        <h2>Create task</h2>
        <label>
          Name
          <input v-model="createTaskForm.name" required maxlength="128" />
        </label>
        <label>
          Due date
          <input v-model="createTaskForm.dueAtLocal" type="datetime-local" />
        </label>
        <label>
          Priority
          <select v-model="createTaskForm.priorityId" required>
            <option
              v-for="priority in prioritiesStore.items"
              :key="priority.id"
              :value="priority.id"
            >
              {{ priority.name || '(Unnamed)' }}
            </option>
          </select>
        </label>
        <label>
          Category
          <select v-model="createTaskForm.categoryId" required>
            <option
              v-for="category in categoriesStore.items"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name || '(Unnamed)' }}
            </option>
          </select>
        </label>
        <button type="submit" :disabled="tasksStore.isMutating">Create task</button>
      </form>

      <p v-if="isInitialLoading">Loading dashboard...</p>
      <p v-else-if="tasksStore.isEmpty">No tasks available yet.</p>

      <div v-else class="tasks-list">
        <article v-for="task in tasksStore.items" :key="task.id" class="card task-card">
          <template v-if="editingTaskId === task.id">
            <h2>Edit task</h2>
            <label>
              Name
              <input v-model="editTaskForm.name" required maxlength="128" />
            </label>
            <label>
              Due date
              <input v-model="editTaskForm.dueAtLocal" type="datetime-local" />
            </label>
            <label>
              Priority
              <select v-model="editTaskForm.priorityId" required>
                <option
                  v-for="priority in prioritiesStore.items"
                  :key="priority.id"
                  :value="priority.id"
                >
                  {{ priority.name || '(Unnamed)' }}
                </option>
              </select>
            </label>
            <label>
              Category
              <select v-model="editTaskForm.categoryId" required>
                <option
                  v-for="category in categoriesStore.items"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name || '(Unnamed)' }}
                </option>
              </select>
            </label>
            <div class="actions-row">
              <button type="button" @click="submitTaskEdit">Save</button>
              <button type="button" class="secondary" @click="editingTaskId = null">Cancel</button>
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
              <button type="button" @click="startTaskEdit(task)">Edit</button>
              <button type="button" @click="toggleTaskCompleted(task.id)">
                {{ task.completed ? 'Mark open' : 'Mark complete' }}
              </button>
              <button type="button" @click="toggleTaskArchived(task.id)">
                {{ task.archived ? 'Unarchive' : 'Archive' }}
              </button>
              <button type="button" class="danger" @click="deleteTask(task.id)">Delete</button>
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
            <label>
              Name
              <input v-model="createPriorityForm.name" required maxlength="128" />
            </label>
            <label>
              Sort
              <input v-model.number="createPriorityForm.sort" type="number" required />
            </label>
            <label>
              Tag
              <input v-model="createPriorityForm.tag" />
            </label>
            <button type="submit" :disabled="prioritiesStore.isMutating">Add priority</button>
          </form>

          <p v-if="prioritiesStore.isEmpty">No priorities available.</p>
          <div v-else class="mini-list">
            <article v-for="priority in prioritiesStore.items" :key="priority.id" class="card">
              <template v-if="editingPriorityId === priority.id">
                <label>
                  Name
                  <input v-model="editPriorityForm.name" required maxlength="128" />
                </label>
                <label>
                  Sort
                  <input v-model.number="editPriorityForm.sort" type="number" required />
                </label>
                <label>
                  Tag
                  <input v-model="editPriorityForm.tag" />
                </label>
                <div class="actions-row">
                  <button type="button" @click="submitPriorityEdit">Save</button>
                  <button type="button" class="secondary" @click="editingPriorityId = null">
                    Cancel
                  </button>
                </div>
              </template>

              <template v-else>
                <strong>{{ priority.name || 'Unnamed priority' }}</strong>
                <small>Sort: {{ priority.sort }}</small>
                <small v-if="priority.tag">Tag: {{ priority.tag }}</small>
                <div class="actions-row">
                  <button type="button" @click="startPriorityEdit(priority.id)">Edit</button>
                  <button type="button" class="danger" @click="deletePriority(priority.id)">
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
            <label>
              Name
              <input v-model="createCategoryForm.name" required maxlength="128" />
            </label>
            <label>
              Sort
              <input v-model.number="createCategoryForm.sort" type="number" required />
            </label>
            <label>
              Tag
              <input v-model="createCategoryForm.tag" />
            </label>
            <button type="submit" :disabled="categoriesStore.isMutating">Add category</button>
          </form>

          <p v-if="categoriesStore.isEmpty">No categories available.</p>
          <div v-else class="mini-list">
            <article v-for="category in categoriesStore.items" :key="category.id" class="card">
              <template v-if="editingCategoryId === category.id">
                <label>
                  Name
                  <input v-model="editCategoryForm.name" required maxlength="128" />
                </label>
                <label>
                  Sort
                  <input v-model.number="editCategoryForm.sort" type="number" required />
                </label>
                <label>
                  Tag
                  <input v-model="editCategoryForm.tag" />
                </label>
                <div class="actions-row">
                  <button type="button" @click="submitCategoryEdit">Save</button>
                  <button type="button" class="secondary" @click="editingCategoryId = null">
                    Cancel
                  </button>
                </div>
              </template>

              <template v-else>
                <strong>{{ category.name || 'Unnamed category' }}</strong>
                <small>Sort: {{ category.sort }}</small>
                <small v-if="category.tag">Tag: {{ category.tag }}</small>
                <div class="actions-row">
                  <button type="button" @click="startCategoryEdit(category.id)">Edit</button>
                  <button type="button" class="danger" @click="deleteCategory(category.id)">
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
}

.status.success {
  border: 1px solid #1d8143;
}

.status.error {
  border: 1px solid #b52a2a;
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 2fr minmax(240px, 320px);
  }
}
</style>
