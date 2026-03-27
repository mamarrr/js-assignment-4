import { apiEndpoints, type AuthRequestQuery } from '@/core/api/endpoints'
import { apiClient } from '@/core/api/http-client'
import type {
  JwtResponseDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
} from '@/modules/auth/types/auth.dto'

export const authService = {
  login(payload: LoginRequestDto, query?: AuthRequestQuery): Promise<JwtResponseDto> {
    return apiClient.request<JwtResponseDto, LoginRequestDto>({
      method: apiEndpoints.auth.login.method,
      path: apiEndpoints.auth.login.path,
      query,
      body: payload,
      requiresAuth: apiEndpoints.auth.login.requiresAuth,
    })
  },

  register(payload: RegisterRequestDto, query?: AuthRequestQuery): Promise<JwtResponseDto> {
    return apiClient.request<JwtResponseDto, RegisterRequestDto>({
      method: apiEndpoints.auth.register.method,
      path: apiEndpoints.auth.register.path,
      query,
      body: payload,
      requiresAuth: apiEndpoints.auth.register.requiresAuth,
    })
  },

  refreshToken(payload: RefreshTokenRequestDto, query?: AuthRequestQuery): Promise<JwtResponseDto> {
    return apiClient.request<JwtResponseDto, RefreshTokenRequestDto>({
      method: apiEndpoints.auth.refreshToken.method,
      path: apiEndpoints.auth.refreshToken.path,
      query,
      body: payload,
      requiresAuth: apiEndpoints.auth.refreshToken.requiresAuth,
    })
  },
}
