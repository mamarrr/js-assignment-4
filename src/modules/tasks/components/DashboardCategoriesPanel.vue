<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

import { useCategoriesStore } from '@/modules/categories/stores/categories.store'
import { toAppErrorMessage } from '@/shared/utils/error-message'
import { validateTaxonomyForm, type TaxonomyFormValues } from '@/shared/validation/forms'
import { useFeedbackStore } from '@/stores/feedback.store'

type TaxonomyFormErrors = ReturnType<typeof validateTaxonomyForm>

const categoriesStore = useCategoriesStore()
const feedbackStore = useFeedbackStore()

const editingCategoryId = ref<string | null>(null)

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

const createCategoryErrors = reactive<TaxonomyFormErrors>({})
const editCategoryErrors = reactive<TaxonomyFormErrors>({})

function getNextCategorySort(): number {
  return categoriesStore.items.reduce((maxSort, item) => Math.max(maxSort, item.sort), 0) + 1
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

function validateCreateCategoryInline(): void {
  applyFormErrors(createCategoryErrors, validateTaxonomyForm(createCategoryForm, 'Category'))
}

function validateEditCategoryInline(): void {
  applyFormErrors(editCategoryErrors, validateTaxonomyForm(editCategoryForm, 'Category'))
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

watch(
  () => categoriesStore.items,
  (items) => {
    if (!createCategoryForm.sort && items.length > 0) {
      createCategoryForm.sort = getNextCategorySort()
    }
  },
  { immediate: true },
)
</script>

<template>
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
      <p v-if="!categoriesStore.isLoading && categoriesStore.errorMessage" class="status error">
        {{ categoriesStore.errorMessage }}
      </p>
      <p v-if="!categoriesStore.isLoading && categoriesStore.isEmpty" class="status empty">
        No categories available.
      </p>

      <div v-if="!categoriesStore.isLoading && !categoriesStore.isEmpty" class="mini-list">
        <article v-for="category in categoriesStore.items" :key="category.id" class="card">
          <template v-if="editingCategoryId === category.id">
            <label>
              Name
              <input
                v-model="editCategoryForm.name"
                maxlength="128"
                @blur="validateEditCategoryInline"
              />
              <small v-if="editCategoryErrors.name" class="field-error">{{
                editCategoryErrors.name
              }}</small>
            </label>
            <label>
              Sort
              <input
                v-model.number="editCategoryForm.sort"
                type="number"
                @blur="validateEditCategoryInline"
              />
              <small v-if="editCategoryErrors.sort" class="field-error">{{
                editCategoryErrors.sort
              }}</small>
            </label>
            <label>
              Tag
              <input
                v-model="editCategoryForm.tag"
                maxlength="64"
                @blur="validateEditCategoryInline"
              />
              <small v-if="editCategoryErrors.tag" class="field-error">{{
                editCategoryErrors.tag
              }}</small>
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
