<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center" @click.self="$emit('close')">
    <div class="relative mx-auto p-6 border w-full max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
      <button @click="$emit('close')" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <X class="h-6 w-6" />
      </button>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <ClipboardEdit class="h-6 w-6 mr-2 text-blue-500" />
        {{ isEditing ? 'Edit Record' : 'Add New Record' }}
      </h3>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="error" class="p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-sm">
          {{ error }}
        </div>

        <!-- Tooth Number -->
        <div>
          <label for="tooth_number" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tooth Number</label>
          <input type="number" id="tooth_number" v-model="formData.tooth_number"
                 :disabled="isEditing" 
                 class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-600">
        </div>

        <!-- Condition -->
        <div>
          <label for="condition" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition*</label>
          <select id="condition" v-model="formData.condition" required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
            <option disabled value="">Select condition</option>
            <option value="cavity">Cavity</option>
            <option value="fracture">Fracture</option>
            <option value="abscess">Abscess</option>
            <option value="missing">Missing</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Treatment -->
        <div>
          <label for="treatment" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Treatment*</label>
          <select id="treatment" v-model="formData.treatment_type" required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
            <option disabled value="">Select treatment</option>
            <option value="filling">Filling</option>
            <option value="root_canal">Root Canal</option>
            <option value="extraction">Extraction</option>
            <option value="crown">Crown</option>
            <option value="cleaning">Cleaning</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Treatment Date -->
        <div>
          <label for="treatment_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Treatment Date*</label>
          <input type="date" id="treatment_date" v-model="formData.appointment_date" required
                 class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
        </div>

        <!-- Status -->
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status*</label>
          <select id="status" v-model="formData.status" required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <!-- Estimated Cost -->
        <div>
          <label for="cost" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Cost</label>
          <input type="number" step="0.01" id="cost" v-model="formData.cost"
                 placeholder="0.00"
                 class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
        </div>

        <!-- Checkboxes -->
        <div class="space-y-2">
          <div class="flex items-center">
            <input id="covered_by_insurance" type="checkbox" v-model="formData.covered_by_insurance"
                   class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600">
            <label for="covered_by_insurance" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">Covered by Insurance</label>
          </div>
          <div class="flex items-center">
            <input id="xray_taken" type="checkbox" v-model="formData.xray_taken"
                   class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600">
            <label for="xray_taken" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">X-Ray Taken</label>
          </div>
        </div>

        <!-- X-Ray Image Upload -->
        <div v-if="formData.xray_taken">
          <label for="xray_image" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">X-Ray Image (Optional)</label>
          <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
            <div class="space-y-1 text-center">
              <Image class="mx-auto h-12 w-12 text-gray-400" />
              <div class="flex text-sm text-gray-600 dark:text-gray-400">
                <label for="xray_image_input" class="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 dark:ring-offset-gray-800">
                  <span>Upload a file</span>
                  <input id="xray_image_input" name="xray_image" type="file" @change="handleFileUpload" class="sr-only">
                </label>
                <p class="pl-1">or drag and drop</p>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 5MB</p>
              <p v-if="formData.xray_image_name" class="text-sm text-green-600 dark:text-green-400">Selected: {{ formData.xray_image_name }}</p>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
          <textarea id="notes" v-model="formData.notes" rows="3"
                    placeholder="Add any additional notes about this tooth or treatment..."
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"></textarea>
        </div>

        <!-- Requires Follow-Up -->
        <div class="flex items-center">
          <input id="requires_follow_up" type="checkbox" v-model="formData.requires_follow_up"
                 class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600">
          <label for="requires_follow_up" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">Requires Follow-Up</label>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" @click="$emit('close')"
                  class="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Cancel
          </button>
          <button type="submit" :disabled="isSubmitting"
                  class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center">
            <LoaderCircle v-if="isSubmitting" class="animate-spin h-4 w-4 mr-2" />
            {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Record' : 'Save Record') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { X, ClipboardEdit, LoaderCircle, Image } from 'lucide-vue-next';

const props = defineProps({
  recordData: {
    type: Object,
    default: null
  },
  patientId: {
    type: [String, Number],
    required: true
  },
  initialToothNumber: {
    type: [String, Number],
    default: null
  }
});

const emit = defineEmits(['close', 'record-saved', 'error']);

const config = useRuntimeConfig();
const isEditing = ref(false);
const formData = ref({
  appointment_date: new Date().toISOString().split('T')[0],
  appointment_time: '',
  dentist_id: '',
  reason: '',
  status: 'pending',
  notes: '',
  tooth_number: null,
  condition: '',
  treatment_type: '',
  cost: null,
  covered_by_insurance: false,
  xray_taken: false,
  xray_image: null,
  xray_image_name: '',
  requires_follow_up: false,
  treatments: []
});
const error = ref(null);
const isSubmitting = ref(false);

const getAccessTokenCookie = () => {
  const token = Cookies.get('dental_access_token');
  if (!token) {
    emit('error', 'Authentication token not found. Please log in.');
    emit('close');
  }
  return token;
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'File size exceeds 5MB limit.';
      formData.value.xray_image = null;
      formData.value.xray_image_name = '';
      event.target.value = '';
      return;
    }
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      error.value = 'Invalid file type. Only PNG, JPG, GIF allowed.';
      formData.value.xray_image = null;
      formData.value.xray_image_name = '';
      event.target.value = '';
      return;
    }

    formData.value.xray_image = file;
    formData.value.xray_image_name = file.name;
    error.value = null;
  }
};

