<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out" @click.self="closeModal">
    <div class="relative mx-auto p-6 border-0 w-full max-w-lg shadow-xl rounded-lg bg-white dark:bg-gray-800 transform transition-all duration-300 ease-in-out scale-95 group-hover:scale-100" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white" id="modal-title">
          {{ isEditing ? 'Edit Appointment' : 'Create New Appointment' }}
        </h3>
        <button @click="closeModal" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" aria-label="Close modal">
          <X class="w-5 h-5" />
        </button>
      </div>

      <form @submit.prevent="submitForm" class="mt-5 space-y-6">
        <!-- Error Message -->
        <div v-if="formError" class="p-3 bg-red-50 dark:bg-red-800/30 border border-red-300 dark:border-red-600 rounded-md text-red-600 dark:text-red-200 text-sm">
          {{ formError }}
        </div>

        <!-- Patient Selection -->
        <div>
          <label for="patient" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Patient</label>
          <div class="relative">
            <select
              id="patient"
              name="patient"
              v-model="formData.patient_id"
              required
              :disabled="isFetchingPatients"
              class="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white appearance-none"
            >
              <option disabled value="">{{ isFetchingPatients ? 'Loading patients...' : 'Select a patient' }}</option>
              <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                {{ patient.first_name }} {{ patient.last_name }} ({{ patient.phone }})
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
              <LoaderCircle v-if="isFetchingPatients" class="animate-spin h-5 w-5 text-blue-500" />
              <ChevronDown v-else class="h-5 w-5" />
            </div>
          </div>
        </div>

        <!-- Date -->
        <div>
          <label for="date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
          <DatePicker 
            v-model="formData.appointment_date"
            id="date"
            name="date"
            required
            class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <!-- Time -->
        <div>
          <label for="time" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
          <div class="flex space-x-2 mt-1">
            <select v-model="formData.appointment_hour" required class="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white appearance-none">
              <option disabled value="">HH</option>
              <option v-for="h in hoursOptions" :key="h" :value="h">{{ h }}</option>
            </select>
            <select v-model="formData.appointment_minute" required class="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white appearance-none">
              <option disabled value="">MM</option>
              <option v-for="m in minutesOptions" :key="m" :value="m">{{ m }}</option>
            </select>
             <select v-model="formData.appointment_ampm" required class="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white appearance-none">
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        <!-- Reason -->
        <div>
          <label for="reason" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
          <input
            type="text"
            id="reason"
            name="reason"
            v-model="formData.reason"
            placeholder="e.g., Check-up, Cleaning, Pain"
            class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <!-- Status -->
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            id="status"
            name="status"
            v-model="formData.status"
            class="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white appearance-none"
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <!-- Notes -->
        <div>
          <label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            v-model="formData.notes"
            rows="3"
            placeholder="Additional details about the appointment..."
            class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          ></textarea>
        </div>

        <!-- Buttons -->
        <div class="pt-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            :disabled="isSubmitting || isFetchingPatients"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-gray-800 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-60 transition-colors duration-150 ease-in-out"
          >
            <LoaderCircle v-if="isSubmitting" class="animate-spin h-5 w-5 mr-2" />
            {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Appointment') }}
          </button>
          <button
            type="button"
            @click="closeModal"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-gray-800 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-150 ease-in-out"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { LoaderCircle, X, ChevronDown } from 'lucide-vue-next';
import DatePicker from './DatePicker.vue'; // Import DatePicker

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
const isFetchingPatients = ref(false);

const formData = reactive({
  patient_id: '',
  appointment_date: new Date().toISOString().split('T')[0], // Will be set by DatePicker, default today
  appointment_hour: '', 
  appointment_minute: '',
  appointment_ampm: 'AM', 
  reason: '',
  status: 'scheduled',
  notes: ''
});

const hoursOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const minutesOptions = Array.from({ length: 60 / 5 }, (_, i) => (i * 5).toString().padStart(2, '0')); // 5 min intervals

const getAccessTokenCookie = () => {
  const token = Cookies.get('dental_access_token');
  if (!token) {
    emit('error', 'Authentication token not found. Please log in.');
    emit('close');
  }
  return token;
};

const fetchPatients = async (token) => {
  isFetchingPatients.value = true;
  formError.value = null; 
  try {
    const response = await axios.get(`${API_BASE_URL}/patients`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { per_page: 500 } // Consider if pagination is needed for very long lists
    });
    patients.value = response.data.patients || response.data.data || [];
    if (!Array.isArray(patients.value)) {
      console.warn('Fetched patients data is not an array:', patients.value);
      patients.value = [];
      formError.value = 'Could not load patients: Invalid data format.'; 
    }
  } catch (err) {
    console.error('Error fetching patients for form:', err);
    formError.value = 'Could not load patients list. Please try again later.';
    if (err.response && err.response.status === 401) {
      emit('error', 'Session expired.');
      emit('close');
    }
  } finally {
    isFetchingPatients.value = false;
  }
};

