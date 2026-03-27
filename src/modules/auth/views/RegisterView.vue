<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { routeNames } from '@/router/route-names'
import { validateRegisterForm } from '@/shared/validation/forms'
import { useFeedbackStore } from '@/stores/feedback.store'

type RegisterFormErrors = ReturnType<typeof validateRegisterForm>

const authStore = useAuthStore()
const feedbackStore = useFeedbackStore()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
})

const errors = reactive<RegisterFormErrors>({})

function applyValidation(next: RegisterFormErrors): boolean {
  for (const key of Object.keys(errors)) {
    delete errors[key as keyof RegisterFormErrors]
  }

  Object.assign(errors, next)
  return Object.keys(next).length === 0
}

function validateInline(): void {
  applyValidation(validateRegisterForm(form))
}

async function submit(): Promise<void> {
  if (!applyValidation(validateRegisterForm(form))) {
    feedbackStore.error('Please correct the highlighted fields before submitting.')
    return
  }

  try {
    await authStore.register({
      email: form.email.trim(),
      password: form.password,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
    })

    feedbackStore.success('Registration completed successfully.')
    await router.push({ name: routeNames.dashboard })
  } catch {
    feedbackStore.error(authStore.errorMessage || 'Unable to register right now.')
  }
}
</script>

<template>
  <section class="auth-view">
    <h1>Register</h1>
    <p class="status info">Create a new account to start managing tasks.</p>

    <p v-if="authStore.errorMessage" class="status error">{{ authStore.errorMessage }}</p>

    <form class="auth-form" @submit.prevent="submit">
      <fieldset :disabled="authStore.isLoading">
        <label>
          First name
          <input v-model="form.firstName" autocomplete="given-name" @blur="validateInline" />
          <small v-if="errors.firstName" class="field-error">{{ errors.firstName }}</small>
        </label>

        <label>
          Last name
          <input v-model="form.lastName" autocomplete="family-name" @blur="validateInline" />
          <small v-if="errors.lastName" class="field-error">{{ errors.lastName }}</small>
        </label>

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
            autocomplete="new-password"
            @blur="validateInline"
          />
          <small v-if="errors.password" class="field-error">{{ errors.password }}</small>
        </label>

        <button type="submit">
          {{ authStore.isLoading ? 'Creating account...' : 'Register' }}
        </button>
      </fieldset>
    </form>
  </section>
</template>

<style scoped>
.auth-view {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
  max-width: 520px;
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
