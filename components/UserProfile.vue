<template>
  <div class="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-10">
    <h2 class="text-3xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-4">User Profile</h2>

    <div v-if="loading" class="text-center py-10">
      <LoaderCircle class="animate-spin h-8 w-8 mx-auto text-blue-600 dark:text-blue-400" />
      <p class="mt-2 text-gray-600 dark:text-gray-400">Loading profile...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-6" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ error }}</span>
      <button @click="fetchUserProfile" class="ml-4 text-sm font-medium text-red-600 dark:text-red-400 hover:underline">Retry</button>
    </div>

    <div v-else-if="userProfile">
      <!-- Display Mode -->
      <div v-if="!isEditing">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Account Information</h3>
            <div class="space-y-2">
              <p><strong class="text-gray-600 dark:text-gray-400">Username:</strong> {{ userProfile.username }}</p>
              <p><strong class="text-gray-600 dark:text-gray-400">Role:</strong> <span class="capitalize">{{ userProfile.role }}</span></p>
              <p><strong class="text-gray-600 dark:text-gray-400">Member Since:</strong> {{ formatDate(userProfile.created_at) }}</p>
            </div>
          </div>

          <div v-if="userProfile.role === 'dentist' && userProfile.dentist_info">
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Dentist Details</h3>
            <div class="space-y-2">
              <p><strong class="text-gray-600 dark:text-gray-400">Name:</strong> {{ userProfile.dentist_info.first_name }} {{ userProfile.dentist_info.last_name }}</p>
              <p><strong class="text-gray-600 dark:text-gray-400">Email:</strong> {{ userProfile.dentist_info.email }}</p>
              <p><strong class="text-gray-600 dark:text-gray-400">Phone:</strong> {{ userProfile.dentist_info.phone }}</p>
              <p><strong class="text-gray-600 dark:text-gray-400">Specialization:</strong> {{ userProfile.dentist_info.specialization || 'N/A' }}</p>
              <p><strong class="text-gray-600 dark:text-gray-400">Profile Updated:</strong> {{ formatDate(userProfile.dentist_info.updated_at) }}</p>
            </div>
          </div>
        </div>

        <div v-if="userProfile.role === 'dentist'" class="text-right border-t pt-4">
          <button
            @click="startEditing"
            class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition duration-150 ease-in-out"
          >
            <Pencil class="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        </div>
      </div>

      <!-- Editing Mode -->
      <div v-else>
        <form @submit.prevent="handleUpdateProfile">
          <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Edit Dentist Details</h3>
          <div v-if="updateError" class="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
            <span>{{ updateError }}</span>
            <button @click="updateError = null" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200">
              <X class="w-4 h-4" />
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label for="first_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
              <input type="text" id="first_name" v-model="editForm.first_name" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            </div>
            <div>
              <label for="last_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name (Optional)</label>
              <input type="text" id="last_name" v-model="editForm.last_name" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" id="email" v-model="editForm.email" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            </div>
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input type="tel" id="phone" v-model="editForm.phone" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            </div>
            <div class="md:col-span-2">
              <label for="specialization" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization</label>
              <input type="text" id="specialization" v-model="editForm.specialization" placeholder="e.g., Orthodontics" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            </div>
          </div>

          <div class="flex justify-end space-x-3 border-t pt-4">
            <button
              type="button"
              @click="cancelEditing"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-medium rounded-md transition duration-150 ease-in-out"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isUpdating"
              class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LoaderCircle v-if="isUpdating" class="animate-spin h-4 w-4 mr-2" />
              {{ isUpdating ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { LoaderCircle, Pencil, Save, X, User, Mail, Phone, Briefcase } from 'lucide-vue-next';

const config = useRuntimeConfig();
const userProfile = ref(null);
const loading = ref(true);
const error = ref(null);
const isEditing = ref(false);
const isUpdating = ref(false);
const updateError = ref(null);

const editForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  specialization: ''
});

const getAuthHeaders = () => {
  const token = Cookies.get('dental_access_token');
  if (!token) {
    error.value = 'Authentication token not found. Please log in again.';
    return null;
  }
  return { Authorization: `Bearer ${token}` };
};

const fetchUserProfile = async () => {
  loading.value = true;
  error.value = null;
  userProfile.value = null;

  const headers = getAuthHeaders();
  if (!headers) {
    loading.value = false;
    return;
  }

  try {
    const response = await axios.get(`${config.public.API_BASE_URL}/api/dental/auth/user-profile`, { headers });
    if (response.data.success) {
      userProfile.value = response.data.user;
    } else {
      error.value = response.data.error || 'Failed to fetch profile data.';
    }
  } catch (err) {
    console.error('Fetch profile error:', err);
    if (err.response && err.response.data && (err.response.data.error || err.response.data.message)) {
      error.value = err.response.data.error || err.response.data.message;
    } else if (err.response && err.response.status === 401) {
        error.value = 'Session expired or invalid. Please log in again.';
    } else {
      error.value = 'An unexpected error occurred while fetching the profile.';
    }
  } finally {
    loading.value = false;
  }
};

const startEditing = () => {
  if (userProfile.value && userProfile.value.role === 'dentist') {
    const dentistInfo = userProfile.value.dentist_info || {}; // Ensure dentistInfo is an object, defaulting to empty if null/undefined
    editForm.value = {
      first_name: dentistInfo.first_name || '',
      last_name: dentistInfo.last_name || '',
      email: dentistInfo.email || '',
      phone: dentistInfo.phone || '',
      specialization: dentistInfo.specialization || ''
    };
    isEditing.value = true; // Ensure editing mode is activated
    updateError.value = null; // Clear previous update errors
  }
};

const cancelEditing = () => {
  isEditing.value = false;
  updateError.value = null;
};

const handleUpdateProfile = async () => {
  isUpdating.value = true;
  updateError.value = null;

  const headers = getAuthHeaders();
  if (!headers) {
    isUpdating.value = false;
    updateError.value = 'Authentication token not found.';
    return;
  }

  try {
    const response = await axios.put(`${config.public.API_BASE_URL}/api/dental/auth/update-dentist`, editForm.value, { headers });

    if (response.data.message && response.data.dentist) {
      if (userProfile.value && userProfile.value.dentist_info) {
         userProfile.value.dentist_info = { ...userProfile.value.dentist_info, ...response.data.dentist };
      } else {
        userProfile.value.dentist_info = response.data.dentist;
      }
      isEditing.value = false;
    } else {
      updateError.value = response.data.error || 'Failed to update profile.';
    }
  } catch (err) {
    console.error('Update profile error:', err);
     if (err.response && err.response.data && (err.response.data.error || err.response.data.message)) {
      updateError.value = err.response.data.error || err.response.data.message;
    } else if (err.response && err.response.status === 401) {
        updateError.value = 'Session expired or invalid. Please log in again.';
    } else {
      updateError.value = 'An unexpected error occurred while updating the profile.';
    }
  } finally {
    isUpdating.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

onMounted(() => {
  fetchUserProfile();
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
