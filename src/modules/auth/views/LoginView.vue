<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { routeNames } from '@/router/route-names'
import { validateLoginForm } from '@/shared/validation/forms'
import { useFeedbackStore } from '@/stores/feedback.store'

type LoginFormErrors = ReturnType<typeof validateLoginForm>

const authStore = useAuthStore()
const feedbackStore = useFeedbackStore()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive<LoginFormErrors>({})

function applyValidation(next: LoginFormErrors): boolean {
  for (const key of Object.keys(errors)) {
    delete errors[key as keyof LoginFormErrors]
  }

  Object.assign(errors, next)
  return Object.keys(next).length === 0
}

function validateInline(): void {
  applyValidation(validateLoginForm(form))
}

async function submit(): Promise<void> {
  if (!applyValidation(validateLoginForm(form))) {
    feedbackStore.error('Please correct the highlighted fields before submitting.')
    return
  }

  try {
    await authStore.login({
      email: form.email.trim(),
      password: form.password,
    })

    feedbackStore.success('Logged in successfully.')
    await router.push({ name: routeNames.dashboard })
  } catch {
    feedbackStore.error(authStore.errorMessage || 'Unable to log in right now.')
  }
}
</script>

<template>
  <div class="auth-page">
    <section class="auth-view">
      <h1>Login</h1>
      <p class="status info">Use your account credentials to continue.</p>

      <p v-if="authStore.errorMessage" class="status error">{{ authStore.errorMessage }}</p>

      <form class="auth-form" @submit.prevent="submit">
        <fieldset :disabled="authStore.isLoading">
          <label>
            Email
            <input v-model="form.email" type="email" autocomplete="email" @blur="validateInline" />
            <small v-if="errors.email" class="field-error">{{ errors.email }}</small>
          </label>

          <label>
            Password
            <input
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              @blur="validateInline"
            />
            <small v-if="errors.password" class="field-error">{{ errors.password }}</small>
          </label>

          <button type="submit">{{ authStore.isLoading ? 'Signing in...' : 'Login' }}</button>
        </fieldset>
      </form>
    </section>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - 9rem);
  display: grid;
  place-items: center;
  padding: 1rem 0;
}

.auth-view {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
  width: min(520px, 100%);
}

.auth-form {
  margin-top: 0.75rem;
}

fieldset {
  margin: 0;
  border: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

label {
  display: grid;
  gap: 0.35rem;
}

input,
button {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.5rem 0.65rem;
  background: var(--color-background);
  color: var(--color-text);
}

button {
  cursor: pointer;
}

.status {
  margin: 0.35rem 0;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.status.info {
  border-color: #447ab4;
}

.status.error {
  border-color: #b52a2a;
}

.field-error {
  color: #c23f3f;
}
</style>
