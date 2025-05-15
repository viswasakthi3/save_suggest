<template>
  <div
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50"
    @click.self="confirmClose"
  >
    <div class="relative mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
      <button
        @click="confirmClose"
        class="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        aria-label="Close"
      >
        <X class="h-6 w-6" />
      </button>
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Patient</h3>

      <div
        v-if="error"
        class="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-sm flex items-center justify-between"
      >
        <span>{{ error }}</span>
        <button
          @click="error = null"
          class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <form @submit.prevent="submitForm">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label for="first_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name <span class="text-red-500">*</span></label>
            <input v-model="formData.first_name" type="text" id="first_name" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
          </div>
          <div>
            <label for="last_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name <span class="text-red-500">*</span></label>
            <input v-model="formData.last_name" type="text" id="last_name" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
          </div>
          <div>
            <label for="date_of_birth" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth <span class="text-red-500">*</span></label>
            <input v-model="formData.date_of_birth" type="date" id="date_of_birth" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
          </div>
          <div>
            <label for="gender" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
            <select v-model="formData.gender" id="gender" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input v-model="formData.email" type="email" id="email" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
          </div>
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <input v-model="formData.phone" type="tel" id="phone" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
          </div>
          <div class="md:col-span-2">
            <label for="address" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <textarea v-model="formData.address" id="address" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"></textarea>
          </div>
     
          <div>
            <label for="blood_group" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
            <input
              v-model="formData.blood_group"
              type="text"
              id="blood_group"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label for="current_medications" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Medications</label>
            <textarea
              v-model="formData.current_medications"
              id="current_medications"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>
          <div>
            <label for="dental_concerns" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dental Concerns</label>
            <textarea
              v-model="formData.dental_concerns"
              id="dental_concerns"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>
          <div>
            <label for="emergency_contact" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Contact</label>
            <input
              v-model="formData.emergency_contact"
              type="text"
              id="emergency_contact"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label for="occupation" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Occupation</label>
            <input
              v-model="formData.occupation"
              type="text"
              id="occupation"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            type="button"
            @click="confirmClose"
            class="py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium rounded-md"
            :disabled="submitting"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md flex items-center justify-center disabled:opacity-50"
            :disabled="submitting"
          >
            <LoaderCircle v-if="submitting" class="animate-spin h-5 w-5 mr-2" />
            {{ submitting ? 'Saving...' : 'Save Patient' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { X, LoaderCircle } from 'lucide-vue-next';

const emit = defineEmits(['close', 'patient-added', 'error']);

const config = useRuntimeConfig();
const submitting = ref(false);
const error = ref(null);

const formData = ref({
  first_name: '',
  last_name: '',
  date_of_birth: '',
  gender: '',
  email: '',
  phone: '',
  address: '',
  insurance_provider: '',
  insurance_id: '',
  blood_group: '',
  current_medications: '',
  dental_concerns: '',
  emergency_contact: '',
  occupation: ''
});

const getAccessTokenCookie = () => {
  return Cookies.get('dental_access_token');
};

const confirmClose = () => {
  if (Object.values(formData.value).some((field) => field)) {
    if (confirm('Are you sure you want to close? Unsaved changes will be lost.')) {
      emit('close');
    }
  } else {
    emit('close');
  }
};

const submitForm = async () => {
  submitting.value = true;
  error.value = null;
  const token = getAccessTokenCookie();

  if (!token) {
    error.value = 'Authentication token not found. Please log in again.';
    submitting.value = false;
    emit('error', 'Authentication token not found.');
    return;
  }

  if (!formData.value.first_name || !formData.value.last_name || !formData.value.date_of_birth) {
    error.value = 'Please fill in all required fields (First Name, Last Name, Date of Birth).';
    submitting.value = false;
    return;
  }

  try {
    const response = await axios.post(`${config.public.API_BASE_URL}/patients`, formData.value, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 201) {
      emit('patient-added', response.data.patient_id);
      emit('close');
    } else {
      throw new Error(response.data.error || 'Failed to create patient');
    }
  } catch (err) {
    console.error('Error creating patient:', err);
    if (err.response && err.response.data && err.response.data.error) {
      error.value = `Failed to add patient: ${err.response.data.error}`;
    } else if (err.response && err.response.status === 401) {
      error.value = 'Session expired. Please log in again.';
      emit('error', 'Session expired.');
    } else {
      error.value = `Failed to add patient: ${err.message || 'Network error or unexpected issue'}`;
    }
    emit('error', error.value);
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(0.6) brightness(1);
}
@media (prefers-color-scheme: dark) {
  input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(0.8) brightness(1);
  }
}
</style>
