<template>
  <div
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50"
    @click.self="confirmClose"
  >
    <div class="relative mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
      <button
        @click="confirmClose"
        class="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        aria-label="Close"
      >
        <X class="h-6 w-6" />
      </button>
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Patient</h3>

      <div v-if="error" class="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
        <span>{{ error }}</span>
        <button @click="error = null" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-4" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500',
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Tab Content -->
        <div v-show="activeTab === 'personalContact'">
          <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-md mb-6">
            <legend class="text-lg font-medium text-gray-800 dark:text-gray-200 px-2">Personal Information</legend>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <label for="first_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name <span class="text-red-500">*</span></label>
                <input v-model="formData.first_name" type="text" id="first_name" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              </div>
              <div>
                <label for="last_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name <span class="text-red-500">*</span></label>
                <input v-model="formData.last_name" type="text" id="last_name" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              </div>
              <div>
                <label for="date_of_birth" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth <span class="text-red-500">*</span></label>
                <input v-model="formData.date_of_birth" type="date" id="date_of_birth" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              </div>
              <div>
                <label for="gender" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                <select v-model="formData.gender" id="gender" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label for="occupation" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Occupation</label>
                <input v-model="formData.occupation" type="text" id="occupation" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              </div>
              <div>
                <label for="family_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Family ID</label>
                <input v-model="formData.family_id" type="text" id="family_id" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              </div>
            </div>
          </fieldset>

          <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-md">
            <legend class="text-lg font-medium text-gray-800 dark:text-gray-200 px-2">Contact Information</legend>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input v-model="formData.email" type="email" id="email" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              </div>
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input v-model="formData.phone" type="tel" id="phone" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              </div>
              <div>
                <label for="emergency_contact" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Contact</label>
                <input v-model="formData.emergency_contact" type="text" id="emergency_contact" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              </div>
              <div class="md:col-span-3">
                <label for="address" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <textarea v-model="formData.address" id="address" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></textarea>
              </div>
            </div>
          </fieldset>
        </div>

        <div v-show="activeTab === 'medicalHistory'">
          <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-md">
            <legend class="text-lg font-medium text-gray-800 dark:text-gray-200 px-2">Medical History</legend>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <label for="blood_group" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                <input v-model="formData.blood_group" type="text" id="blood_group" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              </div>
              <div class="flex items-center mt-2 md:mt-7">
                <label for="is_pregnant" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">Is Pregnant</label>
                <button
                  type="button"
                  @click="formData.is_pregnant = !formData.is_pregnant"
                  :class="[
                    'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800 focus:ring-blue-500',
                    formData.is_pregnant ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  ]"
                >
                  <span class="sr-only">Is Pregnant</span>
                  <span
                    aria-hidden="true"
                    :class="[
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white dark:bg-gray-300 shadow transform ring-0 transition ease-in-out duration-200',
                      formData.is_pregnant ? 'translate-x-5' : 'translate-x-0'
                    ]"
                  ></span>
                </button>
              </div>
              <div class="flex items-center mt-2 md:mt-7">
                <label for="is_nursing" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">Is Nursing</label>
                <button
                  type="button"
                  @click="formData.is_nursing = !formData.is_nursing"
                  :class="[
                    'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800 focus:ring-blue-500',
                    formData.is_nursing ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  ]"
                >
                  <span class="sr-only">Is Nursing</span>
                  <span
                    aria-hidden="true"
                    :class="[
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white dark:bg-gray-300 shadow transform ring-0 transition ease-in-out duration-200',
                      formData.is_nursing ? 'translate-x-5' : 'translate-x-0'
                    ]"
                  ></span>
                </button>
              </div>
              <div class="md:col-span-3">
                <label for="food_allergies" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Food Allergies</label>
                <textarea v-model="formData.food_allergies" id="food_allergies" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></textarea>
              </div>
              <div class="md:col-span-3">
                <label for="medical_conditions" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medical Conditions</label>
                <textarea v-model="formData.medical_conditions" id="medical_conditions" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></textarea>
              </div>
              <div class="md:col-span-3">
                <label for="current_medications" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Medications</label>
                <textarea v-model="formData.current_medications" id="current_medications" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></textarea>
              </div>
              <div class="md:col-span-3">
                <label for="psychiatric_problems" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Psychiatric Problems</label>
                <textarea v-model="formData.psychiatric_problems" id="psychiatric_problems" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></textarea>
              </div>
            </div>
          </fieldset>
        </div>

        <div v-show="activeTab === 'dentalHistory'">
          <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-md">
            <legend class="text-lg font-medium text-gray-800 dark:text-gray-200 px-2">Dental History</legend>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div class="md:col-span-2">
                <label for="dental_concerns" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dental Concerns</label>
                <textarea v-model="formData.dental_concerns" id="dental_concerns" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></textarea>
              </div>
              <div>
                <label for="previous_dentist" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Previous Dentist</label>
                <input v-model="formData.previous_dentist" type="text" id="previous_dentist" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              </div>
              <div class="md:col-span-2">
                <label for="old_medical_records" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Old Medical Records (Summary/Link)</label>
                <textarea v-model="formData.old_medical_records" id="old_medical_records" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></textarea>
              </div>
            </div>
          </fieldset>
        </div>

        <div v-show="activeTab === 'otherInfo'">
          <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-md">
            <legend class="text-lg font-medium text-gray-800 dark:text-gray-200 px-2">Other Information</legend>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <label for="documents_url" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Documents URL (e.g., X-rays)</label>
                <input v-model="formData.documents_url" type="url" id="documents_url" placeholder="https://example.com/document.pdf" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              </div>
              <div class="md:col-span-2">
                <label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Notes</label>
                <textarea v-model="formData.notes" id="notes" rows="3" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></textarea>
              </div>
            </div>
          </fieldset>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button
            type="button"
            @click="confirmClose"
            class="py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium rounded-md transition-colors"
            :disabled="submitting"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md flex items-center justify-center disabled:opacity-50 transition-colors"
            :disabled="submitting || !isFormValid" 
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
import { ref, computed } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { X, LoaderCircle } from 'lucide-vue-next';