const initializeForm = () => {
  if (isEditing.value && props.appointmentData) {
    formData.patient_id = props.appointmentData.patient?.id || props.appointmentData.patient_id || '';
    // Ensure date is in YYYY-MM-DD for DatePicker if coming from props.appointmentData.date
    // If props.appointmentData.scheduled_at is available, prefer parsing from it for consistency
    if (props.appointmentData.scheduled_at) {
        const scheduledDate = new Date(props.appointmentData.scheduled_at);
        formData.appointment_date = scheduledDate.toISOString().split('T')[0];
        const h = scheduledDate.getHours();
        const m = scheduledDate.getMinutes();
        let hour12 = h % 12 || 12;
        formData.appointment_hour = hour12.toString().padStart(2, '0');
        formData.appointment_minute = m.toString().padStart(2, '0');
        formData.appointment_ampm = h >= 12 ? 'PM' : 'AM';
    } else if (props.appointmentData.date) { // Fallback to existing date/time props if scheduled_at is not there
        formData.appointment_date = props.appointmentData.date; 
        if (props.appointmentData.time) { // time is HH:MM (24h)
            const [h, m] = props.appointmentData.time.split(':').map(Number);
            let hour12 = h % 12 || 12; 
            formData.appointment_hour = hour12.toString().padStart(2, '0');
            formData.appointment_minute = m.toString().padStart(2, '0');
            formData.appointment_ampm = h >= 12 ? 'PM' : 'AM';
        } else {
            const now = new Date();
            formData.appointment_hour = (now.getHours() % 12 || 12).toString().padStart(2, '0');
            formData.appointment_minute = (Math.floor(now.getMinutes() / 5) * 5).toString().padStart(2, '0');
            formData.appointment_ampm = now.getHours() >= 12 ? 'PM' : 'AM';
        }
    } else {
        // Default if no date/time info at all in edit mode (should ideally not happen)
        formData.appointment_date = new Date().toISOString().split('T')[0];
        const now = new Date();
        formData.appointment_hour = (now.getHours() % 12 || 12).toString().padStart(2, '0');
        formData.appointment_minute = (Math.floor(now.getMinutes() / 5) * 5).toString().padStart(2, '0');
        formData.appointment_ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    }

    formData.reason = props.appointmentData.reason || '';
    formData.status = props.appointmentData.status || 'scheduled';
    formData.notes = props.appointmentData.notes || '';
  } else {
    // Defaults for new appointment
    formData.patient_id = '';
    formData.appointment_date = new Date().toISOString().split('T')[0];
    const now = new Date();
    formData.appointment_hour = (now.getHours() % 12 || 12).toString().padStart(2, '0');
    formData.appointment_minute = (Math.floor(now.getMinutes() / 5) * 5).toString().padStart(2, '0');
    formData.appointment_ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    formData.reason = '';
    formData.status = 'scheduled';
    formData.notes = '';
  }
  formError.value = null;
};

watch(() => props.appointmentData, initializeForm, { immediate: true, deep: true });

onMounted(async () => {
  const token = getAccessTokenCookie();
  if (!token) return;
  await fetchPatients(token);
  // initializeForm is called by watch now, so not strictly needed here unless patients list affects defaults
  // If default patient selection depends on the fetched list, re-evaluate initializeForm call timing
});

const submitForm = async () => {
  isSubmitting.value = true;
  formError.value = null;
  const token = getAccessTokenCookie();
  if (!token) {
    isSubmitting.value = false;
    return;
  }

  if (!formData.appointment_date || !formData.appointment_hour || !formData.appointment_minute || !formData.appointment_ampm) {
    formError.value = "Patient, date, and complete time are required.";
    isSubmitting.value = false;
    return;
  }
  if (!formData.patient_id) {
    formError.value = "Please select a patient.";
    isSubmitting.value = false;
    return;
  }

  let scheduled_at_iso;
  try {
    let hours24 = parseInt(formData.appointment_hour, 10);
    if (formData.appointment_ampm === 'PM' && hours24 !== 12) {
      hours24 += 12;
    } else if (formData.appointment_ampm === 'AM' && hours24 === 12) { // Midnight case: 12 AM is 00 hours
      hours24 = 0;
    }
    const minutes = parseInt(formData.appointment_minute, 10);
    
    // formData.appointment_date is already YYYY-MM-DD string from DatePicker
    const dateObj = new Date(formData.appointment_date);
    dateObj.setHours(hours24, minutes, 0, 0); // Set time on the chosen date

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
    patient_id: formData.patient_id ? Number(formData.patient_id) : null,
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

    emit('appointment-saved', response.data.appointment || response.data); // API might return {appointment: ...} or just the object
    closeModal();

  } catch (err) {
    console.error('Error saving appointment:', err);
    if (err.response) {
      if (err.response.status === 401) {
        formError.value = 'Session expired. Please log in again.';
        emit('error', 'Session expired.'); // Propagate error for parent to handle (e.g. redirect)
        emit('close');
      } else if (err.response.data && err.response.data.error) {
        formError.value = `Error: ${err.response.data.error}`;
      }  else if (err.response.data && err.response.data.message) { // Handle other common error message structures
        formError.value = `Error: ${err.response.data.message}`;
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
/* Improved focus rings and transitions */
input:focus,
select:focus,
textarea:focus,
.dp__input_focus { /* For vue3-datepicker if it uses this class */
  box-shadow: 0 0 0 2px theme('colors.blue.500');
  border-color: theme('colors.blue.500') !important; /* Important to override datepicker styles if needed */
}
.dark input:focus,
.dark select:focus,
.dark textarea:focus,
.dark .dp__input_focus {
  box-shadow: 0 0 0 2px theme('colors.blue.400');
  border-color: theme('colors.blue.400') !important;
}

/* Custom appearance for select to show custom arrow */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: none; 
  padding-right: 2.5rem; /* Space for custom arrow icon */
}
</style>
