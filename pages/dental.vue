<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-800 text-white flex flex-col">
      <div class="p-4 border-b border-gray-700 flex items-center">
        <Stethoscope class="h-8 w-8 mr-2 text-blue-400" />
        <h1 class="text-xl font-semibold">DentalTrack</h1>
      </div>
      <nav class="mt-4 flex-1">
        <ul>
          <li @click="setView('dashboard')" :class="{'bg-gray-900': currentView === 'dashboard'}" class="px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center">
            <LayoutDashboard class="h-5 w-5 mr-3" />
            Dashboard
          </li>
          <li @click="setView('patients')" :class="{'bg-gray-900': currentView === 'patients' || currentView === 'records'}" class="px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center">
            <Users class="h-5 w-5 mr-3" />
            Patients
          </li>
          <li @click="setView('appointments')" :class="{'sbg-gray-900': currentView === 'appointments'}" class="px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center">
            <CalendarDays class="h-5 w-5 mr-3" />
            Appointments
          </li>
          <li :class="{'bg-gray-900': currentView === 'records'}" class="px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center" :style="{ opacity: currentView !== 'records' ? 0.5 : 1 }">
            <FileText class="h-5 w-5 mr-3" />
            Dental Records
          </li>
        </ul>
      </nav>
      <div class="p-4 border-t border-gray-700">
        <ul>
          <li class="px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center">
            <Settings class="h-5 w-5 mr-3" />
            Settings
          </li>
          <li class="px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center">
            <CircleHelp class="h-5 w-5 mr-3" />
            Help
          </li>
          <li @click="handleLogout" class="px-4 py-2 hover:bg-red-700 cursor-pointer flex items-center text-red-400 hover:text-white">
            <LogOut class="h-5 w-5 mr-3" />
            Logout
          </li>
        </ul>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden relative">
      <!-- Loading Overlay -->
      <div v-if="loading || (currentView === 'records' && recordsLoading) || (currentView === 'appointments' && appointmentsLoading)" class="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-50">
        <LoaderCircle class="h-12 w-12 animate-spin text-blue-600" />
      </div>

      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-end items-center">
        <button class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded mr-4 flex items-center">
          <CircleHelp class="h-5 w-5 mr-2" />
          Help
        </button>
        <!-- Make user info clickable -->
        <div v-if="user" @click="setView('profile')" class="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md">
          <div class="bg-blue-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-semibold mr-2 uppercase">
            {{ user.username ? user.username.substring(0, 2) : 'U' }}
          </div>
          <span class="dark:text-white">{{ user.username || 'User' }}</span>
          <span v-if="user.role" class="ml-2 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">{{ user.role }}</span>
        </div>
        <div v-else-if="!loading" class="flex items-center">
          <div class="bg-gray-300 rounded-full h-8 w-8 flex items-center justify-center mr-2"></div>
          <span class="text-gray-500 dark:text-gray-400">Loading user...</span>
        </div>
      </header>

      <!-- View Container -->
      <div class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">

        <!-- Dashboard View (Placeholder) -->
        <div v-if="currentView === 'dashboard'">
          <h2 class="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Dashboard</h2>
          <p class="text-gray-600 dark:text-gray-400">Welcome to DentalTrack! Select an option from the sidebar.</p>
        </div>

        <!-- Patients List View -->
        <div v-if="currentView === 'patients'">
          <h2 class="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Patients</h2>
          <div v-if="error" class="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
            <span>{{ error }}</span>
            <button @click="clearError" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200">
              <X class="w-4 h-4" />
            </button>
          </div>
          <div v-if="successMessage" class="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-md text-green-700 dark:text-green-300 text-sm flex items-center justify-between">
            <span>{{ successMessage }}</span>
            <button @click="successMessage = null" class="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 flex items-center justify-between flex-wrap gap-4">
            <div class="relative flex-grow min-w-[200px]">
              <input
                v-model="searchTerm"
                type="text"
                placeholder="Search patients..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <div class="flex items-center gap-4">
              <span class="text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ filteredPatients.length }} patients</span>
              <button @click="openAddPatientForm" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center whitespace-nowrap">
                <Plus class="h-5 w-5 mr-2" />
                Add Patient
              </button>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Age</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gender</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Address</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-if="!loading && filteredPatients.length === 0">
                  <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {{ searchTerm ? 'No patients match your search.' : 'No patients found.' }}
                  </td>
                </tr>
                <tr v-for="patient in filteredPatients" :key="patient.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ patient.first_name }} {{ patient.last_name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ calculateAge(patient.date_of_birth) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ patient.gender }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ patient.email }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ patient.phone }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ patient.address }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button @click="viewRecords(patient)" class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded flex items-center">
                      <FileText class="h-4 w-4 mr-1" /> Records
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Appointments View -->
        <div v-if="currentView === 'appointments'">
          <AppointmentsView 
            ref="appointmentsViewRef" 
            @loading-state="handleAppointmentsLoading" 
            @error="handleAppointmentsError"
          />
        </div>

        <!-- Patient Records View -->
        <div v-if="currentView === 'records'">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-semibold text-gray-800 dark:text-white">Dental Records for {{ selectedPatientName }}</h2>
            <button @click="setView('patients')" class="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded flex items-center">
              <ArrowLeft class="h-5 w-5 mr-2" /> Back to Patients
            </button>
          </div>

          <div v-if="recordsError" class="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
            <span>{{ recordsError }}</span>
            <button @click="clearError" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-1">
              <DentalChart
                :patient-id="selectedPatientId"
                @add-record-for-tooth="handleAddRecordForTooth"
              />
            </div>
            <div class="lg:col-span-2">
              <DentalRecordsTable
                :records="patientRecords"
                :loading="recordsLoading"
                @edit-record="handleEditRecord"
                @view-details="handleViewDetails" 
              />
              <button @click="handleAddRecord" class="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded flex items-center">
                <Plus class="h-5 w-5 mr-2" /> Add New Record
              </button>
            </div>
          </div>
        </div>

        <!-- User Profile View -->
        <!-- The UserProfile component (which contains the edit button and form logic) is rendered here when currentView is 'profile' -->
        <div v-if="currentView === 'profile'">
          <UserProfile />
        </div>

      </div>

      <!-- Add Patient Form Modal -->
      <AddPatientForm
        v-if="showAddPatientForm"
        @close="showAddPatientForm = false"
        @patient-added="handlePatientAdded"
        @error="handleFormError"
      />

      <!-- Add/Edit Record Form Modal -->
      <RecordForm
        v-if="showRecordForm"
        :patient-id="selectedPatientId"
        :record-data="editingRecord"
        :initial-tooth-number="toothNumberToAdd"
        @close="closeRecordForm"
        @record-saved="handleRecordSaved"
        @error="handleRecordFormError"
      />
    </main>
  </div>
