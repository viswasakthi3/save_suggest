<template>
  <div class="p-4 bg-gray-100 dark:bg-dark-2 rounded-lg shadow-lg min-h-screen">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h2 class="text-2xl font-semibold mb-3 sm:mb-0 text-gray-800 dark:text-white">Treatment Dashboard</h2>
      <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end w-full sm:w-auto">
        <div class="w-full sm:w-auto">
          <label for="startDate" class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
          <DatePicker id="startDate" v-model="selectedStartDate" @update:modelValue="fetchTreatmentRecords" placeholder="Select start date" class="w-full sm:w-44 md:w-48" />
        </div>
        <div class="w-full sm:w-auto">
          <label for="endDate" class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
          <DatePicker id="endDate" v-model="selectedEndDate" @update:modelValue="fetchTreatmentRecords" placeholder="Select end date" class="w-full sm:w-44 md:w-48" />
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10">
      <p class="text-gray-600 dark:text-gray-400">Loading treatment records...</p>
      <svg class="animate-spin h-8 w-8 text-primary mx-auto mt-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <div v-else-if="error" class="text-center py-10 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
      <p class="text-red-600 dark:text-red-300 font-semibold">Error fetching records:</p>
      <p class="text-red-500 dark:text-red-400 mt-1">{{ error }}</p>
      <button @click="fetchTreatmentRecords" class="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-opacity-50 transition-colors">
        Retry
      </button>
    </div>

    <div v-else-if="treatmentRecords.length === 0" class="text-center py-10">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No treatment records</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">No records found for the selected date range.</p>
    </div>

    <div v-else class="space-y-10 pb-10">
      <div v-for="(group, date) in groupedRecords" :key="date" 
           class="bg-white dark:bg-dark-3 shadow-xl rounded-xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300 ease-out">
        <div class="bg-gradient-to-r from-primary to-primary-dark dark:from-primary-dark dark:to-primary-darker p-4 sm:p-5 sticky top-0 z-10 shadow-md">
          <h3 class="text-xl sm:text-2xl font-bold text-slate-100 dark:text-slate-50 tracking-wide">
            {{ formatDateForDisplay(date) }}
          </h3>
        </div>
        
        <div class="p-4 sm:p-6 space-y-6">
          <div v-for="record in group" :key="record.record_id" 
               class="bg-gray-50 dark:bg-dark-4 p-5 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-4 border-b border-gray-300 dark:border-dark-5">
              <div>
                <h4 class="text-lg font-semibold text-primary dark:text-primary-light">{{ record.patient_first_name }} {{ record.patient_last_name }}</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400">Record ID: {{ record.record_id }}</p>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300 sm:mt-0 mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1.5 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {{ record.patient_phone || 'N/A' }}
              </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm mb-4">
              <div class="flex items-center">
                <span class="font-medium text-gray-700 dark:text-gray-300 w-20">Tooth:</span>
                <span class="text-gray-600 dark:text-gray-400 ml-2">{{ record.tooth_number || 'N/A' }}</span>
              </div>
              <div class="flex items-center">
                <span class="font-medium text-gray-700 dark:text-gray-300 w-20">Condition:</span>
                <span class="text-gray-600 dark:text-gray-400 ml-2">{{ record.condition || 'N/A' }}</span>
              </div>
              <div class="flex items-center">
                <span class="font-medium text-gray-700 dark:text-gray-300 w-20">Reason:</span>
                <span class="text-gray-600 dark:text-gray-400 ml-2">{{ record.reason || 'N/A' }}</span>
              </div>
              <div class="flex items-center">
                <span class="font-medium text-gray-700 dark:text-gray-300 w-20">Status:</span>
                <span :class="getStatusClass(record.record_status)" class="ml-2 px-2 py-0.5 rounded-full text-xs">{{ record.record_status ? record.record_status.replace('_', ' ') : 'N/A' }}</span>
              </div>
            </div>

            <div v-if="record.treatments && record.treatments.length > 0" class="mt-4 pt-4 border-t border-gray-300 dark:border-dark-5">
              <h5 class="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">Treatments</h5>
              <div class="space-y-4">
                <div v-for="(treatment, index) in record.treatments" :key="index" class="p-3 bg-gray-100 dark:bg-dark-5 rounded-md shadow-sm">
                  <p class="text-sm font-semibold text-primary dark:text-primary-light capitalize mb-1">
                    {{ treatment.treatment_type ? treatment.treatment_type.replace('_', ' ') : 'N/A' }}
                    <span v-if="treatment.cost" class="text-xs text-gray-500 dark:text-gray-400 ml-2">(Cost: {{ formatCurrency(treatment.cost) }})</span>
                  </p>
                  <p v-if="treatment.notes" class="text-xs text-gray-600 dark:text-gray-400 mb-1">Notes: {{ treatment.notes }}</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">X-Ray Taken: {{ treatment.xray_taken ? 'Yes' : 'No' }}</p>
                  <div v-if="treatment.xray_image_url" class="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    X-Ray Image: <a :href="treatment.xray_image_url" target="_blank" class="text-blue-500 hover:underline">{{ treatment.xray_image_url.split('/').pop() }}</a>
                  </div>

                  <div v-if="treatment.steps && treatment.steps.length > 0" class="mt-2 pt-2 border-t border-gray-200 dark:border-dark-6">
                    <h6 class="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Steps:</h6>
                    <ul class="list-decimal list-inside pl-2 space-y-1">
                      <li v-for="step in treatment.steps" :key="step.step_order" class="text-xs text-gray-500 dark:text-gray-400">
                        {{ step.description }} - <span :class="getStepStatusClass(step.status)">{{ step.status }}</span>
                        <span v-if="step.step_date" class="text-gray-400 dark:text-gray-500 text-xxs"> ({{ formatDate(step.step_date, 'MMM d, yyyy') }})</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="mt-4 pt-4 border-t border-gray-300 dark:border-dark-5 text-sm text-gray-500 dark:text-gray-400">
              <p>No specific treatments listed.</p>
            </div>

            <p v-if="record.record_notes" class="mt-4 pt-4 border-t border-gray-300 dark:border-dark-5 text-sm text-gray-600 dark:text-gray-300">
              <span class="font-medium text-gray-700 dark:text-gray-200">Record Notes:</span> {{ record.record_notes }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import DatePicker from './DatePicker.vue';
import { format, subDays, parseISO, isValid } from 'date-fns';
import Cookies from 'js-cookie';
import { useRouter } from 'vue-router';

interface TreatmentStep {
  description: string;
  status: string;
  step_date?: string;
  step_order: number;
}

interface Treatment {
  treatment_type: string;
  notes?: string;
  cost?: string | number;
  xray_taken?: boolean;
  xray_image_url?: string;
  steps?: TreatmentStep[];
}

interface DentalRecord {
  record_id: number;
  patient_id: number;
  patient_first_name: string;
  patient_last_name: string;
  patient_phone?: string;
  tooth_number?: string;
  condition?: string;
  reason?: string;
  record_notes?: string;
  record_status?: string;
  treatments?: Treatment[];
  record_date: string;
}

interface ApiResponse {
  dental_records: DentalRecord[];
  count: number;
  error?: string;
}
const config = useRuntimeConfig();
const treatmentRecords = ref<DentalRecord[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const router = useRouter();

const today = new Date();
const tenDaysAgo = subDays(today, 10);

const selectedStartDate = ref<Date | string | null>(tenDaysAgo);
const selectedEndDate = ref<Date | string | null>(today);

const formatDateForApi = (date: Date | string | null): string => {
  if (!date) return '';
  let dateToFormat: Date;
  if (typeof date === 'string') {
    const parsed = parseISO(date);
    if (isValid(parsed)) {
      dateToFormat = parsed;
    } else {
      const simpleParsed = new Date(date);
      if (isValid(simpleParsed)) {
        dateToFormat = simpleParsed;
      } else {
        console.warn(`Invalid date string for API: ${date}`);
        return '';
      }
    }
  } else {
    dateToFormat = date;
  }
  return format(dateToFormat, 'yyyy-MM-dd');
};

const fetchTreatmentRecords = async () => {
  if (!selectedStartDate.value || !selectedEndDate.value) {
    treatmentRecords.value = [];
    return;
  }

  loading.value = true;
  error.value = null;

  const startDateObj = selectedStartDate.value instanceof Date ? selectedStartDate.value : (typeof selectedStartDate.value === 'string' ? parseISO(selectedStartDate.value) : null);
  const endDateObj = selectedEndDate.value instanceof Date ? selectedEndDate.value : (typeof selectedEndDate.value === 'string' ? parseISO(selectedEndDate.value) : null);

  if (!startDateObj || !isValid(startDateObj) || !endDateObj || !isValid(endDateObj)) {
    error.value = "Invalid date selection. Please select valid start and end dates.";
    loading.value = false;
    treatmentRecords.value = [];
    return;
  }

  const dateFrom = formatDateForApi(startDateObj);
  const dateTo = formatDateForApi(endDateObj);

  if (!dateFrom || !dateTo) {
    error.value = "Invalid date format for API. Please ensure both dates are valid.";
    loading.value = false;
    treatmentRecords.value = [];
    return;
  }
  
  console.log(`Fetching records from ${dateFrom} to ${dateTo}`);

  try {
    const token = Cookies.get('dental_access_token');
    if (!token) {
      error.value = "Authentication token not found. Please log in.";
      router.push('/dentall/login');
      return;
    }

    const response = await fetch(`${config.public.API_BASE_URL}/dental-records/by-date`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        date_from: dateFrom,
        date_to: dateTo
      })
    });

    if (!response.ok) {
      const errorData: ApiResponse | { error: string } = await response.json();
      if (response.status === 401) {
        error.value = "Session expired or unauthorized. Please log in again.";
        Cookies.remove('dental_access_token', { path: '/' });
        router.push('/dentall/login');
      } else {
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return; 
    }

    const data: ApiResponse = await response.json();
    treatmentRecords.value = data.dental_records;

  } catch (e: any) {
    console.error("Failed to fetch treatment records:", e);
    if (!error.value) { 
        error.value = e.message || "An unknown error occurred while fetching records.";
    }
    treatmentRecords.value = [];
  } finally {
    loading.value = false;
  }
};

