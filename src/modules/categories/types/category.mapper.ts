import type { IsoDateTimeString } from '@/shared/types/common'
import type {
  TodoCategoryCreateDto,
  TodoCategoryDto,
  TodoCategoryEditDto,
} from '@/modules/categories/types/category.dto'
import type {
  TodoCategoryCreateInput,
  TodoCategoryModel,
} from '@/modules/categories/types/category.model'

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

export function mapCategoryDtoToModel(dto: TodoCategoryDto): TodoCategoryModel {
  return {
    id: dto.id,
    name: normalizeText(dto.categoryName),
    sort: dto.categorySort,
    syncAt: normalizeRequiredDate(dto.syncDt),
    tag: normalizeText(dto.tag),
  }
}

export function mapCategoryCreateInputToDto(input: TodoCategoryCreateInput): TodoCategoryCreateDto {
  return {
    id: crypto.randomUUID(),
    categoryName: normalizeNullableText(input.name),
    categorySort: input.sort,
    tag: normalizeNullableText(input.tag),
  }
}

export function mapCategoryModelToEditDto(model: TodoCategoryModel): TodoCategoryEditDto {
  return {
    id: model.id,
    categoryName: normalizeNullableText(model.name),
    categorySort: model.sort,
    tag: normalizeNullableText(model.tag),
    syncDt: normalizeDate(model.syncAt),
  }
}
