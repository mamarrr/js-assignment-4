import type { IsoDateTimeString, Uuid } from '@/shared/types/common'

export interface TodoCategoryDto {
  id: Uuid
  categoryName: string | null
  categorySort: number
  syncDt: IsoDateTimeString
  tag: string | null
}

export interface TodoCategoryCreateDto {
  id: Uuid
  categoryName: string | null
  categorySort: number
  tag: string | null
}

export interface TodoCategoryEditDto {
  id: Uuid
  categoryName: string | null
  categorySort: number
  tag: string | null
  syncDt: IsoDateTimeString | null
}
