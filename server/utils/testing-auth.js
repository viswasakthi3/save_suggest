import { createHmac, timingSafeEqual } from 'node:crypto'

export const TESTING_COOKIE_NAME = 'testing_admin_session'

const SESSION_TTL_SECONDS = 60 * 60 * 8

function getSessionSecret() {
  return (
    process.env.TESTING_SESSION_SECRET ||
    process.env.JWT_SECRET_KEY ||
    process.env.SECRET_KEY ||
    'local-testing-session-secret'
  )
}

function signSession(username, expiresAt) {
  return createHmac('sha256', getSessionSecret())
    .update(`${username}.${expiresAt}`)
    .digest('hex')
}

function constantEqual(left, right) {
  const leftBuffer = Buffer.from(String(left))
  const rightBuffer = Buffer.from(String(right))

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

export function validateTestingCredentials(username, password) {
  const expectedUsername = process.env.TESTING_ADMIN_USERNAME
  const expectedPassword = process.env.TESTING_ADMIN_PASSWORD

  if (!expectedUsername || !expectedPassword) {
    return { ok: false, reason: 'not_configured' }
  }

  const usernameOk = constantEqual(username || '', expectedUsername)
  const passwordOk = constantEqual(password || '', expectedPassword)

  return { ok: usernameOk && passwordOk, reason: 'invalid_credentials' }
}

export function createTestingSession(username) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const signature = signSession(username, expiresAt)

  return `${encodeURIComponent(username)}.${expiresAt}.${signature}`
}

export function verifyTestingSession(value) {
  if (!value) {
    return false
  }

  const parts = String(value).split('.')
  if (parts.length !== 3) {
    return false
  }

  const [encodedUsername, expiresAtRaw, signature] = parts
  const expiresAt = Number(expiresAtRaw)
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return false
  }

  const username = decodeURIComponent(encodedUsername)
  const expectedSignature = signSession(username, expiresAt)

  return constantEqual(signature, expectedSignature)
}
