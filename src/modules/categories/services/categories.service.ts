import { apiEndpoints, resolveEndpointPath } from '@/core/api/endpoints'
import { apiClient } from '@/core/api/http-client'
import {
  mapCategoryCreateInputToDto,
  mapCategoryDtoToModel,
  mapCategoryModelToEditDto,
} from '@/modules/categories/types/category.mapper'
import type {
  TodoCategoryCreateDto,
  TodoCategoryDto,
  TodoCategoryEditDto,
} from '@/modules/categories/types/category.dto'
import type {
  TodoCategoryCreateInput,
  TodoCategoryModel,
} from '@/modules/categories/types/category.model'
import type { Uuid } from '@/shared/types/common'

export const categoriesService = {
  async list(): Promise<TodoCategoryModel[]> {
    const response = await apiClient.request<TodoCategoryDto[]>({
      method: apiEndpoints.categories.list.method,
      path: apiEndpoints.categories.list.path,
      requiresAuth: apiEndpoints.categories.list.requiresAuth,
    })

    return response.map(mapCategoryDtoToModel)
  },

  async getById(id: Uuid): Promise<TodoCategoryModel> {
    const response = await apiClient.request<TodoCategoryDto>({
      method: apiEndpoints.categories.getById.method,
      path: resolveEndpointPath(apiEndpoints.categories.getById.path, { id }),
      requiresAuth: apiEndpoints.categories.getById.requiresAuth,
    })

    return mapCategoryDtoToModel(response)
  },

  async create(payload: TodoCategoryCreateInput): Promise<TodoCategoryModel> {
    const body = mapCategoryCreateInputToDto(payload)
    const response = await apiClient.request<TodoCategoryDto, TodoCategoryCreateDto>({
      method: apiEndpoints.categories.create.method,
      path: apiEndpoints.categories.create.path,
      body,
      requiresAuth: apiEndpoints.categories.create.requiresAuth,
    })

    return mapCategoryDtoToModel(response)
  },

  async update(payload: TodoCategoryModel): Promise<TodoCategoryModel> {
    const body = mapCategoryModelToEditDto(payload)
    const response = await apiClient.request<TodoCategoryDto, TodoCategoryEditDto>({
      method: apiEndpoints.categories.updateById.method,
      path: resolveEndpointPath(apiEndpoints.categories.updateById.path, { id: payload.id }),
      body,
      requiresAuth: apiEndpoints.categories.updateById.requiresAuth,
    })

    return mapCategoryDtoToModel(response)
  },

  deleteById(id: Uuid): Promise<void> {
    return apiClient.request<void>({
      method: apiEndpoints.categories.deleteById.method,
      path: resolveEndpointPath(apiEndpoints.categories.deleteById.path, { id }),
      requiresAuth: apiEndpoints.categories.deleteById.requiresAuth,
    })
  },
}