watch(() => props.recordData, (newVal) => {
  if (newVal && newVal.id) {
    isEditing.value = true;
    formData.value = {
      appointment_date: newVal.date || new Date().toISOString().split('T')[0],
      appointment_time: newVal.time || '',
      dentist_id: newVal.dentist?.id || '',
      status: newVal.status || 'pending',
      notes: newVal.notes || '',
      tooth_number: newVal.treatments?.[0]?.tooth_number || props.initialToothNumber || null,
      condition: newVal.treatments?.[0]?.condition || '',
      treatment_type: newVal.treatments?.[0]?.treatment_type || '',
      cost: newVal.treatments?.[0]?.cost || null,
      covered_by_insurance: newVal.treatments?.[0]?.covered_by_insurance || false,
      xray_taken: newVal.treatments?.[0]?.xray_taken || false,
      xray_image: null,
      xray_image_name: newVal.treatments?.[0]?.xray_image_name || '',
      requires_follow_up: newVal.treatments?.[0]?.requires_follow_up || false,
      treatments: newVal.treatments ? JSON.parse(JSON.stringify(newVal.treatments)) : []
    };
  } else {
    isEditing.value = false;
    formData.value = {
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: '',
      dentist_id: '',
      reason: '',
      status: 'pending',
      notes: '',
      tooth_number: props.initialToothNumber || null,
      condition: '',
      treatment_type: '',
      cost: null,
      covered_by_insurance: false,
      xray_taken: false,
      xray_image: null,
      xray_image_name: '',
      requires_follow_up: false,
      treatments: []
    };
  }
  error.value = null;
}, { immediate: true });

watch(() => props.initialToothNumber, (newVal) => {
  if (!isEditing.value && newVal) {
    formData.value.tooth_number = newVal;
  }
}, { immediate: true });

const handleSubmit = async () => {
  error.value = null;
  isSubmitting.value = true;
  const token = getAccessTokenCookie();
  if (!token) {
    isSubmitting.value = false;
    return;
  }

  // Construct JSON payload
  const payload = {
    patient_id: props.patientId,
    appointment_date: formData.value.appointment_date,
    status: formData.value.status,
    notes: formData.value.notes,
    treatments: [{
      tooth_number: formData.value.tooth_number,
      condition: formData.value.condition,
      treatment_type: formData.value.treatment_type,
      cost: formData.value.cost,
      covered_by_insurance: formData.value.covered_by_insurance,
      xray_taken: formData.value.xray_taken,
      requires_follow_up: formData.value.requires_follow_up
    }]
  };

  // Remove null/undefined values if necessary
  Object.keys(payload).forEach(key => {
    if (payload[key] === null || payload[key] === undefined) {
      delete payload[key];
    }
    if (key === 'treatments' && Array.isArray(payload[key])) {
      payload[key] = payload[key].map(treatment => {
        const cleanedTreatment = { ...treatment };
        Object.keys(cleanedTreatment).forEach(tKey => {
          if (cleanedTreatment[tKey] === null || cleanedTreatment[tKey] === undefined || cleanedTreatment[tKey] === '') {
            delete cleanedTreatment[tKey];
          }
        });
        return cleanedTreatment;
      }).filter(treatment => Object.keys(treatment).length > 0);
      if (payload[key].length === 0) delete payload[key];
    }
  });

  try {
    let response;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const url = isEditing.value
      ? `${config.public.API_BASE_URL}/appointments/${props.recordData.id}`
      : `${config.public.API_BASE_URL}/appointments`;

    if (isEditing.value) {
      response = await axios.put(url, payload, { headers });
    } else {
      response = await axios.post(url, payload, { headers });
    }

    emit('record-saved', response.data);
    emit('close');
  } catch (err) {
    console.error('Error saving record:', err);
    if (err.response) {
      if (err.response.status === 401) {
        error.value = 'Session expired. Please log in again.';
        emit('error', 'Session expired.');
      } else if (err.response.data && err.response.data.error) {
        error.value = `Failed to save: ${err.response.data.error}`;
      } else {
        error.value = `An error occurred (Status: ${err.response.status}). Please try again.`;
      }
    } else {
      error.value = 'An unexpected error occurred. Please check your connection and try again.';
    }
    emit('error', error.value);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Style adjustments for the modal */
</style>
