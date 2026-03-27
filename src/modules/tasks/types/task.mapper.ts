import type { IsoDateTimeString } from '@/shared/types/common'
import type {
  TodoTaskCreateDto,
  TodoTaskDto,
  TodoTaskUpdateDto,
} from '@/modules/tasks/types/task.dto'
import type { TodoTaskCreateInput, TodoTaskModel } from '@/modules/tasks/types/task.model'

function normalizeText(value: string | null | undefined): string {
  return (value ?? '').trim()
}

function normalizeNullableText(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function normalizeDate(value: string | null | undefined): IsoDateTimeString | null {
  if (!value) {
    return null
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString()
}

function normalizeRequiredDate(value: string | null | undefined): IsoDateTimeString {
  return normalizeDate(value) ?? new Date().toISOString()
}

export function mapTaskDtoToModel(dto: TodoTaskDto): TodoTaskModel {
  return {
    id: dto.id,
    name: normalizeText(dto.taskName),
    sort: dto.taskSort,
    createdAt: normalizeRequiredDate(dto.createdDt),
    dueAt: normalizeDate(dto.dueDt),
    completed: dto.isCompleted,
    archived: dto.isArchived,
    categoryId: dto.todoCategoryId,
    priorityId: dto.todoPriorityId,
    syncAt: normalizeRequiredDate(dto.syncDt),
  }
}

export function mapTaskCreateInputToDto(input: TodoTaskCreateInput): TodoTaskCreateDto {
  return {
    id: crypto.randomUUID(),
    taskName: normalizeNullableText(input.name),
    taskSort: input.sort,
    createdDt: new Date().toISOString(),
    dueDt: normalizeDate(input.dueAt),
    isCompleted: input.completed,
    isArchived: input.archived,
    todoCategoryId: input.categoryId,
    todoPriorityId: input.priorityId,
  }
}

export function mapTaskModelToUpdateDto(model: TodoTaskModel): TodoTaskUpdateDto {
  return {
    id: model.id,
    taskName: normalizeNullableText(model.name),
    taskSort: model.sort,
    createdDt: normalizeRequiredDate(model.createdAt),
    dueDt: normalizeDate(model.dueAt),
    isCompleted: model.completed,
    isArchived: model.archived,
    todoCategoryId: model.categoryId,
    todoPriorityId: model.priorityId,
    syncDt: normalizeDate(model.syncAt),
  }
}
