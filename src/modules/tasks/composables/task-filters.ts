import type { TodoTaskModel } from '@/modules/tasks/types/task.model'

export type TaskCompletionFilter = 'all' | 'completed' | 'notCompleted'
export type TaskArchiveFilter = 'all' | 'active' | 'archived'

export interface TodoTaskFilterCriteria {
  globalText: string
  nameText: string
  descriptionText: string
  categoryIds: string[]
  includeNoCategory: boolean
  priorityIds: string[]
  includeNoPriority: boolean
  tags: string[]
  completion: TaskCompletionFilter
  archive: TaskArchiveFilter
  dueDateFrom: string | null
  dueDateTo: string | null
}

export type TaskFilterField = keyof TodoTaskFilterCriteria

export interface TaskFilterChip {
  key: string
  field: TaskFilterField
  label: string
}

const DEFAULT_TASK_FILTER_CRITERIA: Readonly<TodoTaskFilterCriteria> = {
  globalText: '',
  nameText: '',
  descriptionText: '',
  categoryIds: [],
  includeNoCategory: false,
  priorityIds: [],
  includeNoPriority: false,
  tags: [],
  completion: 'all',
  archive: 'all',
  dueDateFrom: null,
  dueDateTo: null,
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function toTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase()
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter((value) => value.length > 0)),
  ).sort((left, right) => left.localeCompare(right))
}

function normalizeDateBoundary(value: string | null, boundary: 'start' | 'end'): number | null {
  if (!value) {
    return null
  }

  const normalizedValue = value.trim()
  if (!normalizedValue) {
    return null
  }

  if (DATE_ONLY_PATTERN.test(normalizedValue)) {
    const [year, month, day] = normalizedValue.split('-').map(Number)
    if (!year || !month || !day) {
      return null
    }

    const date =
      boundary === 'start'
        ? new Date(year, month - 1, day, 0, 0, 0, 0)
        : new Date(year, month - 1, day, 23, 59, 59, 999)

    return Number.isNaN(date.getTime()) ? null : date.getTime()
  }

  const date = new Date(normalizedValue)
  return Number.isNaN(date.getTime()) ? null : date.getTime()
}

function toTaskDueAtTimestamp(task: TodoTaskModel): number | null {
  if (!task.dueAt) {
    return null
  }

  const date = new Date(task.dueAt)
  return Number.isNaN(date.getTime()) ? null : date.getTime()
}

function toTaskDescription(task: TodoTaskModel): string | null {
  const candidate = (task as TodoTaskModel & { description?: unknown }).description
  const normalized = toTrimmedString(candidate)
  return normalized || null
}

function toTaskTags(task: TodoTaskModel): string[] {
  const candidate = (task as TodoTaskModel & { tags?: unknown }).tags
  if (!Array.isArray(candidate)) {
    return []
  }

  return uniqueSorted(candidate.filter((tag): tag is string => typeof tag === 'string'))
}

