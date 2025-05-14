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
              name="patient"
              v-model="formData.patient_id"
              required
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option disabled value="">Select a patient</option>
              <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                {{ patient.first_name }} {{ patient.last_name }}
              </option>
            </select>
          </div>

          <!-- Date -->
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
            <input
              type="date"
              id="date"
              name="date"
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
              name="time"
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
              name="reason"
              v-model="formData.reason"
              class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Status -->
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select
              id="status"
              name="status"
              v-model="formData.status"
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
              name="notes"
              v-model="formData.notes"
              rows="3"
              class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>

          <!-- Buttons -->
          <div class="items-center px-4 py-3 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              <LoaderCircle v-if="isSubmitting" class="animate-spin h-5 w-5 mr-2" />
              {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Appointment') }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
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
  appointmentData: {
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

const formData = reactive({
  patient_id: '',
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
      params: { per_page: 500 }
    });
    patients.value = response.data.patients || response.data.data || [];
    if (!Array.isArray(patients.value)) {
      console.warn('Fetched patients data is not an array:', patients.value);
      patients.value = [];
      throw new Error('Invalid patients data format');
    }
  } catch (err) {
    console.error('Error fetching patients for form:', err);
    formError.value = 'Could not load patients list.';
    if (err.response && err.response.status === 401) {
      emit('error', 'Session expired.');
      emit('close');
    }
  }
};

const initializeForm = () => {
  if (isEditing.value && props.appointmentData) {
    formData.patient_id = props.appointmentData.patient?.id || props.appointmentData.patient_id || '';
    formData.appointment_date = props.appointmentData.date || '';
    formData.appointment_time = props.appointmentData.time || '';
    formData.reason = props.appointmentData.reason || '';
    formData.status = props.appointmentData.status || 'scheduled';
    formData.notes = props.appointmentData.notes || '';
  } else {
    formData.patient_id = '';
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
  initializeForm();
});

const submitForm = async () => {
  isSubmitting.value = true;
  formError.value = null;
  const token = getAccessTokenCookie();
  if (!token) {
    isSubmitting.value = false;
    return;
  }

  if (!formData.appointment_date || !formData.appointment_time) {
    formError.value = "Date and time are required.";
    isSubmitting.value = false;
    return;
  }

  let scheduled_at_iso;
  try {
    const [hours, minutes] = formData.appointment_time.split(':').map(Number);
    const dateObj = new Date(formData.appointment_date);
    dateObj.setHours(hours, minutes, 0, 0);

    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date or time combination.");
    }
    scheduled_at_iso = dateObj.toISOString();
  } catch (e) {
    formError.value = `Invalid date or time format: ${e.message}`;
    isSubmitting.value = false;
    return;
  }

  const payload = {
    patient_id: formData.patient_id,
    scheduled_at: scheduled_at_iso,
    reason: formData.reason,
    status: formData.status,
    notes: formData.notes,
  };

  try {
    let response;
    if (isEditing.value) {
      response = await axios.put(`${API_BASE_URL}/appointments/${props.appointmentData.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
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
