import type { IsoDateTimeString, Uuid } from '@/shared/types/common'

export interface TodoTaskModel {
  id: Uuid
  name: string
  sort: number
  createdAt: IsoDateTimeString
  dueAt: IsoDateTimeString | null
  completed: boolean
  archived: boolean
  categoryId: Uuid
  priorityId: Uuid
  syncAt: IsoDateTimeString
}

export interface TodoTaskCreateInput {
  name: string
  sort: number
  dueAt: IsoDateTimeString | null
  completed: boolean
  archived: boolean
  categoryId: Uuid
  priorityId: Uuid
}

export type TodoTaskUpdateInput = Partial<
  Omit<TodoTaskCreateInput, 'categoryId' | 'priorityId'>
> & {
  categoryId?: Uuid
  priorityId?: Uuid
}
