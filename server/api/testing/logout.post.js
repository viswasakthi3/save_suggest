import { TESTING_COOKIE_NAME } from '../../utils/testing-auth.js'

export default defineEventHandler((event) => {
  deleteCookie(event, TESTING_COOKIE_NAME, { path: '/' })

  return { ok: true }
})
