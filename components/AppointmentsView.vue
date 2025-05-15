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
      
      <!-- Sort By Dropdown -->
      <div class="relative">
        <select 
          v-model="currentSortOption"
          @change="sortAppointments"
          class="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-auto p-2.5 pr-8 appearance-none"
        >
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
          <ChevronDown class="h-4 w-4" />
        </div>
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
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <!-- Left side: Date, Patient Info, Reason -->
              <div class="flex-grow mb-3 sm:mb-0 min-w-0 pr-4">
                <div class="flex items-start">
                  <div class="mr-4 text-center flex-shrink-0">
                    <p class="text-xs text-red-600 dark:text-red-400 font-semibold">{{ formatDayAbbreviation(appointment.scheduled_at) }}</p>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ formatDayNumber(appointment.scheduled_at) }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatTime(appointment.scheduled_at) }}</p>
                  </div>
                  <div class="flex-grow min-w-0">
                    <div class="flex items-baseline flex-wrap">
                      <p class="text-md font-semibold text-gray-800 dark:text-gray-100 truncate mr-2">{{ appointment.patient?.first_name }} {{ appointment.patient?.last_name }}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ appointment.patient?.phone }}</p>
                    </div>
                    <p class="text-xs text-gray-600 dark:text-gray-300 mt-1 italic truncate">{{ appointment.reason || '-' }}</p>
                  </div>
                </div>
              </div>

              <!-- Right side: Status and Actions -->
              <div class="flex flex-col items-start sm:items-end sm:flex-row sm:items-center sm:space-x-3 mt-4 sm:mt-0 flex-shrink-0">
                <!-- Status Dropdown -->
                <div class="relative mb-2 sm:mb-0 w-full sm:w-auto">
                  <button
                    @click="toggleStatusDropdown(appointment.id)"
                    :class="['w-full sm:w-auto px-3 py-1 inline-flex items-center justify-center text-xs leading-5 font-semibold rounded-full whitespace-nowrap cursor-pointer', getStatusBadgeClass(appointment.status)]"
                  >
                    <span>{{ appointment.status }}</span>
                    <ChevronDown class="h-4 w-4 ml-1.5 flex-shrink-0" />
                  </button>
                  <div
                    v-if="activeStatusDropdown === appointment.id"
                    class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-xl z-50 border border-gray-200 dark:border-gray-700 py-1"
                  >
                    <button
                      v-for="statusOption in availableStatuses"
                      :key="statusOption.value"
                      @click="updateAppointmentStatus(appointment, statusOption.value)"
                      :class="['w-full text-left px-4 py-2 text-sm flex items-center', statusOption.value === appointment.status ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700']"
                    >
                      <span :class="['w-3 h-3 rounded-full mr-2 flex-shrink-0', getStatusBadgeClass(statusOption.value).split(' ').filter(c => c.startsWith('bg-') || c.startsWith('dark:bg-')).join(' ')]"></span>
                      {{ statusOption.label }}
                    </button>
                  </div>
                </div>
                <!-- Actions -->
                <div class="flex items-center space-x-2">
                  <button @click="openEditAppointmentForm(appointment)" class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center text-sm">
                    <Edit3 class="h-4 w-4 mr-0 md:mr-1 flex-shrink-0" /> <span class="hidden md:inline"> </span>
                  </button>
                  <button @click="deleteAppointment(appointment.id)" class="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center text-sm">
                    <Trash2 class="h-4 w-4 mr-0 md:mr-1 flex-shrink-0" /> <span class="hidden md:inline"> </span>
                  </button>
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
import { Plus, X, LoaderCircle, Edit3, Trash2, ChevronDown } from 'lucide-vue-next';

const router = useRouter();
const allAppointments = ref([]);
const loading = ref(true);
const error = ref(null);
const successMessage = ref(null);
const showAppointmentForm = ref(false);
const editingAppointment = ref(null);
const activeStatusDropdown = ref(null);

