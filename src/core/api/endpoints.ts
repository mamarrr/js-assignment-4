import type { ApiEndpoint } from '@/core/api/types'
import type {
  JwtResponseDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
} from '@/modules/auth/types/auth.dto'
import type {
  TodoCategoryCreateDto,
  TodoCategoryDto,
  TodoCategoryEditDto,
} from '@/modules/categories/types/category.dto'
import type { TodoPriorityDto } from '@/modules/priorities/types/priority.dto'
import type { TodoTaskDto } from '@/modules/tasks/types/task.dto'

interface AuthQueryDto extends Record<string, string | number | boolean | null | undefined> {
  expiresInSeconds?: number
}

export const apiEndpoints = {
  auth: {
    login: {
      method: 'POST',
      path: '/Account/Login',
      requiresAuth: false,
    } satisfies ApiEndpoint<LoginRequestDto, JwtResponseDto>,
    register: {
      method: 'POST',
      path: '/Account/Register',
      requiresAuth: false,
    } satisfies ApiEndpoint<RegisterRequestDto, JwtResponseDto>,
    refreshToken: {
      method: 'POST',
      path: '/Account/RefreshToken',
      requiresAuth: false,
    } satisfies ApiEndpoint<RefreshTokenRequestDto, JwtResponseDto>,
  },
  tasks: {
    list: {
      method: 'GET',
      path: '/TodoTasks',
      requiresAuth: true,
    } satisfies ApiEndpoint<never, TodoTaskDto[]>,
    create: {
      method: 'POST',
      path: '/TodoTasks',
      requiresAuth: true,
    } satisfies ApiEndpoint<TodoTaskDto, TodoTaskDto>,
    getById: {
      method: 'GET',
      path: '/TodoTasks/{id}',
      requiresAuth: true,
    } satisfies ApiEndpoint<never, TodoTaskDto>,
    updateById: {
      method: 'PUT',
      path: '/TodoTasks/{id}',
      requiresAuth: true,
    } satisfies ApiEndpoint<TodoTaskDto, TodoTaskDto>,
    deleteById: {
      method: 'DELETE',
      path: '/TodoTasks/{id}',
      requiresAuth: true,
    } satisfies ApiEndpoint<never, void>,
  },
  priorities: {
    list: {
      method: 'GET',
      path: '/TodoPriorities',
      requiresAuth: true,
    } satisfies ApiEndpoint<never, TodoPriorityDto[]>,
    create: {
      method: 'POST',
      path: '/TodoPriorities',
      requiresAuth: true,
    } satisfies ApiEndpoint<TodoPriorityDto, TodoPriorityDto>,
    getById: {
      method: 'GET',
      path: '/TodoPriorities/{id}',
      requiresAuth: true,
    } satisfies ApiEndpoint<never, TodoPriorityDto>,
    updateById: {
      method: 'PUT',
      path: '/TodoPriorities/{id}',
      requiresAuth: true,
    } satisfies ApiEndpoint<TodoPriorityDto, void>,
    deleteById: {
      method: 'DELETE',
      path: '/TodoPriorities/{id}',
      requiresAuth: true,
    } satisfies ApiEndpoint<never, void>,
  },
  categories: {
    list: {
      method: 'GET',
      path: '/TodoCategories',
      requiresAuth: true,
    } satisfies ApiEndpoint<never, TodoCategoryDto[]>,
    create: {
      method: 'POST',
      path: '/TodoCategories',
      requiresAuth: true,
    } satisfies ApiEndpoint<TodoCategoryCreateDto, TodoCategoryDto>,
    getById: {
      method: 'GET',
      path: '/TodoCategories/{id}',
      requiresAuth: true,
    } satisfies ApiEndpoint<never, TodoCategoryDto>,
    updateById: {
      method: 'PUT',
      path: '/TodoCategories/{id}',
      requiresAuth: true,
    } satisfies ApiEndpoint<TodoCategoryEditDto, TodoCategoryDto>,
    deleteById: {
      method: 'DELETE',
      path: '/TodoCategories/{id}',
      requiresAuth: true,
    } satisfies ApiEndpoint<never, void>,
  },
} as const

export type AuthRequestQuery = AuthQueryDto

export function resolveEndpointPath(
  pathTemplate: string,
  pathParams?: Record<string, string>,
): string {
  if (!pathParams) {
    return pathTemplate
  }

  return Object.entries(pathParams).reduce((acc, [key, value]) => {
    return acc.replace(`{${key}}`, encodeURIComponent(value))
  }, pathTemplate)
}
