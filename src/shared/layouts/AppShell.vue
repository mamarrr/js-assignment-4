<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { routeNames } from '@/router/route-names'

const authStore = useAuthStore()
const router = useRouter()

const fullName = computed(() => {
  return [authStore.firstName, authStore.lastName].filter(Boolean).join(' ').trim()
})

function logout(): void {
  authStore.logout()
  void router.push({ name: routeNames.login })
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <strong>Task Manager</strong>

      <nav class="links">
        <RouterLink :to="{ name: routeNames.dashboard }">Dashboard</RouterLink>
        <RouterLink :to="{ name: routeNames.login }">Login</RouterLink>
        <RouterLink :to="{ name: routeNames.register }">Register</RouterLink>
      </nav>

      <div class="session-tools">
        <span v-if="authStore.isAuthenticated">{{ fullName || 'Authenticated user' }}</span>
        <button v-if="authStore.isAuthenticated" type="button" @click="logout">Logout</button>
      </div>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
}

.topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

.links,
.session-tools {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.content {
  width: min(1200px, 100%);
  margin: 0 auto;
  padding: 1.25rem;
}

a {
  text-decoration: none;
  color: var(--color-heading);
}

a.router-link-active {
  font-weight: 600;
}

button {
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text);
  border-radius: 8px;
  padding: 0.35rem 0.75rem;
  cursor: pointer;
}
</style>
