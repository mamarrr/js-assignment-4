import { apiEndpoints, resolveEndpointPath } from '@/core/api/endpoints'
import { apiClient } from '@/core/api/http-client'
import {
  mapPriorityCreateInputToDto,
  mapPriorityDtoToModel,
  mapPriorityModelToUpdateDto,
} from '@/modules/priorities/types/priority.mapper'
import type {
  TodoPriorityCreateDto,
  TodoPriorityDto,
  TodoPriorityUpdateDto,
} from '@/modules/priorities/types/priority.dto'
import type {
  TodoPriorityCreateInput,
  TodoPriorityModel,
} from '@/modules/priorities/types/priority.model'
import type { Uuid } from '@/shared/types/common'

export const prioritiesService = {
  async list(): Promise<TodoPriorityModel[]> {
    const response = await apiClient.request<TodoPriorityDto[]>({
      method: apiEndpoints.priorities.list.method,
      path: apiEndpoints.priorities.list.path,
      requiresAuth: apiEndpoints.priorities.list.requiresAuth,
    })

    return response.map(mapPriorityDtoToModel)
  },

  async getById(id: Uuid): Promise<TodoPriorityModel> {
    const response = await apiClient.request<TodoPriorityDto>({
      method: apiEndpoints.priorities.getById.method,
      path: resolveEndpointPath(apiEndpoints.priorities.getById.path, { id }),
      requiresAuth: apiEndpoints.priorities.getById.requiresAuth,
    })

    return mapPriorityDtoToModel(response)
  },

  async create(payload: TodoPriorityCreateInput): Promise<TodoPriorityModel> {
    const body = mapPriorityCreateInputToDto(payload)
    const response = await apiClient.request<TodoPriorityDto, TodoPriorityCreateDto>({
      method: apiEndpoints.priorities.create.method,
      path: apiEndpoints.priorities.create.path,
      body,
      requiresAuth: apiEndpoints.priorities.create.requiresAuth,
    })

    return mapPriorityDtoToModel(response)
  },

  async update(payload: TodoPriorityModel): Promise<void> {
    const body = mapPriorityModelToUpdateDto(payload)
    await apiClient.request<void, TodoPriorityUpdateDto>({
      method: apiEndpoints.priorities.updateById.method,
      path: resolveEndpointPath(apiEndpoints.priorities.updateById.path, { id: payload.id }),
      body,
      requiresAuth: apiEndpoints.priorities.updateById.requiresAuth,
    })
  },

  deleteById(id: Uuid): Promise<void> {
    return apiClient.request<void>({
      method: apiEndpoints.priorities.deleteById.method,
      path: resolveEndpointPath(apiEndpoints.priorities.deleteById.path, { id }),
      requiresAuth: apiEndpoints.priorities.deleteById.requiresAuth,
    })
  },
}