const groupedRecords = computed(() => {
  const sortedRecords = [...treatmentRecords.value].sort((a, b) => {
    const dateComparison = b.record_date.localeCompare(a.record_date);
    if (dateComparison !== 0) return dateComparison;
    return a.patient_last_name.localeCompare(b.patient_last_name) || a.patient_first_name.localeCompare(b.patient_first_name);
  });

  return sortedRecords.reduce((acc, record) => {
    const date = record.record_date.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as Record<string, DentalRecord[]>);
});

const formatDate = (dateString: string | null | undefined, formatString: string = 'EEEE, MMMM d, yyyy') => {
  if (!dateString) return 'N/A';
  try {
    let dateObj = parseISO(dateString);
    if (!isValid(dateObj)) {
      // Try parsing simple YYYY-MM-DD if ISO fails (for step_date which might be in this format)
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const simpleDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        if (isValid(simpleDate)) dateObj = simpleDate; 
        else return "Invalid Date";
      }
      else return "Invalid Date";
    }
    return format(dateObj, formatString);
  } catch (e) {
    console.error(`Error formatting date: ${dateString}`, e);
    return dateString;
  }
};

const formatDateForDisplay = (isoDateString: string) => {
  try {
    const dateObj = parseISO(isoDateString);
    if (!isValid(dateObj)) {
        return "Invalid Date";
    }

    const todayDt = new Date();
    const yesterdayDt = subDays(todayDt, 1);

    const dateToCompare = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const todayNormalized = new Date(todayDt.getFullYear(), todayDt.getMonth(), todayDt.getDate());
    const yesterdayNormalized = new Date(yesterdayDt.getFullYear(), yesterdayDt.getMonth(), yesterdayDt.getDate());

    if (dateToCompare.getTime() === todayNormalized.getTime()) {
      return 'Today';
    }
    if (dateToCompare.getTime() === yesterdayNormalized.getTime()) {
      return 'Yesterday';
    }
    
    return format(dateObj, 'EEEE, MMMM d, yyyy');
  } catch (e) {
    console.error(`Error formatting date: ${isoDateString}`, e);
    return isoDateString;
  }
};