function hasIdentifier(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function matchText(source: string, needle: string): boolean {
  return normalizeText(source).includes(needle)
}

function isCompletionMatch(task: TodoTaskModel, completion: TaskCompletionFilter): boolean {
  if (completion === 'completed') {
    return task.completed
  }

  if (completion === 'notCompleted') {
    return !task.completed
  }

  return true
}

function isArchiveMatch(task: TodoTaskModel, archive: TaskArchiveFilter): boolean {
  if (archive === 'active') {
    return !task.archived
  }

  if (archive === 'archived') {
    return task.archived
  }

  return true
}

function isCategoryMatch(task: TodoTaskModel, criteria: TodoTaskFilterCriteria): boolean {
  const hasSelectedCategories = criteria.categoryIds.length > 0
  if (!hasSelectedCategories && !criteria.includeNoCategory) {
    return true
  }

  const taskCategoryId = hasIdentifier(
    (task as TodoTaskModel & { categoryId?: unknown }).categoryId,
  )
    ? task.categoryId
    : null

  if (taskCategoryId) {
    return criteria.categoryIds.includes(taskCategoryId)
  }

  return criteria.includeNoCategory
}

function isPriorityMatch(task: TodoTaskModel, criteria: TodoTaskFilterCriteria): boolean {
  const hasSelectedPriorities = criteria.priorityIds.length > 0
  if (!hasSelectedPriorities && !criteria.includeNoPriority) {
    return true
  }

  const taskPriorityId = hasIdentifier(
    (task as TodoTaskModel & { priorityId?: unknown }).priorityId,
  )
    ? task.priorityId
    : null

  if (taskPriorityId) {
    return criteria.priorityIds.includes(taskPriorityId)
  }

  return criteria.includeNoPriority
}

function isDueDateMatch(task: TodoTaskModel, criteria: TodoTaskFilterCriteria): boolean {
  const fromTimestamp = normalizeDateBoundary(criteria.dueDateFrom, 'start')
  const toTimestamp = normalizeDateBoundary(criteria.dueDateTo, 'end')
  if (fromTimestamp === null && toTimestamp === null) {
    return true
  }

  const dueTimestamp = toTaskDueAtTimestamp(task)
  if (dueTimestamp === null) {
    return false
  }

  if (fromTimestamp !== null && dueTimestamp < fromTimestamp) {
    return false
  }

  if (toTimestamp !== null && dueTimestamp > toTimestamp) {
    return false
  }

  return true
}

function isTextMatch(task: TodoTaskModel, criteria: TodoTaskFilterCriteria): boolean {
  const globalNeedle = normalizeText(criteria.globalText)
  const nameNeedle = normalizeText(criteria.nameText)

  if (nameNeedle && !matchText(task.name, nameNeedle)) {
    return false
  }

  if (!globalNeedle) {
    return true
  }

  if (matchText(task.name, globalNeedle)) {
    return true
  }

  const description = toTaskDescription(task)
  if (description && matchText(description, globalNeedle)) {
    return true
  }

  const tags = toTaskTags(task)
  return tags.some((tag) => matchText(tag, globalNeedle))
}

function sanitizeCompletion(value: TodoTaskFilterCriteria['completion']): TaskCompletionFilter {
  if (value === 'completed' || value === 'notCompleted') {
    return value
  }

  return 'all'
}

function sanitizeArchive(value: TodoTaskFilterCriteria['archive']): TaskArchiveFilter {
  if (value === 'active' || value === 'archived') {
    return value
  }

  return 'all'
}

export function createDefaultTaskFilterCriteria(): TodoTaskFilterCriteria {
  return {
    ...DEFAULT_TASK_FILTER_CRITERIA,
    categoryIds: [],
    priorityIds: [],
    tags: [],
  }
}

export function mergeTaskFilterCriteria(
  current: TodoTaskFilterCriteria,
  patch: Partial<TodoTaskFilterCriteria>,
): TodoTaskFilterCriteria {
  return {
    ...current,
    ...patch,
    globalText: toTrimmedString(patch.globalText ?? current.globalText),
    nameText: toTrimmedString(patch.nameText ?? current.nameText),
    descriptionText: toTrimmedString(patch.descriptionText ?? current.descriptionText),
    categoryIds: uniqueSorted(patch.categoryIds ?? current.categoryIds),
    includeNoCategory: patch.includeNoCategory ?? current.includeNoCategory,
    priorityIds: uniqueSorted(patch.priorityIds ?? current.priorityIds),
    includeNoPriority: patch.includeNoPriority ?? current.includeNoPriority,
    tags: uniqueSorted(patch.tags ?? current.tags),
    completion: sanitizeCompletion(patch.completion ?? current.completion),
    archive: sanitizeArchive(patch.archive ?? current.archive),
    dueDateFrom: toTrimmedString(patch.dueDateFrom ?? current.dueDateFrom) || null,
    dueDateTo: toTrimmedString(patch.dueDateTo ?? current.dueDateTo) || null,
  }
}

export function clearTaskFilterField(
  current: TodoTaskFilterCriteria,
  field: TaskFilterField,
): TodoTaskFilterCriteria {
  const defaults = createDefaultTaskFilterCriteria()
  return {
    ...current,
    [field]: defaults[field],
  }
}

export function buildTaskFilterPredicate(
  criteria: TodoTaskFilterCriteria,
): (task: TodoTaskModel) => boolean {
  const normalizedCriteria = mergeTaskFilterCriteria(createDefaultTaskFilterCriteria(), criteria)

  return (task: TodoTaskModel): boolean => {
    if (!isArchiveMatch(task, normalizedCriteria.archive)) {
      return false
    }

    if (!isCompletionMatch(task, normalizedCriteria.completion)) {
      return false
    }

    if (!isCategoryMatch(task, normalizedCriteria)) {
      return false
    }

    if (!isPriorityMatch(task, normalizedCriteria)) {
      return false
    }

    if (!isDueDateMatch(task, normalizedCriteria)) {
      return false
    }

    if (!isTextMatch(task, normalizedCriteria)) {
      return false
    }

    return true
  }
}

export function applyTaskFilters(
  tasks: readonly TodoTaskModel[],
  criteria: TodoTaskFilterCriteria,
): TodoTaskModel[] {
  const predicate = buildTaskFilterPredicate(criteria)
  return tasks.filter(predicate)
}

export function getActiveTaskFilterCount(criteria: TodoTaskFilterCriteria): number {
  const normalized = mergeTaskFilterCriteria(createDefaultTaskFilterCriteria(), criteria)
  let count = 0

  if (normalized.globalText) {
    count += 1
  }

  if (normalized.nameText) {
    count += 1
  }

  if (normalized.categoryIds.length > 0) {
    count += 1
  }

  if (normalized.includeNoCategory) {
    count += 1
  }

  if (normalized.priorityIds.length > 0) {
    count += 1
  }

  if (normalized.includeNoPriority) {
    count += 1
  }

  if (normalized.completion !== 'all') {
    count += 1
  }

  if (normalized.archive !== 'all') {
    count += 1
  }

  if (normalized.dueDateFrom) {
    count += 1
  }

  if (normalized.dueDateTo) {
    count += 1
  }

  return count
}

export function buildActiveTaskFilterChips(criteria: TodoTaskFilterCriteria): TaskFilterChip[] {
  const normalized = mergeTaskFilterCriteria(createDefaultTaskFilterCriteria(), criteria)
  const chips: TaskFilterChip[] = []

  if (normalized.globalText) {
    chips.push({
      key: `globalText:${normalized.globalText}`,
      field: 'globalText',
      label: `Text: ${normalized.globalText}`,
    })
  }

  if (normalized.nameText) {
    chips.push({
      key: `nameText:${normalized.nameText}`,
      field: 'nameText',
      label: `Name: ${normalized.nameText}`,
    })
  }

  if (normalized.categoryIds.length > 0) {
    chips.push({
      key: `categoryIds:${normalized.categoryIds.join(',')}`,
      field: 'categoryIds',
      label: `Categories: ${normalized.categoryIds.length}`,
    })
  }

  if (normalized.includeNoCategory) {
    chips.push({
      key: 'includeNoCategory',
      field: 'includeNoCategory',
      label: 'No category',
    })
  }

  if (normalized.priorityIds.length > 0) {
    chips.push({
      key: `priorityIds:${normalized.priorityIds.join(',')}`,
      field: 'priorityIds',
      label: `Priorities: ${normalized.priorityIds.length}`,
    })
  }

  if (normalized.includeNoPriority) {
    chips.push({
      key: 'includeNoPriority',
      field: 'includeNoPriority',
      label: 'No priority',
    })
  }

  if (normalized.completion !== 'all') {
    chips.push({
      key: `completion:${normalized.completion}`,
      field: 'completion',
      label: `Completion: ${normalized.completion}`,
    })
  }

  if (normalized.archive !== 'all') {
    chips.push({
      key: `archive:${normalized.archive}`,
      field: 'archive',
      label: `Archive: ${normalized.archive}`,
    })
  }

  if (normalized.dueDateFrom) {
    chips.push({
      key: `dueDateFrom:${normalized.dueDateFrom}`,
      field: 'dueDateFrom',
      label: `Due from: ${normalized.dueDateFrom}`,
    })
  }

  if (normalized.dueDateTo) {
    chips.push({
      key: `dueDateTo:${normalized.dueDateTo}`,
      field: 'dueDateTo',
      label: `Due to: ${normalized.dueDateTo}`,
    })
  }

  return chips
}
