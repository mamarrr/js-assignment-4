import type { Router } from 'vue-router'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { routeNames } from '@/router/route-names'

export function registerRouterGuards(router: Router): void {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth) {
      const hasSession = await authStore.ensureAuthenticated()

      if (!hasSession) {
        return { name: routeNames.login }
      }
    }

    if (to.meta.guestOnly) {
      const hasSession = await authStore.ensureAuthenticated()

      if (hasSession) {
        return { name: routeNames.dashboard }
      }
    }

    return true
  })
}
