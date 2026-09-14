import { sanitizeInput, isValidEmail } from './validation'

test('sanitizeInput trims and strips angle brackets', () => {
  expect(sanitizeInput('  <script>hi</script>  ')).toBe('scripthi/script')
})

test('sanitizeInput leaves normal text untouched', () => {
  expect(sanitizeInput('Mehdi Qasimov')).toBe('Mehdi Qasimov')
})

test('isValidEmail accepts a normal address', () => {
  expect(isValidEmail('someone@example.com')).toBe(true)
})

test('isValidEmail rejects a string without an @', () => {
  expect(isValidEmail('someone.example.com')).toBe(false)
})

test('isValidEmail rejects a string without a domain dot', () => {
  expect(isValidEmail('someone@example')).toBe(false)
})
