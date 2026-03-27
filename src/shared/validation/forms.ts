import {
  email,
  maxLength,
  minLength,
  nonNegativeInteger,
  required,
  validDateTimeLocal,
} from '@/shared/validation/rules'

type FormErrors<TFields extends string> = Partial<Record<TFields, string>>

export interface LoginFormValues {
  email: string
  password: string
}

export interface RegisterFormValues extends LoginFormValues {
  firstName: string
  lastName: string
}

export interface TaskFormValues {
  name: string
  dueAtLocal: string
  categoryId: string
  priorityId: string
}

export interface TaxonomyFormValues {
  name: string
  sort: number
  tag: string
}

function pickFirstError(candidates: Array<string | null>): string | null {
  return candidates.find((candidate) => Boolean(candidate)) ?? null
}

export function validateLoginForm(values: LoginFormValues): FormErrors<'email' | 'password'> {
  const errors: FormErrors<'email' | 'password'> = {}

  const emailError = pickFirstError([required(values.email, 'Email'), email(values.email)])
  if (emailError) {
    errors.email = emailError
  }

  const passwordError = pickFirstError([
    required(values.password, 'Password'),
    minLength(values.password, 8, 'Password'),
  ])
  if (passwordError) {
    errors.password = passwordError
  }

  return errors
}

export function validateRegisterForm(
  values: RegisterFormValues,
): FormErrors<'email' | 'password' | 'firstName' | 'lastName'> {
  const loginErrors = validateLoginForm(values)
  const errors: FormErrors<'email' | 'password' | 'firstName' | 'lastName'> = {
    ...loginErrors,
  }

  const firstNameError = pickFirstError([
    required(values.firstName, 'First name'),
    maxLength(values.firstName, 128, 'First name'),
  ])
  if (firstNameError) {
    errors.firstName = firstNameError
  }

  const lastNameError = pickFirstError([
    required(values.lastName, 'Last name'),
    maxLength(values.lastName, 128, 'Last name'),
  ])
  if (lastNameError) {
    errors.lastName = lastNameError
  }

  return errors
}

export function validateTaskForm(
  values: TaskFormValues,
): FormErrors<'name' | 'dueAtLocal' | 'categoryId' | 'priorityId'> {
  const errors: FormErrors<'name' | 'dueAtLocal' | 'categoryId' | 'priorityId'> = {}

  const nameError = pickFirstError([
    required(values.name, 'Task name'),
    maxLength(values.name, 128, 'Task name'),
  ])
  if (nameError) {
    errors.name = nameError
  }

  const dueAtError = validDateTimeLocal(values.dueAtLocal, 'Due date')
  if (dueAtError) {
    errors.dueAtLocal = dueAtError
  }

  const priorityError = required(values.priorityId, 'Priority')
  if (priorityError) {
    errors.priorityId = priorityError
  }

  const categoryError = required(values.categoryId, 'Category')
  if (categoryError) {
    errors.categoryId = categoryError
  }

  return errors
}

export function validateTaxonomyForm(
  values: TaxonomyFormValues,
  entityLabel: 'Category' | 'Priority',
): FormErrors<'name' | 'sort' | 'tag'> {
  const errors: FormErrors<'name' | 'sort' | 'tag'> = {}

  const nameError = pickFirstError([
    required(values.name, `${entityLabel} name`),
    maxLength(values.name, 128, `${entityLabel} name`),
  ])
  if (nameError) {
    errors.name = nameError
  }

  const sortError = nonNegativeInteger(values.sort, `${entityLabel} sort`)
  if (sortError) {
    errors.sort = sortError
  }

  const tagError = maxLength(values.tag, 64, `${entityLabel} tag`)
  if (tagError) {
    errors.tag = tagError
  }

  return errors
}
