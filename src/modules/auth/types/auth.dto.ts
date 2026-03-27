export interface LoginRequestDto {
  email: string | null
  password: string | null
}

export interface RegisterRequestDto {
  email: string | null
  password: string | null
  firstName: string | null
  lastName: string | null
}

export interface RefreshTokenRequestDto {
  jwt: string | null
  refreshToken: string | null
}

export interface JwtResponseDto {
  token: string | null
  refreshToken: string | null
  firstName: string | null
  lastName: string | null
}
