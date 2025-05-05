<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-800 dark:via-gray-900 dark:to-black">
    <div class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
      <div class="text-center mb-8">
        <Stethoscope class="h-12 w-12 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white">DentalTrack</h1>
        <p class="text-gray-600 dark:text-gray-400">Manage your clinic with ease</p>
      </div>

      <!-- Toggle Buttons -->
      <div class="flex justify-center mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          @click="isLogin = true"
          :class="['py-2 px-6 font-medium text-sm focus:outline-none',
                   isLogin ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200']"
        >
          Login
        </button>
        <button
          @click="isLogin = false"
          :class="['py-2 px-6 font-medium text-sm focus:outline-none',
                   !isLogin ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200']"
        >
          Sign Up
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
        <span>{{ error }}</span>
        <button @click="error = null" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Login Form -->
      <form v-if="isLogin" @submit.prevent="handleLogin">
        <div class="mb-4 relative">
          <label for="login-username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
          <User class="absolute left-3 top-9 h-5 w-5 text-gray-400" />
          <input
            v-model="loginForm.username"
            type="text"
            id="login-username"
            required
            placeholder="Enter your username"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div class="mb-6 relative">
          <label for="login-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <Lock class="absolute left-3 top-9 h-5 w-5 text-gray-400" />
          <input
            v-model="loginForm.password"
            :type="showLoginPassword ? 'text' : 'password'"
            id="login-password"
            required
            placeholder="Enter your password"
            class="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <button
            type="button"
            @click="showLoginPassword = !showLoginPassword"
            class="absolute right-3 top-9 h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
          >
            <Eye v-if="!showLoginPassword" class="h-5 w-5" />
            <EyeOff v-else class="h-5 w-5" />
          </button>
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LoaderCircle v-if="loading" class="animate-spin h-5 w-5 mr-2" />
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <!-- Signup Form -->
      <form v-else @submit.prevent="handleSignup">
        <div class="mb-4 relative">
          <label for="signup-username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
          <User class="absolute left-3 top-9 h-5 w-5 text-gray-400" />
          <input
            v-model="signupForm.username"
            type="text"
            id="signup-username"
            required
            placeholder="Choose a username"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div class="mb-6 relative">
          <label for="signup-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <Lock class="absolute left-3 top-9 h-5 w-5 text-gray-400" />
          <input
            v-model="signupForm.password"
            :type="showSignupPassword ? 'text' : 'password'"
            id="signup-password"
            required
            placeholder="Create a password"
            class="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <button
            type="button"
            @click="showSignupPassword = !showSignupPassword"
            class="absolute right-3 top-9 h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
          >
            <Eye v-if="!showSignupPassword" class="h-5 w-5" />
            <EyeOff v-else class="h-5 w-5" />
          </button>
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LoaderCircle v-if="loading" class="animate-spin h-5 w-5 mr-2" />
          {{ loading ? 'Signing up...' : 'Sign Up' }}
        </button>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { Stethoscope, User, Lock, LoaderCircle, X, Eye, EyeOff } from 'lucide-vue-next';
import Cookies from 'js-cookie'; // Using js-cookie for easier cookie handling

const config = useRuntimeConfig();
const router = useRouter();

const isLogin = ref(true);
const loading = ref(false);
const error = ref(null);
const showLoginPassword = ref(false); // State for login password visibility
const showSignupPassword = ref(false); // State for signup password visibility

const loginForm = ref({
  username: '',
  password: '',
});

const signupForm = ref({
  username: '',
  password: '',
  role: 'staff', // Defaulting role as per API
  dentist_id: null // Defaulting dentist_id as per API
});

// Function to set the access token cookie
const setAccessTokenCookie = (token) => {
  Cookies.set('dental_access_token', token, { expires: 1, path: '/' }); // Corrected cookie name
};

// Function to get the access token cookie
const getAccessTokenCookie = () => {
  return Cookies.get('dental_access_token'); // Corrected cookie name
};

// Handle Login
const handleLogin = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Use API_BASE_URL from runtime config
    const response = await axios.post(`${config.public.API_BASE_URL}/api/dental/auth/login`, {
      username: loginForm.value.username,
      password: loginForm.value.password,
    });

    if (response.data.access_token) {
      setAccessTokenCookie(response.data.access_token);
      router.push('/dental'); // Redirect to dental dashboard
    } else {
      error.value = 'Login failed: No access token received.';
    }
  } catch (err) {
    console.error('Login error:', err);
    if (err.response && err.response.data && err.response.data.error) {
      error.value = err.response.data.error;
    } else {
      error.value = 'An unexpected error occurred during login.';
    }
  } finally {
    loading.value = false;
  }
};

// Handle Signup
const handleSignup = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Use API_BASE_URL from runtime config
    const response = await axios.post(`${config.public.API_BASE_URL}/dental/auth/signup`, {
      username: signupForm.value.username,
      password: signupForm.value.password,
      role: signupForm.value.role, // Sending default role
      dentist_id: signupForm.value.dentist_id // Sending default dentist_id
    });

    if (response.data.access_token) {
      setAccessTokenCookie(response.data.access_token);
      router.push('/dental'); // Redirect to dental dashboard
    } else {
      error.value = 'Signup failed: No access token received.';
    }
  } catch (err) {
    console.error('Signup error:', err);
    if (err.response && err.response.data && err.response.data.error) {
      error.value = err.response.data.error;
    } else {
      error.value = 'An unexpected error occurred during signup.';
    }
  } finally {
    loading.value = false;
  }
};

// Check for existing token on mount
onMounted(() => {
  const existingToken = getAccessTokenCookie(); // Uses the corrected function
  if (existingToken) {
    // Optional: You could add a check here to verify the token is still valid
    // by making a request to a protected endpoint like /user-profile
    console.log('Existing token found, redirecting to /dental...');
    router.push('/dental');
  }
});

// Add dark mode handling if needed (similar to index.vue)
// const isDarkMode = ref(false);
// const toggleDarkMode = () => { ... };
// onMounted(() => { ... check localStorage/system preference ... });

</script>

<style scoped>
/* Add any additional scoped styles if needed */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important; /* Light mode */
    box-shadow: 0 0 0 30px white inset !important; /* Light mode */
}

/* Dark mode autofill */
.dark input:-webkit-autofill,
.dark input:-webkit-autofill:hover,
.dark input:-webkit-autofill:focus,
.dark input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px #4a5568 inset !important; /* Adjust dark background color */
    box-shadow: 0 0 0 30px #4a5568 inset !important; /* Adjust dark background color */
    -webkit-text-fill-color: white !important; /* Ensure text is visible */
}
</style>