</template>

<script setup>
import AddPatientForm from '~/components/AddPatientForm.vue';
import DentalChart from '~/components/DentalChart.vue';
import DentalRecordsTable from '~/components/DentalRecordsTable.vue';
import RecordForm from '~/components/RecordForm.vue';
import AppointmentsView from '~/components/AppointmentsView.vue';
import UserProfile from '~/components/UserProfile.vue'; // Import UserProfile component
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import Cookies from 'js-cookie';
import {
  Stethoscope,
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Settings,
  CircleHelp,
  Search,
  Plus,
  LogOut,
  LoaderCircle,
  X,
  ArrowLeft
} from 'lucide-vue-next';

const router = useRouter();
const patients = ref([]);
const loading = ref(true);
const error = ref(null);
const user = ref(null);
const showAddPatientForm = ref(false);
const successMessage = ref(null);
const searchTerm = ref('');

// View Management
const currentView = ref('dashboard');

// State for Records View
const selectedPatientId = ref(null);
const selectedPatientName = ref('');
const patientRecords = ref([]); // This will now store the dental_records array from the new API
const recordsLoading = ref(false);
const recordsError = ref(null);
const showRecordForm = ref(false);
const editingRecord = ref(null);
const toothNumberToAdd = ref(null);

// State for Appointments View
const appointmentsLoading = ref(false);
const appointmentsError = ref(null);
const appointmentsViewRef = ref(null);

