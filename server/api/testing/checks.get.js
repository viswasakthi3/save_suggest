import { TESTING_COOKIE_NAME, verifyTestingSession } from '../../utils/testing-auth.js'

const REQUEST_TIMEOUT_MS = 8000

function nowIso() {
  return new Date().toISOString()
}

function makeCheck(id, label, required, ok, detail, extra = {}) {
  return {
    id,
    label,
    required,
    ok,
    status: ok ? 'pass' : 'fail',
    detail,
    checkedAt: nowIso(),
    ...extra,
  }
}

function safeDetail(value, fallback = 'No detail returned') {
  if (!value) {
    return fallback
  }

  const text = String(value)
  return text.length > 180 ? `${text.slice(0, 177)}...` : text
}

async function fetchJsonWithTiming(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const startedAt = performance.now()

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    const latencyMs = Math.round(performance.now() - startedAt)
    const text = await response.text()
    let data = null

    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = { detail: text }
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      latencyMs,
      data,
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      statusText: error?.name === 'AbortError' ? 'Request timed out' : 'Request failed',
      latencyMs: Math.round(performance.now() - startedAt),
      data: {
        detail: error?.name === 'AbortError' ? 'Request timed out' : safeDetail(error?.message, 'Request failed'),
      },
    }
  } finally {
    clearTimeout(timer)
  }
}

function readNestedCheck(healthData, key) {
  const check = healthData?.checks?.[key]
  if (!check) {
    return { ok: false, detail: `${key} status missing from backend health response` }
  }

  return {
    ok: Boolean(check.ok),
    detail: safeDetail(check.detail || check.error, `${key} check failed`),
  }
}

function overallStatus(checks) {
  const requiredFailed = checks.some((check) => check.required && !check.ok)
  const optionalFailed = checks.some((check) => !check.required && !check.ok)

  if (requiredFailed) {
    return 'failing'
  }

  if (optionalFailed) {
    return 'degraded'
  }

  return 'healthy'
}

export default defineEventHandler(async (event) => {
  const session = getCookie(event, TESTING_COOKIE_NAME)
  if (!verifyTestingSession(session)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Testing admin login required',
    })
  }

  const checks = []
  const rawBaseUrl = (process.env.API_BASE_URL || '').trim()
  let backendBaseUrl = null

  if (!rawBaseUrl) {
    checks.push(makeCheck(
      'nuxt-config',
      'Nuxt API_BASE_URL',
      true,
      false,
      'API_BASE_URL is missing from the Nuxt server environment',
    ))
  } else {
    try {
      backendBaseUrl = new URL(rawBaseUrl).origin
      checks.push(makeCheck(
        'nuxt-config',
        'Nuxt API_BASE_URL',
        true,
        true,
        `Using ${backendBaseUrl}`,
      ))
    } catch {
      checks.push(makeCheck(
        'nuxt-config',
        'Nuxt API_BASE_URL',
        true,
        false,
        'API_BASE_URL is not a valid URL',
      ))
    }
  }

  if (!backendBaseUrl) {
    return {
      ok: false,
      overallStatus: overallStatus(checks),
      generatedAt: nowIso(),
      checks,
    }
  }

  const [backendHealth, aiHealth] = await Promise.all([
    fetchJsonWithTiming(`${backendBaseUrl}/api/dental/health`),
    fetchJsonWithTiming(`${backendBaseUrl}/api/dental/ai/health`),
  ])

  checks.push(makeCheck(
    'backend-reachability',
    'Backend Reachability',
    true,
    backendHealth.ok,
    backendHealth.ok
      ? 'Dental backend health endpoint responded'
      : safeDetail(backendHealth.data?.detail || backendHealth.statusText, 'Backend health endpoint failed'),
    {
      latencyMs: backendHealth.latencyMs,
      httpStatus: backendHealth.status,
    },
  ))

  const database = readNestedCheck(backendHealth.data, 'database')
  checks.push(makeCheck('database', 'Dental Database', true, database.ok, database.detail))

  const auth = readNestedCheck(backendHealth.data, 'auth')
  checks.push(makeCheck('dental-auth', 'Dental Auth Service', true, auth.ok, auth.detail))

  const patients = readNestedCheck(backendHealth.data, 'patients')
  checks.push(makeCheck('patients-api', 'Patients API Dependency', false, patients.ok, patients.detail))

  const records = readNestedCheck(backendHealth.data, 'records')
  checks.push(makeCheck('records-api', 'Dental Records API Dependency', false, records.ok, records.detail))

  checks.push(makeCheck(
    'vertex-flash',
    'Vertex/Gemini Flash AI',
    true,
    aiHealth.ok && Boolean(aiHealth.data?.ok),
    aiHealth.ok && aiHealth.data?.ok
      ? safeDetail(aiHealth.data?.detail, 'AI health check passed')
      : safeDetail(aiHealth.data?.detail || aiHealth.data?.message || aiHealth.statusText, 'AI health check failed'),
    {
      latencyMs: aiHealth.data?.latencyMs || aiHealth.latencyMs,
      httpStatus: aiHealth.status,
      provider: aiHealth.data?.provider,
      model: aiHealth.data?.model,
    },
  ))

  const status = overallStatus(checks)

  return {
    ok: status === 'healthy',
    overallStatus: status,
    generatedAt: nowIso(),
    checks,
  }
})
