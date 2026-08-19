import {
  TESTING_COOKIE_NAME,
  createTestingSession,
  validateTestingCredentials,
} from '../../utils/testing-auth.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const username = String(body?.username || '')
  const password = String(body?.password || '')
  const result = validateTestingCredentials(username, password)

  if (!result.ok) {
    if (result.reason === 'not_configured') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Testing admin credentials are not configured',
      })
    }

    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid testing credentials',
    })
  }

  setCookie(event, TESTING_COOKIE_NAME, createTestingSession(username), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  })

  return { ok: true }
})
