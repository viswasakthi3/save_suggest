<template>
  <div>
    <h2 class="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Appointments</h2>

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

    <!-- Controls & Tabs -->
    <div class="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex space-x-1 border border-gray-200 dark:border-gray-700 p-1 rounded-md">
        <button
          v-for="tab in tabs"
          :key="tab.status"
          @click="activeStatusFilter = tab.status"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out',
            activeStatusFilter === tab.status
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
      <button @click="openCreateAppointmentForm" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center whitespace-nowrap">
        <Plus class="h-5 w-5 mr-2" />
        Create Appointment
      </button>
    </div>

    <!-- Appointments Grouped by Date -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <LoaderCircle class="animate-spin h-12 w-12 text-blue-600" />
    </div>
    <div v-else-if="groupedAppointments.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
      <p class="text-xl mb-2">No appointments found.</p>
      <p>Try adjusting the filters or create a new appointment.</p>
    </div>

    <div v-else class="space-y-8">
      <div v-for="group in groupedAppointments" :key="group.date">
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">{{ formatDateGroup(group.date) }}</h3>
        <div class="space-y-4">
          <div
            v-for="appointment in group.appointments"
            :key="appointment.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200 ease-in-out"
          >
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div class="flex items-center mb-3 sm:mb-0">
                <div class="mr-4 text-center">
                  <p class="text-xs text-red-600 dark:text-red-400 font-semibold">{{ formatDayAbbreviation(appointment.scheduled_at) }}</p>
                  <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ formatDayNumber(appointment.scheduled_at) }}</p>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ formatTime(appointment.scheduled_at) }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ appointment.patient?.first_name }} {{ appointment.patient?.last_name }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-500">{{ appointment.reason || 'No reason provided' }}</p>
                </div>
              </div>

              <div class="flex items-center space-x-2 mt-3 sm:mt-0 w-full sm:w-auto justify-end">
                <span :class="getStatusBadgeClass(appointment.status)">{{ appointment.status }}</span>
                <div class="relative">
                  <button @click="toggleActionsDropdown(appointment.id)" class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                    <MoreVertical class="h-5 w-5" />
                  </button>
                  <div
                    v-if="activeActionsDropdown === appointment.id"
                    class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-xl z-20 border border-gray-200 dark:border-gray-700 py-1"
                  >
                    <button @click="openEditAppointmentForm(appointment)" class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                      <Edit3 class="h-4 w-4 mr-2" /> Edit
                    </button>
                    <button @click="deleteAppointment(appointment.id)" class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 flex items-center">
                      <Trash2 class="h-4 w-4 mr-2" /> Delete
                    </button>
                    <!-- Add more actions here if needed -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'vue-router';
import CreateAppointmentForm from '~/components/CreateAppointmentForm.vue';
import { Plus, X, LoaderCircle, MoreVertical, Edit3, Trash2 } from 'lucide-vue-next';

const router = useRouter();
const allAppointments = ref([]);
const loading = ref(true);
const error = ref(null);
const successMessage = ref(null);
const showAppointmentForm = ref(false);
const editingAppointment = ref(null);
const activeActionsDropdown = ref(null); // To control which dropdown is open

const config = useRuntimeConfig();
const API_BASE_URL = config.public.API_BASE_URL;

const tabs = [
  { label: 'Upcoming', status: 'scheduled' }, // Assuming 'scheduled' is upcoming
 
  // { label: 'Recurring', status: 'recurring' }, // If you have this status
  { label: 'Past', status: 'completed' }, // Assuming 'completed' is past
  { label: 'Cancelled', status: 'cancelled' },
];
const activeStatusFilter = ref('scheduled'); // Default to upcoming/scheduled

const getAccessTokenCookie = () => {
  const token = Cookies.get('dental_access_token');
  if (!token) {
    router.push('/dentall/login');
  }
  return token;
};

const clearError = () => { error.value = null; };

const fetchAppointments = async () => {
  loading.value = true;
  clearError();
  const token = getAccessTokenCookie();
  if (!token) return;

  try {
    const response = await axios.get(`${API_BASE_URL}/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { per_page: 200 }
    });
    allAppointments.value = response.data.appointments || [];
  } catch (err) {
    console.error('Error fetching appointments:', err);
    if (err.response && err.response.status === 401) {
      error.value = 'Session expired. Please log in again.';
      Cookies.remove('dental_access_token', { path: '/' });
      router.push('/dentall/login');
    } else {
      error.value = `Could not fetch appointments: ${err.message || 'Unknown error'}`;
    }
    allAppointments.value = [];
  } finally {
    loading.value = false;
  }
};

const filteredAppointments = computed(() => {
  if (!activeStatusFilter.value || activeStatusFilter.value === 'all') {
    return allAppointments.value;
  }
  return allAppointments.value.filter(app => app.status && app.status.toLowerCase() === activeStatusFilter.value.toLowerCase());
});

const groupedAppointments = computed(() => {
  const groups = {};
  filteredAppointments.value
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    .forEach(appointment => {
      const date = appointment.scheduled_at.split('T')[0];
      if (!groups[date]) {
        groups[date] = { date: date, appointments: [] };
      }
      groups[date].appointments.push(appointment);
    });
  return Object.values(groups);
});

const formatDateGroup = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
};

const formatDayAbbreviation = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
};

const formatDayNumber = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.getDate();
};

const formatTime = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
};

const openCreateAppointmentForm = () => {
  editingAppointment.value = null;
  clearError();
  activeActionsDropdown.value = null;
  showAppointmentForm.value = true;
};

const openEditAppointmentForm = (appointment) => {
  editingAppointment.value = { 
    ...appointment, 
    date: appointment.scheduled_at?.split('T')[0],
    time: appointment.scheduled_at?.split('T')[1]?.substring(0,5)
  }; 
  clearError();
  activeActionsDropdown.value = null;
  showAppointmentForm.value = true;
};

const closeAppointmentForm = () => {
  showAppointmentForm.value = false;
  editingAppointment.value = null;
};

const handleAppointmentSaved = (savedAppointment) => {
  closeAppointmentForm();
  successMessage.value = editingAppointment.value ? 'Appointment updated successfully.' : 'Appointment created successfully.';
  fetchAppointments();
  setTimeout(() => { successMessage.value = null; }, 3000);
};

const handleFormError = (errorMessage) => {
  console.error('Error from Appointment Form:', errorMessage);
   if (errorMessage.includes('401') || errorMessage.toLowerCase().includes('session expired') || errorMessage.toLowerCase().includes('unauthorized')) {
    error.value = 'Session expired or invalid. Please log in again.';
    closeAppointmentForm();
    Cookies.remove('dental_access_token', { path: '/' });
    router.push('/dentall/login');
  }
};

const deleteAppointment = async (appointmentId) => {
  if (!confirm('Are you sure you want to delete this appointment?')) {
    return;
  }
  activeActionsDropdown.value = null;
  loading.value = true; 
  clearError();
  const token = getAccessTokenCookie();
  if (!token) return;

  try {
    await axios.delete(`${API_BASE_URL}/appointments/${appointmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    successMessage.value = 'Appointment deleted successfully.';
    fetchAppointments();
    setTimeout(() => { successMessage.value = null; }, 3000);
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
  const base = 'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap';
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

const toggleActionsDropdown = (appointmentId) => {
  if (activeActionsDropdown.value === appointmentId) {
    activeActionsDropdown.value = null;
  } else {
    activeActionsDropdown.value = appointmentId;
  }
};

onMounted(() => {
  fetchAppointments();
  const handleClickOutside = (event) => {
    if (activeActionsDropdown.value && !event.target.closest('.relative')) {
      activeActionsDropdown.value = null;
    }
  };
  document.addEventListener('click', handleClickOutside);
  return () => {
    document.removeEventListener('click', handleClickOutside);
  };
});

</script>

<style scoped>
/* Add any specific styles if needed */
</style>
