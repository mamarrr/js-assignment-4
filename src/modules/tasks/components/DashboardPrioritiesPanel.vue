<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

import { usePrioritiesStore } from '@/modules/priorities/stores/priorities.store'
import { toAppErrorMessage } from '@/shared/utils/error-message'
import { validateTaxonomyForm, type TaxonomyFormValues } from '@/shared/validation/forms'
import { useFeedbackStore } from '@/stores/feedback.store'

type TaxonomyFormErrors = ReturnType<typeof validateTaxonomyForm>

const prioritiesStore = usePrioritiesStore()
const feedbackStore = useFeedbackStore()

const editingPriorityId = ref<string | null>(null)

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

const createPriorityErrors = reactive<TaxonomyFormErrors>({})
const editPriorityErrors = reactive<TaxonomyFormErrors>({})

function getNextPrioritySort(): number {
  return prioritiesStore.items.reduce((maxSort, item) => Math.max(maxSort, item.sort), 0) + 1
}

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

function validateCreatePriorityInline(): void {
  applyFormErrors(createPriorityErrors, validateTaxonomyForm(createPriorityForm, 'Priority'))
}

function validateEditPriorityInline(): void {
  applyFormErrors(editPriorityErrors, validateTaxonomyForm(editPriorityForm, 'Priority'))
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

watch(
  () => prioritiesStore.items,
  (items) => {
    if (!createPriorityForm.sort && items.length > 0) {
      createPriorityForm.sort = getNextPrioritySort()
    }
  },
  { immediate: true },
)
</script>

<template>
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
      <p v-if="!prioritiesStore.isLoading && prioritiesStore.errorMessage" class="status error">
        {{ prioritiesStore.errorMessage }}
      </p>
      <p v-if="!prioritiesStore.isLoading && prioritiesStore.isEmpty" class="status empty">
        No priorities available.
      </p>

      <div v-if="!prioritiesStore.isLoading && !prioritiesStore.isEmpty" class="mini-list">
        <article v-for="priority in prioritiesStore.items" :key="priority.id" class="card">
          <template v-if="editingPriorityId === priority.id">
            <label>
              Name
              <input
                v-model="editPriorityForm.name"
                maxlength="128"
                @blur="validateEditPriorityInline"
              />
              <small v-if="editPriorityErrors.name" class="field-error">{{
                editPriorityErrors.name
              }}</small>
            </label>
            <label>
              Sort
              <input
                v-model.number="editPriorityForm.sort"
                type="number"
                @blur="validateEditPriorityInline"
              />
              <small v-if="editPriorityErrors.sort" class="field-error">{{
                editPriorityErrors.sort
              }}</small>
            </label>
            <label>
              Tag
              <input
                v-model="editPriorityForm.tag"
                maxlength="64"
                @blur="validateEditPriorityInline"
              />
              <small v-if="editPriorityErrors.tag" class="field-error">{{
                editPriorityErrors.tag
              }}</small>
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
</template>

<style scoped>
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

.mini-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
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
