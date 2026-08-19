<template>
  <main class="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
    <section class="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header class="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-normal">AI Diagnostics</h1>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
            DentalTrack service checks for backend, database, auth, records, and Vertex/Gemini Flash.
          </p>
        </div>

        <div v-if="isAuthenticated" class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            :disabled="loading"
            title="Run checks again"
            @click="runChecks"
          >
            <RefreshCw :class="['h-4 w-4', loading ? 'animate-spin' : '']" />
          </button>
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Log out"
            @click="logout"
          >
            <LogOut class="h-4 w-4" />
          </button>
        </div>
      </header>

      <form
        v-if="!isAuthenticated"
        class="mx-auto mt-16 w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        @submit.prevent="login"
      >
        <div class="mb-4">
          <h2 class="text-lg font-semibold">Admin access</h2>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Use the testing admin credentials configured on the server.
          </p>
        </div>

        <label class="mb-3 block">
          <span class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Username</span>
          <input
            v-model="credentials.username"
            class="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-sky-900"
            autocomplete="username"
            required
            type="text"
          >
        </label>

        <label class="mb-4 block">
          <span class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</span>
          <input
            v-model="credentials.password"
            class="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-sky-900"
            autocomplete="current-password"
            required
            type="password"
          >
        </label>

        <p v-if="loginError" class="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {{ loginError }}
        </p>

        <button
          type="submit"
          class="inline-flex h-10 w-full items-center justify-center rounded-md bg-sky-600 px-4 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loggingIn"
        >
          <LoaderCircle v-if="loggingIn" class="mr-2 h-4 w-4 animate-spin" />
          Open diagnostics
        </button>
      </form>

      <section v-else class="flex flex-1 flex-col gap-4">
        <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div :class="['rounded-lg border p-4', statusPanelClass]">
            <div class="flex items-center gap-3">
              <component :is="statusIcon" class="h-6 w-6 shrink-0" />
              <div>
                <p class="text-sm font-medium uppercase tracking-normal">{{ overallLabel }}</p>
                <p class="mt-1 text-sm opacity-80">{{ overallDetail }}</p>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
            <p class="text-slate-500 dark:text-slate-400">Last checked</p>
            <p class="mt-1 font-medium">{{ formattedGeneratedAt }}</p>
          </div>
        </div>

        <div v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {{ errorMessage }}
        </div>

        <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="grid min-w-[720px] grid-cols-[44px_minmax(180px,1fr)_minmax(180px,1.6fr)_120px] border-b border-slate-200 bg-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-normal text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <span>Status</span>
            <span>Check</span>
            <span>Detail</span>
            <span>Latency</span>
          </div>

          <div v-if="loading && checks.length === 0" class="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-600 dark:text-slate-400">
            <LoaderCircle class="h-4 w-4 animate-spin" />
            Running checks
          </div>

          <div
            v-for="check in checks"
            :key="check.id"
            class="grid min-w-[720px] grid-cols-[44px_minmax(180px,1fr)_minmax(180px,1.6fr)_120px] items-center border-b border-slate-100 px-4 py-4 last:border-b-0 dark:border-slate-800"
          >
            <div>
              <CheckCircle2 v-if="check.ok" class="h-5 w-5 text-emerald-600" />
              <XCircle v-else class="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p class="font-medium">{{ check.label }}</p>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {{ check.required ? 'Required' : 'Optional' }}
              </p>
            </div>
            <div class="min-w-0">
              <p class="break-words text-sm text-slate-700 dark:text-slate-300">{{ check.detail }}</p>
              <p v-if="check.model || check.provider" class="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">
                {{ [check.provider, check.model].filter(Boolean).join(' / ') }}
              </p>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {{ formatDate(check.checkedAt) }}
              </p>
            </div>
            <div class="text-sm text-slate-600 dark:text-slate-400">
              {{ formatLatency(check.latencyMs) }}
            </div>
          </div>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  LogOut,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from 'lucide-vue-next'

const credentials = reactive({
  username: '',
  password: '',
})
const isAuthenticated = ref(false)
const loggingIn = ref(false)
const loading = ref(false)
const loginError = ref('')
const errorMessage = ref('')
const checks = ref([])
const generatedAt = ref(null)
const overallStatus = ref('unknown')

const statusIcon = computed(() => {
  if (loading.value && checks.value.length === 0) return LoaderCircle
  if (overallStatus.value === 'healthy') return CheckCircle2
  if (overallStatus.value === 'degraded') return AlertTriangle
  return ShieldAlert
})

const overallLabel = computed(() => {
  if (loading.value && checks.value.length === 0) return 'Checking'
  if (overallStatus.value === 'healthy') return 'Healthy'
  if (overallStatus.value === 'degraded') return 'Degraded'
  if (overallStatus.value === 'failing') return 'Failing'
  return 'Not checked'
})

const overallDetail = computed(() => {
  if (overallStatus.value === 'healthy') return 'All required and optional diagnostics passed.'
  if (overallStatus.value === 'degraded') return 'Required systems passed, but one optional dependency needs attention.'
  if (overallStatus.value === 'failing') return 'One or more required checks failed. Start with the red required rows.'
  return 'Run diagnostics to see service status.'
})

const statusPanelClass = computed(() => {
  if (overallStatus.value === 'healthy') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
  }

  if (overallStatus.value === 'degraded') {
    return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200'
  }

  return 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200'
})

const formattedGeneratedAt = computed(() => formatDate(generatedAt.value))

function formatDate(value) {
  if (!value) return 'Never'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(value))
}

function formatLatency(value) {
  if (value === undefined || value === null) return 'n/a'
  return `${value} ms`
}

async function runChecks() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch('/api/testing/checks')
    checks.value = response.checks || []
    generatedAt.value = response.generatedAt
    overallStatus.value = response.overallStatus || 'unknown'
    isAuthenticated.value = true
  } catch (error) {
    if (error?.statusCode === 401 || error?.response?.status === 401) {
      isAuthenticated.value = false
      checks.value = []
      overallStatus.value = 'unknown'
      return
    }

    errorMessage.value = error?.statusMessage || error?.message || 'Could not run diagnostics.'
  } finally {
    loading.value = false
  }
}

async function login() {
  loggingIn.value = true
  loginError.value = ''

  try {
    await $fetch('/api/testing/login', {
      method: 'POST',
      body: {
        username: credentials.username,
        password: credentials.password,
      },
    })
    isAuthenticated.value = true
    credentials.password = ''
    await runChecks()
  } catch (error) {
    loginError.value = error?.statusMessage || 'Invalid testing credentials.'
  } finally {
    loggingIn.value = false
  }
}

async function logout() {
  await $fetch('/api/testing/logout', { method: 'POST' })
  isAuthenticated.value = false
  checks.value = []
  generatedAt.value = null
  overallStatus.value = 'unknown'
}

onMounted(runChecks)
</script>
