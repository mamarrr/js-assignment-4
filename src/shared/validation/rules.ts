export type ValidationMessage = string

export function isBlank(value: string | null | undefined): boolean {
  return !value || !value.trim()
}

export function required(value: string, fieldLabel: string): ValidationMessage | null {
  if (isBlank(value)) {
    return `${fieldLabel} is required.`
  }

  return null
}

export function maxLength(
  value: string,
  max: number,
  fieldLabel: string,
): ValidationMessage | null {
  if (value.length > max) {
    return `${fieldLabel} must be at most ${max} characters.`
  }

  return null
}

export function minLength(
  value: string,
  min: number,
  fieldLabel: string,
): ValidationMessage | null {
  if (value.length < min) {
    return `${fieldLabel} must be at least ${min} characters.`
  }

  return null
}

export function email(value: string): ValidationMessage | null {
  const normalized = value.trim()
  if (!normalized) {
    return null
  }

  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!pattern.test(normalized)) {
    return 'Enter a valid email address.'
  }

  return null
}

export function nonNegativeInteger(value: number, fieldLabel: string): ValidationMessage | null {
  if (!Number.isInteger(value) || value < 0) {
    return `${fieldLabel} must be a whole number 0 or greater.`
  }

  return null
}

export function validDateTimeLocal(value: string, fieldLabel: string): ValidationMessage | null {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return `${fieldLabel} must be a valid date and time.`
  }

  return null
}
