import type { RouteRecordRaw } from 'vue-router'

import { routeNames } from '@/router/route-names'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: { name: routeNames.dashboard },
  },
  {
    path: '/login',
    name: routeNames.login,
    component: () => import('@/modules/auth/views/LoginView.vue'),
    meta: {
      guestOnly: true,
    },
  },
  {
    path: '/register',
    name: routeNames.register,
    component: () => import('@/modules/auth/views/RegisterView.vue'),
    meta: {
      guestOnly: true,
    },
  },
  {
    path: '/dashboard',
    name: routeNames.dashboard,
    component: () => import('@/modules/tasks/views/DashboardView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
]
