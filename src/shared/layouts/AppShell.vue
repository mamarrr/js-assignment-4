<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { routeNames } from '@/router/route-names'
import { useFeedbackStore } from '@/stores/feedback.store'

const authStore = useAuthStore()
const feedbackStore = useFeedbackStore()
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
      <div
        v-if="feedbackStore.items.length"
        class="feedback-stack"
        role="status"
        aria-live="polite"
      >
        <article
          v-for="item in feedbackStore.items"
          :key="item.id"
          class="feedback-item"
          :class="`feedback-${item.type}`"
        >
          <span>{{ item.message }}</span>
          <button type="button" class="feedback-close" @click="feedbackStore.dismiss(item.id)">
            ×
          </button>
        </article>
      </div>

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
  position: relative;
  width: min(1200px, 100%);
  margin: 0 auto;
  padding: 1.25rem;
}

.feedback-stack {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  width: min(360px, calc(100vw - 2rem));
  display: grid;
  gap: 0.5rem;
}

.feedback-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-soft);
  padding: 0.6rem 0.75rem;
}

.feedback-success {
  border-color: #2d9a54;
}

.feedback-error {
  border-color: #b64040;
}

.feedback-info {
  border-color: #447ab4;
}

.feedback-close {
  border: 0;
  background: transparent;
  padding: 0;
  line-height: 1;
  cursor: pointer;
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