const config = useRuntimeConfig();
const getAccessTokenCookie = () => {
  const token = Cookies.get('dental_access_token');
  if (!token) {
    handleLogout();
  }
  return token;
};

const clearError = () => {
  error.value = null;
  recordsError.value = null;
  appointmentsError.value = null;
};

const setView = (view) => {
  clearError();
  currentView.value = view;
  if (view !== 'records') {
    selectedPatientId.value = null;
    selectedPatientName.value = '';
    patientRecords.value = [];
  }
};

const fetchPatients = async (token) => {
  successMessage.value = null;
  try {
    const response = await axios.get(`${config.public.API_BASE_URL}/patients`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const fetchedData = response.data.patients || response.data;
    if (Array.isArray(fetchedData)) {
      patients.value = fetchedData;
    } else {
      console.warn('Fetched patients data is not an array:', fetchedData);
      patients.value = [];
      throw new Error('Invalid patients data format');
    }
  } catch (err) {
    console.error('Error fetching patients:', err);
    patients.value = [];
    if (err.response && err.response.status === 401) {
      error.value = 'Session expired. Please log in again.';
      handleLogout();
    } else {
      error.value = `Could not fetch patient data: ${err.message || 'Unknown error'}`;
    }
  }
};

const fetchUserProfile = async (token) => {
  try {
    const response = await axios.get(`${config.public.API_BASE_URL}/api/dental/auth/user-profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (response.data && response.data.success && response.data.user) {
      user.value = response.data.user;
    } else {
      throw new Error('Invalid user profile response format');
    }
  } catch (err) {
    console.error('Error fetching user profile:', err);
    error.value = 'Failed to fetch user profile. Please try refreshing the page or log in again if the issue persists.';
    user.value = null;
  }
};

const handleLogout = () => {
  Cookies.remove('dental_access_token', { path: '/' });
  user.value = null;
  patients.value = [];
  setView('dashboard');
  router.push('/dentall/login');
};

onMounted(async () => {
  loading.value = true;
  clearError();
  const token = getAccessTokenCookie();

  if (!token) {
    return;
  }

  await fetchUserProfile(token);

  if (user.value) {
    await fetchPatients(token);
  } else if (!error.value) {
    error.value = 'Could not load user information. Please try refreshing.';
  }

  loading.value = false;
});

const openAddPatientForm = () => {
  clearError();
  successMessage.value = null;
  showAddPatientForm.value = true;
};

const handlePatientAdded = async (patientId) => {
  showAddPatientForm.value = false;
  successMessage.value = `Patient added successfully. Refreshing list...`;
  loading.value = true;
  const token = getAccessTokenCookie();
  if (token) {
    await fetchPatients(token);
  } else {
    error.value = 'Authentication token missing. Cannot refresh list.';
    handleLogout();
  }
  loading.value = false;
  setTimeout(() => { successMessage.value = null; }, 5000);
};

const handleFormError = (errorMessage) => {
  console.error('Error from AddPatientForm:', errorMessage);
  if (errorMessage === 'Session expired.' || errorMessage === 'Authentication token not found.') {
    error.value = 'Session expired or invalid. Please log in again.';
    showAddPatientForm.value = false;
    handleLogout();
  } else {
    error.value = errorMessage;
  }
};

// --- Records View Logic ---

const fetchPatientRecords = async (patientId) => {
  recordsLoading.value = true;
  recordsError.value = null;
  patientRecords.value = []; // Clear previous records
  const token = getAccessTokenCookie();
  if (!token) {
    recordsError.value = 'Authentication token missing.';
    recordsLoading.value = false;
    handleLogout(); // Added to ensure logout if token is missing here
    return;
  }

  try {
    // Use the new endpoint to fetch comprehensive dental data for the patient
    const response = await axios.get(`${config.public.API_BASE_URL}/patients/${patientId}/dental-records`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // The new API returns an object with patient info, dental_records, and recent_appointments
    if (response.data) {
      patientRecords.value = response.data.dental_records || [];
      if (response.data.patient) {
        selectedPatientName.value = `${response.data.patient.first_name || ''} ${response.data.patient.last_name || ''}`.trim();
      }
      // response.data.recent_appointments could be stored and used if needed elsewhere
    } else {
      patientRecords.value = [];
    }

  } catch (err) {
    console.error(`Error fetching dental records for patient ${patientId}:`, err);
    if (err.response && err.response.status === 401) {
      recordsError.value = 'Session expired. Please log in again.';
      handleLogout();
    } else {
      recordsError.value = `Could not fetch dental records: ${err.message || 'Unknown error'}`;
    }
    patientRecords.value = [];
  } finally {
    recordsLoading.value = false;
  }
};

const viewRecords = (patient) => {
  if (!patient || !patient.id) return;
  selectedPatientId.value = patient.id;
  // selectedPatientName is now set within fetchPatientRecords from the API response
  setView('records');
  fetchPatientRecords(patient.id);
};

const handleAddRecord = () => {
  editingRecord.value = null;
  toothNumberToAdd.value = null;
  recordsError.value = null;
  showRecordForm.value = true;
};

const handleAddRecordForTooth = (toothNumber) => {
  editingRecord.value = null;
  toothNumberToAdd.value = toothNumber;
  recordsError.value = null;
  showRecordForm.value = true;
};

const handleEditRecord = (record) => {
  // record is now a dental_record object from the patientRecords.value array
  editingRecord.value = JSON.parse(JSON.stringify(record)); // Deep copy to avoid modifying original
  toothNumberToAdd.value = null; // Not adding by tooth number when editing
  recordsError.value = null;
  showRecordForm.value = true;
};

const handleViewDetails = (record) => {
  // record is a dental_record object
  console.log('Viewing Dental Record Details:', record);
  handleEditRecord(record); // Open in edit mode to see details
};

const closeRecordForm = () => {
  showRecordForm.value = false;
  editingRecord.value = null;
  toothNumberToAdd.value = null;
};

const handleRecordSaved = async (savedData) => {
  closeRecordForm();
  successMessage.value = editingRecord.value ? 'Dental record updated successfully.' : 'Dental record created successfully.';
  if (selectedPatientId.value) {
    await fetchPatientRecords(selectedPatientId.value); // Refresh records for the current patient
  }
  setTimeout(() => { successMessage.value = null; }, 5000);
};

const handleRecordFormError = (errorMessage) => {
  console.error('Error from RecordForm:', errorMessage);
  if (errorMessage === 'Session expired.' || errorMessage === 'Authentication token not found. Please log in.') {
    recordsError.value = 'Session expired or invalid. Please log in again.';
    closeRecordForm();
    handleLogout();
  } else {
    recordsError.value = `Form Error: ${errorMessage}`;
  }
};

// --- Appointments View Event Handlers ---
const handleAppointmentsLoading = (isLoading) => {
  appointmentsLoading.value = isLoading;
};

const handleAppointmentsError = (errorMessage) => {
  appointmentsError.value = errorMessage;
  if (errorMessage.includes('401') || errorMessage.toLowerCase().includes('session expired')) {
    error.value = 'Session expired. Please log in again.';
    handleLogout();
  }
};

const filteredPatients = computed(() => {
  if (!searchTerm.value) {
    return patients.value;
  }
  const lowerSearchTerm = searchTerm.value.toLowerCase();
  return patients.value.filter(patient =>
    `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase().includes(lowerSearchTerm) ||
    patient.email?.toLowerCase().includes(lowerSearchTerm) ||
    patient.phone?.includes(searchTerm.value)
  );
});

const calculateAge = (dob) => {
  if (!dob) return 'N/A';
  try {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : 'N/A';
  } catch (e) {
    return 'N/A';
  }
};
</script>

<style scoped>
svg {
  display: inline-block;
}
</style>