const emit = defineEmits(['close', 'patient-added', 'error']);

const config = useRuntimeConfig();
const submitting = ref(false);
const error = ref(null);

const activeTab = ref('personalContact');

const tabs = [
  { id: 'personalContact', name: 'Personal & Contact' },
  { id: 'medicalHistory', name: 'Medical History' },
  { id: 'dentalHistory', name: 'Dental History' },
  { id: 'otherInfo', name: 'Other Information' },
];

const formData = ref({
  first_name: '',
  last_name: '',
  date_of_birth: '',
  gender: '',
  occupation: '',
  family_id: '',
  email: '',
  phone: '',
  address: '',
  emergency_contact: '',
  blood_group: '',
  food_allergies: '',
  medical_conditions: '',
  current_medications: '',
  psychiatric_problems: '',
  is_pregnant: false,
  is_nursing: false,
  dental_concerns: '',
  previous_dentist: '',
  old_medical_records: '',
  documents_url: '',
  notes: ''
});

const isFormValid = computed(() => {
  return formData.value.first_name && formData.value.last_name && formData.value.date_of_birth;
});

const getAccessTokenCookie = () => {
  return Cookies.get('dental_access_token');
};

const confirmClose = () => {
  const isDirty = Object.values(formData.value).some(value => {
    if (typeof value === 'boolean') return value !== false;
    return value && value !== '';
  });

  if (isDirty) {
    if (confirm('Are you sure you want to close? Unsaved changes will be lost.')) {
      emit('close');
    }
  } else {
    emit('close');
  }
};

const submitForm = async () => {
  if (!isFormValid.value) {
    error.value = 'Please fill in all required fields (First Name, Last Name, Date of Birth) on the Personal & Contact tab.';
    activeTab.value = 'personalContact';
    return;
  }
  submitting.value = true;
  error.value = null;
  const token = getAccessTokenCookie();

  if (!token) {
    error.value = 'Authentication token not found. Please log in again.';
    submitting.value = false;
    emit('error', 'Authentication token not found.');
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
/* Add specific styles if needed, e.g., for date picker appearance */
input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(0.6) brightness(1); /* Basic styling for dark mode */
}
@media (prefers-color-scheme: dark) {
  input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(0.8) brightness(1);
  }
}

/* Improved focus visibility for accessibility */
input:focus-visible, textarea:focus-visible, select:focus-visible, button:focus-visible {
  outline: 2px solid theme('colors.blue.500');
  outline-offset: 1px;
}
</style>
