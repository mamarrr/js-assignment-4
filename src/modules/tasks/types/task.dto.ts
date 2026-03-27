import type { IsoDateTimeString, Uuid } from '@/shared/types/common'

export interface TodoTaskDto {
  id: Uuid
  taskName: string | null
  taskSort: number
  createdDt: IsoDateTimeString
  dueDt: IsoDateTimeString | null
  isCompleted: boolean
  isArchived: boolean
  todoCategoryId: Uuid
  todoPriorityId: Uuid
  syncDt: IsoDateTimeString
}

export interface TodoTaskCreateDto {
  id: Uuid
  taskName: string | null
  taskSort: number
  createdDt: IsoDateTimeString
  dueDt: IsoDateTimeString | null
  isCompleted: boolean
  isArchived: boolean
  todoCategoryId: Uuid
  todoPriorityId: Uuid
}

export interface TodoTaskUpdateDto {
  id: Uuid
  taskName: string | null
  taskSort: number
  createdDt: IsoDateTimeString
  dueDt: IsoDateTimeString | null
  isCompleted: boolean
  isArchived: boolean
  todoCategoryId: Uuid
  todoPriorityId: Uuid
  syncDt: IsoDateTimeString | null
}
