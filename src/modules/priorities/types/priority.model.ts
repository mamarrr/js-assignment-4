import type { IsoDateTimeString, Uuid } from '@/shared/types/common'

export interface TodoPriorityModel {
  id: Uuid
  appUserId: Uuid
  name: string
  sort: number
  syncAt: IsoDateTimeString
  tag: string
}

export interface TodoPriorityCreateInput {
  name: string
  sort: number
  tag: string
}

export interface TodoPriorityUpdateInput {
  name?: string
  sort?: number
  tag?: string
}
