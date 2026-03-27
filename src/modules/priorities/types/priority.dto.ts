import type { IsoDateTimeString, Uuid } from '@/shared/types/common'

export interface TodoPriorityDto {
  id: Uuid
  appUserId: Uuid
  priorityName: string | null
  prioritySort: number
  syncDt: IsoDateTimeString
  tag: string | null
}
