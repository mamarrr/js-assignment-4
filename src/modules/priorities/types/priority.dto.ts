import type { IsoDateTimeString, Uuid } from '@/shared/types/common'

export interface TodoPriorityDto {
  id: Uuid
  appUserId: Uuid
  priorityName: string | null
  prioritySort: number
  syncDt: IsoDateTimeString
  tag: string | null
}

export interface TodoPriorityCreateDto {
  id: Uuid
  priorityName: string | null
  prioritySort: number
  tag: string | null
}

export interface TodoPriorityUpdateDto {
  id: Uuid
  appUserId: Uuid
  priorityName: string | null
  prioritySort: number
  syncDt: IsoDateTimeString | null
  tag: string | null
}
