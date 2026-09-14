export function sanitizeInput(value) {
  return value.replace(/[<>]/g, '').trim()
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