// Sorting state and options
const currentSortOption = ref('scheduled_at_asc'); // Default sort
const sortOptions = [
  { value: 'scheduled_at_asc', label: 'Sort by Schedule Date (Oldest First)' },
  { value: 'scheduled_at_desc', label: 'Sort by Schedule Date (Newest First)' },
  { value: 'created_at_asc', label: 'Sort by Creation Date (Oldest First)' },
  { value: 'created_at_desc', label: 'Sort by Creation Date (Newest First)' },
  { value: 'patient_name_asc', label: 'Sort by Patient Name (A-Z)' },
  { value: 'patient_name_desc', label: 'Sort by Patient Name (Z-A)' },
];

const config = useRuntimeConfig();
const API_BASE_URL = config.public.API_BASE_URL;

const tabs = [
  { label: 'Upcoming', status: 'scheduled' },
  { label: 'Completed', status: 'completed' },
  { label: 'Cancelled', status: 'cancelled' },
  { label: 'Pending', status: 'pending' },
  { label: 'All', status: 'all' },
];
const activeStatusFilter = ref('scheduled');

const availableStatuses = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'pending', label: 'Pending' },
];

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
  let appointmentsToFilter = [...allAppointments.value];
  if (activeStatusFilter.value && activeStatusFilter.value.toLowerCase() !== 'all') {
    appointmentsToFilter = appointmentsToFilter.filter(app => app.status && app.status.toLowerCase() === activeStatusFilter.value.toLowerCase());
  }
  return appointmentsToFilter; // Sorting will be applied in groupedAppointments
});

const sortAppointments = () => {
  // This function will trigger the re-computation of groupedAppointments
  // The actual sorting logic is within the groupedAppointments computed property
  // We just need to make sure Vue knows currentSortOption has changed if it's used directly in template
  // or force a re-render if necessary, but computed properties handle this well.
};

const groupedAppointments = computed(() => {
  const groups = {};
  let sortedAppointments = [...filteredAppointments.value];

  // Apply sorting based on currentSortOption.value
  switch (currentSortOption.value) {
    case 'scheduled_at_asc':
      sortedAppointments.sort((a, b) => {
        const timeA = new Date(a.scheduled_at).getTime();
        const timeB = new Date(b.scheduled_at).getTime();
        if (timeA !== timeB) return timeA - timeB;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // Secondary sort by creation desc
      });
      break;
    case 'scheduled_at_desc':
      sortedAppointments.sort((a, b) => {
        const timeA = new Date(a.scheduled_at).getTime();
        const timeB = new Date(b.scheduled_at).getTime();
        if (timeA !== timeB) return timeB - timeA;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // Secondary sort by creation desc
      });
      break;
    case 'created_at_asc':
      sortedAppointments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      break;
    case 'created_at_desc':
      sortedAppointments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case 'patient_name_asc':
      sortedAppointments.sort((a, b) => 
        `${a.patient?.first_name} ${a.patient?.last_name}`.localeCompare(`${b.patient?.first_name} ${b.patient?.last_name}`)
      );
      break;
    case 'patient_name_desc':
      sortedAppointments.sort((a, b) => 
        `${b.patient?.first_name} ${b.patient?.last_name}`.localeCompare(`${a.patient?.first_name} ${a.patient?.last_name}`)
      );
      break;
  }

  sortedAppointments.forEach(appointment => {
    const date = appointment.scheduled_at.split('T')[0];
    if (!groups[date]) {
      groups[date] = { date: date, appointments: [] };
    }
    groups[date].appointments.push(appointment);
  });

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  return Object.values(groups).sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    // Prioritize "Today" and "Tomorrow" groups only when sorting by scheduled_at_asc
    if (currentSortOption.value === 'scheduled_at_asc') {
      if (a.date === todayStr && b.date !== todayStr) return -1;
      if (b.date === todayStr && a.date !== todayStr) return 1;
      
      // After Today, comes Tomorrow
      if (a.date === tomorrowStr && b.date !== todayStr && b.date !== tomorrowStr) return -1;
      if (b.date === tomorrowStr && a.date !== todayStr && a.date !== tomorrowStr) return 1;
      
      // Ensure Today is before Tomorrow if both are present and not handled above
      if (a.date === todayStr && b.date === tomorrowStr) return -1;
      if (a.date === tomorrowStr && b.date === todayStr) return 1;
    }
    
    // For scheduled_at_desc, the natural reverse chronological order is usually desired.
    // If specific pinning of Today/Tomorrow at the end is needed for desc sort, that logic would go here.
    // Otherwise, they will appear based on their date relative to others.

    // Default chronological sort for groups if not scheduled_at_asc or if dates are not Today/Tomorrow
    if (currentSortOption.value.includes('_desc')) {
        return dateB - dateA; // For descending sorts, sort groups newest to oldest
    }
    return dateA - dateB; // For ascending sorts (and others), sort groups oldest to newest
  });
});

