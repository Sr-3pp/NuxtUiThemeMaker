export function toIsoDate(value: unknown, fallback = new Date(0).toISOString()) {
  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'string') {
    return value
  }

  return fallback
}

export function toNullableIsoDate(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'string') {
    return value
  }

  return null
}
