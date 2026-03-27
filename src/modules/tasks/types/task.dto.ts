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
