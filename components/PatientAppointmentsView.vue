<template>
  <div class="mt-6">
    <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Patient Appointments</h3>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-sm">
      <span>{{ error }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <LoaderCircle class="animate-spin h-10 w-10 text-blue-600" />
    </div>

    <!-- No Appointments Message -->
    <div v-else-if="!appointments || appointments.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400">
      <p>No appointments found for this patient.</p>
    </div>

    <!-- Appointments List -->
    <div v-else class="space-y-6">
      <div v-for="group in groupedAppointments" :key="group.date" class="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <h4 class="text-md font-semibold text-gray-600 dark:text-gray-300 mb-3">{{ formatDateGroup(group.date) }}</h4>
        <ul class="space-y-3">
          <li v-for="appointment in group.appointments" :key="appointment.id" class="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-150 ease-in-out">
            <div class="flex-grow">
              <p class="text-sm font-medium text-gray-800 dark:text-white">{{ appointment.treatment || 'No treatment specified' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatTime(appointment.scheduled_at) }}
                <span v-if="appointment.reason" class="ml-2">- {{ appointment.reason }}</span>
              </p>
            </div>
            <span :class="getStatusBadgeClass(appointment.status)" class="text-xs px-2 py-0.5 rounded-full">
              {{ appointment.status }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'vue-router';
import { LoaderCircle } from 'lucide-vue-next';

const props = defineProps({
  patientId: {
    type: [String, Number],
    required: true,
  },
});

const router = useRouter();
const appointments = ref([]);
const loading = ref(true);
const error = ref(null);

const config = useRuntimeConfig();
const API_BASE_URL = config.public.API_BASE_URL;

const getAccessTokenCookie = () => {
  const token = Cookies.get('dental_access_token');
  if (!token) {
    // No need to redirect from a sub-component, parent view should handle auth.
    // Consider emitting an event or letting the parent handle global auth issues.
    console.warn('Access token not found.');
  }
  return token;
};

const fetchPatientAppointments = async (id) => {
  if (!id) {
    appointments.value = [];
    loading.value = false;
    return;
  }
  loading.value = true;
  error.value = null;
  const token = getAccessTokenCookie();
  if (!token) {
    error.value = 'Authentication token not found. Please log in again.';
    loading.value = false;
    // Potentially redirect or emit an auth error
     // router.push('/dentall/login'); // Avoid direct navigation from a child component
    return;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/patients/${id}/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { per_page: 50 } // Fetch a reasonable number for a detail view
    });
    appointments.value = response.data.appointments || [];
  } catch (err) {
    console.error('Error fetching patient appointments:', err);
    if (err.response && err.response.status === 401) {
      error.value = 'Session expired. Please log in again.';
      // Cookies.remove('dental_access_token', { path: '/' }); // Avoid direct cookie manipulation here
      // router.push('/dentall/login'); // Avoid direct navigation
    } else if (err.response && err.response.status === 404) {
      error.value = 'Patient appointments not found.';
      appointments.value = [];
    }
    else {
      error.value = `Could not fetch patient appointments: ${err.message || 'Unknown error'}`;
    }
  } finally {
    loading.value = false;
  }
};

const groupedAppointments = computed(() => {
  const groups = {};
  if (!appointments.value) return [];

  const sortedAppointments = [...appointments.value].sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at)); // Show newest first within a day

  sortedAppointments.forEach(appointment => {
    const date = appointment.scheduled_at ? appointment.scheduled_at.split('T')[0] : 'Unknown Date';
    if (!groups[date]) {
      groups[date] = {
        date: date,
        appointments: []
      };
    }
    groups[date].appointments.push(appointment);
  });
  
  return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort groups by date, newest first
});

const formatDateGroup = (dateString) => {
  if (dateString === 'Unknown Date') return 'Unknown Date';
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};

const formatTime = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
};

const getStatusBadgeClass = (status) => {
  const base = 'text-xs px-2 py-0.5 font-medium rounded-full whitespace-nowrap';
  switch (status?.toLowerCase()) {
    case 'scheduled': return `${base} bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100`;
    case 'completed': return `${base} bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100`;
    case 'cancelled': return `${base} bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100`;
    case 'pending': return `${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100`;
    default: return `${base} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100`;
  }
};

onMounted(() => {
  if (props.patientId) {
    fetchPatientAppointments(props.patientId);
  }
});

watch(() => props.patientId, (newId) => {
  if (newId) {
    fetchPatientAppointments(newId);
  } else {
    appointments.value = []; // Clear appointments if patientId becomes null/undefined
  }
}, { immediate: true });

</script>

<style scoped>
/* Scoped styles for PatientAppointmentsView if needed */
.mt-6 { /* Add some top margin */
  margin-top: 1.5rem;
}
.mb-4 {
  margin-bottom: 1rem;
}
/* Further width adjustments can be done via parent container or here if necessary */
</style>
