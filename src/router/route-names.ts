export const routeNames = {
  login: 'login',
  register: 'register',
  dashboard: 'dashboard',
} as const

export type AppRouteName = (typeof routeNames)[keyof typeof routeNames]
