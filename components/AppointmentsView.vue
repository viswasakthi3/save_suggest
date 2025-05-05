<template>
  <div>
    <h2 class="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Appointments</h2>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
      <span>{{ error }}</span>
      <button @click="clearError" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200">
        <X class="w-4 h-4" />
      </button>
    </div>
    <!-- Success Message -->
    <div v-if="successMessage" class="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-md text-green-700 dark:text-green-300 text-sm flex items-center justify-between">
      <span>{{ successMessage }}</span>
      <button @click="successMessage = null" class="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200">
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Controls -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4 flex-wrap">
        <!-- Filters can be added here later -->
        <span class="text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ appointments.length }} appointments</span>
      </div>
      <button @click="openCreateAppointmentForm" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center whitespace-nowrap">
        <Plus class="h-5 w-5 mr-2" />
        Create Appointment
      </button>
    </div>

    <!-- Appointments Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dentist</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reason</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-if="loading">
            <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              <LoaderCircle class="h-6 w-6 animate-spin inline-block mr-2" /> Loading appointments...
            </td>
          </tr>
          <tr v-else-if="appointments.length === 0">
            <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No appointments found.
            </td>
          </tr>
          <tr v-for="appointment in appointments" :key="appointment.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ appointment.patient?.name || 'N/A' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ appointment.dentist?.name || 'N/A' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ appointment.date }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ appointment.time }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{{ appointment.reason }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              <span :class="getStatusBadgeClass(appointment.status)">{{ appointment.status }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <button @click="openEditAppointmentForm(appointment)" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200">Edit</button>
              <button @click="deleteAppointment(appointment.id)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination (Optional - Add later if needed) -->

    <!-- Create/Edit Appointment Form Modal -->
    <CreateAppointmentForm
      v-if="showAppointmentForm"
      :appointment-data="editingAppointment"
      @close="closeAppointmentForm"
      @appointment-saved="handleAppointmentSaved"
      @error="handleFormError"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'vue-router';
import CreateAppointmentForm from '~/components/CreateAppointmentForm.vue'; // Assuming this component exists or will be created
import { Plus, X, LoaderCircle } from 'lucide-vue-next';

const router = useRouter();
const appointments = ref([]);
const loading = ref(true);
const error = ref(null);
const successMessage = ref(null);
const showAppointmentForm = ref(false);
const editingAppointment = ref(null);

const config = useRuntimeConfig();
const API_BASE_URL = config.public.API_BASE_URL;

const getAccessTokenCookie = () => {
  const token = Cookies.get('dental_access_token');
  if (!token) {
    // Redirect to login if no token
    router.push('/dentall/login');
  }
  return token;
};

const clearError = () => { error.value = null; };

const fetchAppointments = async () => {
  loading.value = true;
  clearError();
  successMessage.value = null;
  const token = getAccessTokenCookie();
  if (!token) return;

  try {
    const response = await axios.get(`${API_BASE_URL}/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { per_page: 100 } // Fetch more initially, add pagination later
    });
    appointments.value = response.data.appointments || [];
  } catch (err) {
    console.error('Error fetching appointments:', err);
    if (err.response && err.response.status === 401) {
      error.value = 'Session expired. Please log in again.';
      Cookies.remove('dental_access_token', { path: '/' });
      router.push('/dentall/login');
    } else {
      error.value = `Could not fetch appointments: ${err.message || 'Unknown error'}`;
    }
    appointments.value = [];
  } finally {
    loading.value = false;
  }
};

const openCreateAppointmentForm = () => {
  editingAppointment.value = null;
  clearError();
  showAppointmentForm.value = true;
};

const openEditAppointmentForm = (appointment) => {
  editingAppointment.value = { ...appointment }; // Create a copy to avoid modifying original directly
  clearError();
  showAppointmentForm.value = true;
};

const closeAppointmentForm = () => {
  showAppointmentForm.value = false;
  editingAppointment.value = null;
};

const handleAppointmentSaved = (savedAppointment) => {
  closeAppointmentForm();
  successMessage.value = editingAppointment.value ? 'Appointment updated successfully.' : 'Appointment created successfully.';
  fetchAppointments(); // Refresh the list
  setTimeout(() => { successMessage.value = null; }, 5000);
};

const handleFormError = (errorMessage) => {
  console.error('Error from Appointment Form:', errorMessage);
   if (errorMessage.includes('401') || errorMessage.toLowerCase().includes('session expired') || errorMessage.toLowerCase().includes('unauthorized')) {
    error.value = 'Session expired or invalid. Please log in again.';
    closeAppointmentForm();
    Cookies.remove('dental_access_token', { path: '/' });
    router.push('/dentall/login');
  } else {
    error.value = `Form Error: ${errorMessage}`;
  }
};

const deleteAppointment = async (appointmentId) => {
  if (!confirm('Are you sure you want to delete this appointment?')) {
    return;
  }

  loading.value = true; // Indicate activity
  clearError();
  const token = getAccessTokenCookie();
  if (!token) return;

  try {
    await axios.delete(`${API_BASE_URL}/appointments/${appointmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    successMessage.value = 'Appointment deleted successfully.';
    fetchAppointments(); // Refresh list
    setTimeout(() => { successMessage.value = null; }, 5000);
  } catch (err) {
    console.error(`Error deleting appointment ${appointmentId}:`, err);
     if (err.response && err.response.status === 401) {
      error.value = 'Session expired. Please log in again.';
      Cookies.remove('dental_access_token', { path: '/' });
      router.push('/dentall/login');
    } else {
      error.value = `Could not delete appointment: ${err.message || 'Unknown error'}`;
    }
  } finally {
    loading.value = false;
  }
};

const getStatusBadgeClass = (status) => {
  const base = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
  switch (status?.toLowerCase()) {
    case 'scheduled':
      return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
    case 'completed':
      return `${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
    case 'cancelled':
      return `${base} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
    case 'pending':
      return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
    default:
      return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
  }
};

onMounted(() => {
  fetchAppointments();
});
</script>

<style scoped>
/* Add any specific styles if needed */
</style>
