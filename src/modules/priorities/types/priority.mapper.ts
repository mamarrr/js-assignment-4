import type { IsoDateTimeString } from '@/shared/types/common'
import type {
  TodoPriorityCreateDto,
  TodoPriorityDto,
  TodoPriorityUpdateDto,
} from '@/modules/priorities/types/priority.dto'
import type {
  TodoPriorityCreateInput,
  TodoPriorityModel,
} from '@/modules/priorities/types/priority.model'

const EMPTY_UUID = '00000000-0000-0000-0000-000000000000'

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

export function mapPriorityDtoToModel(dto: TodoPriorityDto): TodoPriorityModel {
  return {
    id: dto.id,
    appUserId: dto.appUserId ?? EMPTY_UUID,
    name: normalizeText(dto.priorityName),
    sort: dto.prioritySort,
    syncAt: normalizeRequiredDate(dto.syncDt),
    tag: normalizeText(dto.tag),
  }
}

export function mapPriorityCreateInputToDto(input: TodoPriorityCreateInput): TodoPriorityCreateDto {
  return {
    id: crypto.randomUUID(),
    priorityName: normalizeNullableText(input.name),
    prioritySort: input.sort,
    tag: normalizeNullableText(input.tag),
  }
}

export function mapPriorityModelToUpdateDto(model: TodoPriorityModel): TodoPriorityUpdateDto {
  return {
    id: model.id,
    appUserId: model.appUserId || EMPTY_UUID,
    priorityName: normalizeNullableText(model.name),
    prioritySort: model.sort,
    syncDt: normalizeDate(model.syncAt),
    tag: normalizeNullableText(model.tag),
  }
}
