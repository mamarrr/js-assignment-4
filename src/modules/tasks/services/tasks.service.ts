import { apiEndpoints, resolveEndpointPath } from '@/core/api/endpoints'
import { apiClient } from '@/core/api/http-client'
import {
  mapTaskCreateInputToDto,
  mapTaskDtoToModel,
  mapTaskModelToUpdateDto,
} from '@/modules/tasks/types/task.mapper'
import type {
  TodoTaskCreateDto,
  TodoTaskDto,
  TodoTaskUpdateDto,
} from '@/modules/tasks/types/task.dto'
import type { TodoTaskCreateInput, TodoTaskModel } from '@/modules/tasks/types/task.model'
import type { Uuid } from '@/shared/types/common'

export const tasksService = {
  async list(): Promise<TodoTaskModel[]> {
    const response = await apiClient.request<TodoTaskDto[]>({
      method: apiEndpoints.tasks.list.method,
      path: apiEndpoints.tasks.list.path,
      requiresAuth: apiEndpoints.tasks.list.requiresAuth,
    })

    return response.map(mapTaskDtoToModel)
  },

  async getById(id: Uuid): Promise<TodoTaskModel> {
    const response = await apiClient.request<TodoTaskDto>({
      method: apiEndpoints.tasks.getById.method,
      path: resolveEndpointPath(apiEndpoints.tasks.getById.path, { id }),
      requiresAuth: apiEndpoints.tasks.getById.requiresAuth,
    })

    return mapTaskDtoToModel(response)
  },

  async create(payload: TodoTaskCreateInput): Promise<TodoTaskModel> {
    const body = mapTaskCreateInputToDto(payload)
    const response = await apiClient.request<TodoTaskDto, TodoTaskCreateDto>({
      method: apiEndpoints.tasks.create.method,
      path: apiEndpoints.tasks.create.path,
      body,
      requiresAuth: apiEndpoints.tasks.create.requiresAuth,
    })

    return mapTaskDtoToModel(response)
  },

  async update(payload: TodoTaskModel): Promise<TodoTaskModel> {
    const body = mapTaskModelToUpdateDto(payload)
    const response = await apiClient.request<TodoTaskDto, TodoTaskUpdateDto>({
      method: apiEndpoints.tasks.updateById.method,
      path: resolveEndpointPath(apiEndpoints.tasks.updateById.path, { id: payload.id }),
      body,
      requiresAuth: apiEndpoints.tasks.updateById.requiresAuth,
    })

    return mapTaskDtoToModel(response)
  },

  deleteById(id: Uuid): Promise<void> {
    return apiClient.request<void>({
      method: apiEndpoints.tasks.deleteById.method,
      path: resolveEndpointPath(apiEndpoints.tasks.deleteById.path, { id }),
      requiresAuth: apiEndpoints.tasks.deleteById.requiresAuth,
    })
  },
}
