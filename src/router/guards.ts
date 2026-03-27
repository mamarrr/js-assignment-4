import type { Router } from 'vue-router'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { routeNames } from '@/router/route-names'

export function registerRouterGuards(router: Router): void {
  router.beforeEach((to) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return { name: routeNames.login }
    }

    if (to.meta.guestOnly && authStore.isAuthenticated) {
      return { name: routeNames.dashboard }
    }

    return true
  })
}