const formatDateGroup = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
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
  activeStatusDropdown.value = null;
  showAppointmentForm.value = true;
};

const openEditAppointmentForm = (appointment) => {
  editingAppointment.value = {
    ...appointment,
    date: appointment.scheduled_at?.split('T')[0],
    time: appointment.scheduled_at?.split('T')[1]?.substring(0,5)
  };
  clearError();
  activeStatusDropdown.value = null;
  showAppointmentForm.value = true;
};

const closeAppointmentForm = () => {
  showAppointmentForm.value = false;
  editingAppointment.value = null;
};

const handleAppointmentSaved = (savedAppointment) => {
  closeAppointmentForm();
  successMessage.value = editingAppointment.value ? 'Appointment updated successfully.' : 'Appointment created successfully.';
  const index = allAppointments.value.findIndex(app => app.id === savedAppointment.id);
  if (index !== -1) {
    allAppointments.value[index] = { ...allAppointments.value[index], ...savedAppointment };
  } else {
    allAppointments.value.push(savedAppointment);
  }
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
  activeStatusDropdown.value = null;
  loading.value = true;
  clearError();
  const token = getAccessTokenCookie();
  if (!token) return;

  try {
    await axios.delete(`${API_BASE_URL}/appointments/${appointmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    successMessage.value = 'Appointment deleted successfully.';
    allAppointments.value = allAppointments.value.filter(app => app.id !== appointmentId);
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

const updateAppointmentStatus = async (appointment, newStatus) => {
  if (appointment.status === newStatus) {
    activeStatusDropdown.value = null;
    return;
  }

  const originalStatus = appointment.status;
  const appointmentIndex = allAppointments.value.findIndex(a => a.id === appointment.id);
  if (appointmentIndex !== -1) {
    allAppointments.value[appointmentIndex].status = newStatus;
  }
  activeStatusDropdown.value = null;

  const token = getAccessTokenCookie();
  if (!token) {
    if (appointmentIndex !== -1) allAppointments.value[appointmentIndex].status = originalStatus;
    return;
  }

  try {
    await axios.put(`${API_BASE_URL}/appointments/${appointment.id}`, 
      { 
        status: newStatus,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    successMessage.value = `Appointment status updated to ${newStatus}.`;
    setTimeout(() => { successMessage.value = null; }, 3000);
  } catch (err) {
    console.error(`Error updating appointment ${appointment.id} status:`, err);
    if (appointmentIndex !== -1) {
      allAppointments.value[appointmentIndex].status = originalStatus;
    }
    if (err.response && err.response.status === 401) {
      error.value = 'Session expired. Please log in again.';
      Cookies.remove('dental_access_token', { path: '/' });
      router.push('/dentall/login');
    } else {
      error.value = `Could not update status: ${err.message || 'Unknown error'}`;
    }
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

const toggleStatusDropdown = (appointmentId) => {
  if (activeStatusDropdown.value === appointmentId) {
    activeStatusDropdown.value = null;
  } else {
    activeStatusDropdown.value = appointmentId;
  }
};

onMounted(() => {
  fetchAppointments();
  const handleClickOutside = (event) => {
    const statusDropdownElement = event.target.closest('.relative');
    if (activeStatusDropdown.value && (!statusDropdownElement || !statusDropdownElement.contains(event.target))) {
      activeStatusDropdown.value = null;
    }
  };
  document.addEventListener('click', handleClickOutside);
  return () => {
    document.removeEventListener('click', handleClickOutside);
  };
});

</script>

<style scoped>
/* Ensure dropdowns appear above other elements */
.relative .absolute {
  z-index: 50; /* Higher z-index for dropdowns */
}

/* Optional: Add specific styles for the new layout if needed */
</style>