const getStatusClass = (status?: string) => {
  if (!status) return 'text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700';
  const lowerStatus = status.toLowerCase().replace('_', ' ');
  if (lowerStatus.includes('completed')) {
    return 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-800/50 font-semibold';
  } else if (lowerStatus.includes('needs treatment') || lowerStatus.includes('pending') || lowerStatus.includes('diagnosis planned') || lowerStatus.includes('initial')) {
    return 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-800/50 font-semibold';
  } else if (lowerStatus.includes('monitoring') || lowerStatus.includes('in progress')) {
    return 'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800/50 font-semibold';
  } else if (lowerStatus.includes('cancelled')) {
    return 'text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 line-through';
  }
  return 'text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700';
};

const getStepStatusClass = (status?: string) => {
  if (!status) return 'text-gray-500 dark:text-gray-400';
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'done' || lowerStatus === 'completed') {
    return 'text-green-600 dark:text-green-400 font-semibold';
  } else if (lowerStatus === 'pending' || lowerStatus === 'to do') {
    return 'text-yellow-600 dark:text-yellow-400 font-semibold';
  } else if (lowerStatus === 'skipped' || lowerStatus === 'cancelled') {
    return 'text-gray-500 dark:text-gray-400 line-through';
  }
  return 'text-gray-500 dark:text-gray-400';
};

const formatCurrency = (value: string | number | undefined) => {
  if (value === undefined || value === null) return 'N/A';
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num);
};


onMounted(() => {
  fetchTreatmentRecords();
});

watch([selectedStartDate, selectedEndDate], () => {
     fetchTreatmentRecords();
}, { deep: true });

</script>

<style scoped>
.treatments-list::-webkit-scrollbar {
  width: 8px;
}

.treatments-list::-webkit-scrollbar-track {
  background: transparent;
}

.treatments-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}
.dark .treatments-list::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}

.calendar-dropdown {
  position: absolute;
  z-index: 1000;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.dark .calendar-dropdown {
    background-color: var(--dark-2);
    border-color: var(--dark-3);
}

.sticky {
  position: -webkit-sticky; /* For Safari */
  position: sticky;
}

.text-xxs {
  font-size: 0.65rem; 
  line-height: 0.85rem;
}
</style>
