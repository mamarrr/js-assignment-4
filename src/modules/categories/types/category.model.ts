import type { IsoDateTimeString, Uuid } from '@/shared/types/common'

export interface TodoCategoryModel {
  id: Uuid
  name: string
  sort: number
  syncAt: IsoDateTimeString
  tag: string
}

export interface TodoCategoryCreateInput {
  name: string
  sort: number
  tag: string
}

export interface TodoCategoryUpdateInput {
  name?: string
  sort?: number
  tag?: string
}
