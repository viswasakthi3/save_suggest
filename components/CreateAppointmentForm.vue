<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50" @click.self="closeModal">
    <div class="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
      <div class="mt-3 text-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">{{ isEditing ? 'Edit Appointment' : 'Create New Appointment' }}</h3>
        <form @submit.prevent="submitForm" class="mt-2 space-y-4 text-left">

          <!-- Error Message -->
          <div v-if="formError" class="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-sm">
            {{ formError }}
          </div>

          <!-- Patient Selection -->
          <div>
            <label for="patient" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Patient</label>
            <select
              id="patient"
              v-model="formData.patient_id"
              required
              :disabled="isEditing" 
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="" disabled>Select a patient</option>
              <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                {{ patient.first_name }} {{ patient.last_name }}
              </option>
            </select>
             <p v-if="isEditing" class="mt-1 text-xs text-gray-500 dark:text-gray-400">Patient cannot be changed when editing.</p>
          </div>

          <!-- Dentist Selection -->
          <div>
            <label for="dentist" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Dentist</label>
            <select
              id="dentist"
              v-model="formData.dentist_id"
              required
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="" disabled>Select a dentist</option>
              <option v-for="dentist in dentists" :key="dentist.id" :value="dentist.id">
                {{ dentist.first_name }} {{ dentist.last_name }} ({{ dentist.specialization }})
              </option>
            </select>
          </div>

          <!-- Date -->
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
            <input
              type="date"
              id="date"
              v-model="formData.appointment_date"
              required
              class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Time -->
          <div>
            <label for="time" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
            <input
              type="time"
              id="time"
              v-model="formData.appointment_time"
              required
              class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Reason -->
          <div>
            <label for="reason" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
            <input
              type="text"
              id="reason"
              v-model="formData.reason"
              placeholder="e.g., Checkup, Cleaning, Filling"
              class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Status -->
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select
              id="status"
              v-model="formData.status"
              required
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <!-- Notes -->
          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
            <textarea
              id="notes"
              v-model="formData.notes"
              rows="3"
              placeholder="Optional notes about the appointment"
              class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>

          <!-- Buttons -->
          <div class="items-center px-4 py-3">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
            >
              <LoaderCircle v-if="isSubmitting" class="animate-spin h-5 w-5 mr-2" />
              {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Appointment' : 'Create Appointment') }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="mt-3 w-full px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { LoaderCircle } from 'lucide-vue-next';

const props = defineProps({
  appointmentData: { // Used for editing
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'appointment-saved', 'error']);

const config = useRuntimeConfig();
const API_BASE_URL = config.public.API_BASE_URL;

const isEditing = computed(() => !!props.appointmentData);
const isSubmitting = ref(false);
const formError = ref(null);
const patients = ref([]);
const dentists = ref([]);

const formData = reactive({
  patient_id: '',
  dentist_id: '',
  appointment_date: '',
  appointment_time: '',
  reason: '',
  status: 'scheduled',
  notes: ''
});

const getAccessTokenCookie = () => {
  const token = Cookies.get('dental_access_token');
  if (!token) {
    emit('error', 'Authentication token not found. Please log in.');
    emit('close');
  }
  return token;
};

const fetchPatients = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/patients`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { per_page: 500 } // Fetch a larger list for selection
    });
    patients.value = response.data.patients || [];
  } catch (err) {
    console.error('Error fetching patients for form:', err);
    formError.value = 'Could not load patients list.';
    if (err.response && err.response.status === 401) {
       emit('error', 'Session expired.');
       emit('close');
    }
  }
};

const fetchDentists = async (token) => {
  try {
    // Assuming an endpoint /dentists exists - adjust if different
    const response = await axios.get(`${API_BASE_URL}/dentists`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    dentists.value = response.data.dentists || response.data || []; // Adjust based on actual API response structure
     if (!Array.isArray(dentists.value)) {
        console.warn('Fetched dentists data is not an array:', dentists.value);
        dentists.value = [];
        throw new Error('Invalid dentists data format');
    }
  } catch (err) {
    console.error('Error fetching dentists for form:', err);
    formError.value = 'Could not load dentists list. Please ensure the /dentists endpoint is available.';
     if (err.response && err.response.status === 401) {
       emit('error', 'Session expired.');
       emit('close');
    }
  }
};

const initializeForm = () => {
  if (isEditing.value) {
    formData.patient_id = props.appointmentData.patient?.id || '';
    formData.dentist_id = props.appointmentData.dentist?.id || '';
    formData.appointment_date = props.appointmentData.date || '';
    // API time might be HH:MM:SS, input needs HH:MM
    formData.appointment_time = props.appointmentData.time ? props.appointmentData.time.substring(0, 5) : '';
    formData.reason = props.appointmentData.reason || '';
    formData.status = props.appointmentData.status || 'scheduled';
    formData.notes = props.appointmentData.notes || '';
  } else {
    // Reset for new appointment
    formData.patient_id = '';
    formData.dentist_id = '';
    formData.appointment_date = '';
    formData.appointment_time = '';
    formData.reason = '';
    formData.status = 'scheduled';
    formData.notes = '';
  }
  formError.value = null;
};

watch(() => props.appointmentData, initializeForm, { immediate: true });

onMounted(async () => {
  const token = getAccessTokenCookie();
  if (!token) return;
  await fetchPatients(token);
  await fetchDentists(token);
  initializeForm(); // Ensure form is initialized after data is fetched
});

const submitForm = async () => {
  isSubmitting.value = true;
  formError.value = null;
  const token = getAccessTokenCookie();
  if (!token) {
    isSubmitting.value = false;
    return;
  }

  const payload = { ...formData };

  try {
    let response;
    if (isEditing.value) {
      // PUT request to update
      response = await axios.put(`${API_BASE_URL}/appointments/${props.appointmentData.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      // POST request to create
      response = await axios.post(`${API_BASE_URL}/appointments`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    emit('appointment-saved', response.data);
    closeModal();

  } catch (err) {
    console.error('Error saving appointment:', err);
    if (err.response) {
      if (err.response.status === 401) {
        formError.value = 'Session expired. Please log in again.';
        emit('error', 'Session expired.');
        emit('close');
      } else if (err.response.data && err.response.data.error) {
        formError.value = `Error: ${err.response.data.error}`;
      } else {
        formError.value = `An error occurred (Status: ${err.response.status}). Please try again.`;
      }
    } else if (err.request) {
      formError.value = 'Could not connect to the server. Please check your network connection.';
    } else {
      formError.value = `An unexpected error occurred: ${err.message}`;
    }
    // Do not emit general error here, keep it in the form
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = () => {
  emit('close');
};

</script>

<style scoped>
/* Add any specific styles if needed */
</style>
