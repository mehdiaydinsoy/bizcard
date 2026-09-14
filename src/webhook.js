const WEBHOOK_URL = process.env.EXPO_PUBLIC_WEBHOOK_URL

export async function sendEvent(event, fields = {}) {
  if (!WEBHOOK_URL) return

  const payload = {
    event,
    source: 'bizcard',
    timestamp: new Date().toISOString(),
    ...fields,
  }

  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Webhook sorğusu uğursuz oldu: ${res.status}`)
  }
}
