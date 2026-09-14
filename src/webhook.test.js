const ORIGINAL_ENV = process.env

beforeEach(() => {
  jest.resetModules()
  process.env = { ...ORIGINAL_ENV, EXPO_PUBLIC_WEBHOOK_URL: 'https://example.com/hook' }
  global.fetch = jest.fn()
})

afterEach(() => {
  process.env = ORIGINAL_ENV
})

test('posts the event payload to the configured webhook URL', async () => {
  global.fetch.mockResolvedValue({ ok: true })
  const { sendEvent } = require('./webhook')

  await sendEvent('card_saved', { name: 'Mehdi Qasimov' })

  expect(global.fetch).toHaveBeenCalledWith(
    'https://example.com/hook',
    expect.objectContaining({ method: 'POST' })
  )
  const body = JSON.parse(global.fetch.mock.calls[0][1].body)
  expect(body).toEqual(
    expect.objectContaining({ event: 'card_saved', source: 'bizcard', name: 'Mehdi Qasimov' })
  )
})

test('throws when the webhook responds with a non-ok status', async () => {
  global.fetch.mockResolvedValue({ ok: false, status: 500 })
  const { sendEvent } = require('./webhook')

  await expect(sendEvent('card_saved')).rejects.toThrow('500')
})

test('does nothing when no webhook URL is configured', async () => {
  process.env = { ...ORIGINAL_ENV, EXPO_PUBLIC_WEBHOOK_URL: '' }
  jest.resetModules()
  const { sendEvent } = require('./webhook')

  await sendEvent('card_saved')

  expect(global.fetch).not.toHaveBeenCalled()
})
