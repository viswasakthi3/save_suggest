<template>
  <div class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="relative mx-auto p-5 border w-full max-w-4xl shadow-2xl rounded-lg bg-white dark:bg-gray-900">
      <div class="flex justify-between items-center pb-4 border-b border-gray-300 dark:border-gray-700">
        <h3 class="text-2xl font-semibold text-blue-700 dark:text-blue-400 flex items-center">
          <ClipboardEdit class="h-7 w-7 mr-3" />
          {{ isEditing ? `Edit Record: Tooth #${formData.tooth_number}` : `New Record: Tooth #${formData.tooth_number || '...'}` }}
        </h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors">
          <X class="h-6 w-6" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="pt-5">
        <div v-if="error" class="p-3 mb-5 bg-red-50 dark:bg-red-800/30 border border-red-300 dark:border-red-600 rounded-lg text-red-600 dark:text-red-300 text-sm shadow-md">
          {{ error }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-h-[70vh] overflow-y-auto pr-3 custom-scrollbar">
          <!-- Left Column: Record Details -->
          <div class="space-y-5">
            <div class="p-4 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 rounded-lg shadow-sm">
              <h4 class="text-lg font-medium text-blue-600 dark:text-blue-400/90 mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">Record Details</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="tooth_number" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Tooth Number*</label>
                  <input type="number" id="tooth_number" v-model.number="formData.tooth_number" required
                         :disabled="isEditing"
                         class="form-input-field disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed">
                </div>
                <div>
                  <label for="record_status" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Record Status*</label>
                  <select id="record_status" v-model="formData.status" required
                          class="form-input-field">
                    <option value="initial">Initial</option>
                    <option value="diagnosis_planned">Diagnosis Planned</option>
                    <option value="treatment_planned">Treatment Planned</option>
                    <option value="undergoing_treatment">Undergoing Treatment</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div class="sm:col-span-2">
                  <label for="condition" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Condition*</label>
                  <select id="condition" v-model="formData.condition" required class="form-input-field">
                    <option disabled value="">Select condition</option>
                    <option value="Healthy">Healthy</option>
                    <option value="Decayed">Decayed</option>
                    <option value="Filled">Filled</option>
                    <option value="Missing">Missing</option>
                    <option value="Cracked">Cracked</option>
                    <option value="Wisdom">Wisdom</option>
                    <option value="Impacted">Impacted</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div v-if="formData.condition === 'other'" class="sm:col-span-2">
                  <label for="other_condition" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Specify Other Condition*</label>
                  <input type="text" id="other_condition" v-model="formData.other_condition_text" required
                         placeholder="Describe the condition"
                         class="form-input-field">
                </div>
              </div>
              <div class="mt-4">
                <label for="record_notes" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">General Notes</label>
                <textarea id="record_notes" v-model="formData.notes" rows="4"
                          placeholder="Add any general notes for this dental record..."
                          class="form-input-field"></textarea>
              </div>
            </div>
          </div>

          <!-- Right Column: Treatments -->
          <div class="space-y-5">
            <div class="flex justify-between items-center mb-3 sticky top-0 bg-white dark:bg-gray-900 py-2 z-10">
              <h4 class="text-lg font-medium text-blue-600 dark:text-blue-400/90">Treatments</h4>
              <button type="button" @click="addTreatment"
                      class="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900">
                Add Treatment
              </button>
            </div>

            <div v-if="!formData.treatments || formData.treatments.length === 0" class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800/60">
                <p class="text-sm text-gray-500 dark:text-gray-400 text-center">No treatments added. Click "Add Treatment" to begin.</p>
            </div>

            <div v-for="(treatment, treatmentIndex) in formData.treatments" :key="treatmentIndex"
                 class="p-4 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 rounded-lg shadow-sm mb-4 relative">
              
              <div class="flex justify-between items-center mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">
                <h4 class="text-md font-semibold text-blue-600 dark:text-blue-400/90">Treatment {{ treatmentIndex + 1 }}</h4>
                <button v-if="formData.treatments.length > 1" type="button" @click="removeTreatment(treatmentIndex)"
                        class="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-xs font-medium px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-700/50 transition-colors">
                  Remove Treatment
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label :for="`treatment_type_${treatmentIndex}`" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Treatment Type*</label>
                  <select :id="`treatment_type_${treatmentIndex}`" v-model="treatment.treatment_type" required
                          class="form-input-field">
                    <option disabled value="">Select treatment</option>
                    <option value="checkup">Checkup</option>
                    <option value="filling">Filling</option>
                    <option value="root_canal">Root Canal</option>
                    <option value="extraction">Extraction</option>
                    <option value="crown">Crown</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="bridge">Bridge</option>
                    <option value="implant">Implant</option>
                    <option value="orthodontics">Orthodontics</option>
                    <option value="other">Other</option>

                  </select>
                </div>
                <div>
                  <label :for="`treatment_cost_${treatmentIndex}`" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Estimated Cost</label>
                  <input type="number" step="0.01" :id="`treatment_cost_${treatmentIndex}`" v-model.number="treatment.cost"
                         placeholder="0.00"
                         class="form-input-field">
                </div>
              </div>
              <div class="mt-4">
                <label :for="`treatment_notes_${treatmentIndex}`" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Treatment Notes</label>
                <textarea :id="`treatment_notes_${treatmentIndex}`" v-model="treatment.notes" rows="3"
                          placeholder="Add any notes specific to this treatment..."
                          class="form-input-field"></textarea>
              </div>
              <div class="mt-4 flex items-center">
                <input :id="`xray_taken_${treatmentIndex}`" type="checkbox" v-model="treatment.xray_taken"
                       class="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:bg-gray-700 dark:focus:ring-blue-600 dark:ring-offset-gray-800">
                <label :for="`xray_taken_${treatmentIndex}`" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">X-Ray Taken</label>
              </div>
              <div v-if="treatment.xray_taken" class="mt-4">
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">X-Ray Image</label>
                <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                  <div class="space-y-1 text-center">
                    <Image class="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" />
                    <div class="flex text-sm text-gray-500 dark:text-gray-400">
                      <label :for="`xray_image_input_${treatmentIndex}`" class="relative cursor-pointer bg-white dark:bg-gray-800/60 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 dark:ring-offset-gray-900">
                        <span>Upload a file</span>
                        <input :id="`xray_image_input_${treatmentIndex}`" name="xray_image" type="file" @change="handleFileUpload($event, treatmentIndex)" class="sr-only">
                      </label>
                      <p class="pl-1">or drag and drop</p>
                    </div>
                    <p class="text-xs text-gray-400 dark:text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    <p v-if="treatment.xray_image_name" class="text-sm text-green-600 dark:text-green-400">{{ treatment.xray_image_name }}</p>
                    <p v-else-if="treatment.xray_image_url" class="text-sm text-blue-600 dark:text-blue-400 truncate max-w-xs" :title="treatment.xray_image_url">
                      Current: {{ treatment.xray_image_url.substring(treatment.xray_image_url.lastIndexOf('/') + 1) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Treatment Steps Section -->
              <div class="mt-6">
                <div class="flex justify-between items-center mb-3">
                  <h5 class="text-md font-medium text-gray-700 dark:text-gray-200">Treatment Steps</h5>
                  <button type="button" @click="addStep(treatmentIndex)"
                          class="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-900">
                    Add Step
                  </button>
                </div>
                <div v-if="!treatment.steps || treatment.steps.length === 0" class="text-sm text-gray-500 dark:text-gray-400 py-2 text-center bg-gray-100 dark:bg-gray-700/50 rounded-md">
                  No steps added for this treatment.
                </div>
                <div v-for="(step, stepIndex) in treatment.steps" :key="stepIndex" class="p-3 mb-3 border border-gray-200 dark:border-gray-700 rounded-md space-y-3 bg-white dark:bg-gray-800 shadow-sm">
                  <div class="flex justify-between items-center">
                     <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">Step {{ stepIndex + 1 }}</p>
                     <button type="button" @click="removeStep(treatmentIndex, stepIndex)"
                             class="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-xs font-medium">Remove</button>
                  </div>
                  <div>
                    <label :for="`step_desc_${treatmentIndex}_${stepIndex}`" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Description*</label>
                    <input type="text" :id="`step_desc_${treatmentIndex}_${stepIndex}`" v-model="step.description" required placeholder="Step description"
                           class="form-input-field text-sm">
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label :for="`step_date_${treatmentIndex}_${stepIndex}`" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Date</label>
                      <input type="date" :id="`step_date_${treatmentIndex}_${stepIndex}`" v-model="step.step_date"
                             class="form-input-field text-sm">
                    </div>
                    <div>
                      <label :for="`step_status_${treatmentIndex}_${stepIndex}`" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Status*</label>
                      <select :id="`step_status_${treatmentIndex}_${stepIndex}`" v-model="step.status" required
                              class="form-input-field text-sm">
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                        <option value="skipped">Skipped</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3 pt-5 border-t border-gray-300 dark:border-gray-700 mt-6">
          <button type="button" @click="$emit('close')"
                  class="px-4 py-2 border border-gray-400 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="isSubmitting"
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 flex items-center transition-colors dark:focus:ring-offset-gray-900">
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
const error = ref(null);
const isSubmitting = ref(false);

const predefinedConditions = ["Healthy", "Decayed", "Filled", "Missing", "Cracked", "Wisdom", "Impacted"];

const defaultStep = () => ({
  description: '',
  step_date: null,
  status: 'pending'
});

const defaultTreatment = () => ({
  treatment_type: '',
  cost: null,
  notes: '',
  xray_taken: false,
  xray_image: null,
  xray_image_name: '',
  xray_image_url: '',
  steps: []
});

const initialFormData = () => ({
  tooth_number: null,
  condition: '', 
  other_condition_text: '', 
  notes: '',
  status: 'initial',
  treatments: [defaultTreatment()]
});

const formData = ref(initialFormData());

const getAccessTokenCookie = () => {
  const token = Cookies.get('dental_access_token');
  if (!token) {
    error.value = 'Authentication token not found. Please log in.';
  }
  return token;
};

const handleFileUpload = (event, treatmentIndex) => {
  const file = event.target.files[0];
  const currentTreatment = formData.value.treatments[treatmentIndex];

  if (file) {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      error.value = 'File size exceeds 5MB limit.';
      currentTreatment.xray_image = null;
      currentTreatment.xray_image_name = '';
      event.target.value = ''; 
      return;
    }
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      error.value = 'Invalid file type. Only PNG, JPG, GIF allowed.';
      currentTreatment.xray_image = null;
      currentTreatment.xray_image_name = '';
      event.target.value = ''; 
      return;
    }

    currentTreatment.xray_image = file;
    currentTreatment.xray_image_name = file.name;
    currentTreatment.xray_image_url = '';
    error.value = null; 
  } else {
    currentTreatment.xray_image = null;
    currentTreatment.xray_image_name = '';
  }
};

const addTreatment = () => {
  formData.value.treatments.push(defaultTreatment());
};

const removeTreatment = (treatmentIndex) => {
  if (formData.value.treatments.length > 1) {
    formData.value.treatments.splice(treatmentIndex, 1);
  } else {
    error.value = "At least one treatment is required.";
  }
};

const addStep = (treatmentIndex) => {
  const treatment = formData.value.treatments[treatmentIndex];
  if (!treatment.steps) {
    treatment.steps = [];
  }
  treatment.steps.push(defaultStep());
};

const removeStep = (treatmentIndex, stepIndex) => {
  const treatment = formData.value.treatments[treatmentIndex];
  if (treatment && treatment.steps) {
    treatment.steps.splice(stepIndex, 1);
  }
};

watch(() => props.recordData, (newVal) => {
  if (newVal && newVal.id) {
    isEditing.value = true;
    let conditionValue = newVal.condition || '';
    let otherConditionTextValue = '';
    if (conditionValue && !predefinedConditions.includes(conditionValue)) {
      otherConditionTextValue = conditionValue;
      conditionValue = 'other';
    }

    formData.value = {
      id: newVal.id,
      tooth_number: newVal.tooth_number,
      condition: conditionValue,
      other_condition_text: otherConditionTextValue,
      notes: newVal.notes || '',
      status: newVal.status || 'initial',
      treatments: (newVal.treatments && newVal.treatments.length > 0)
        ? JSON.parse(JSON.stringify(newVal.treatments)).map(t => ({
            ...defaultTreatment(),
            ...t,
            xray_image: null,
            xray_image_name: t.xray_image_url ? '' : (t.xray_image_name || ''),
            steps: t.steps ? JSON.parse(JSON.stringify(t.steps)).map(s => ({ ...defaultStep(), ...s })) : []
          }))
        : [defaultTreatment()]
    };
  } else {
    isEditing.value = false;
    formData.value = {
      ...initialFormData(),
      tooth_number: props.initialToothNumber || null,
    };
     if (!formData.value.treatments || formData.value.treatments.length === 0) {
        formData.value.treatments = [defaultTreatment()];
    }
  }
  error.value = null;
}, { immediate: true, deep: true });

watch(() => props.initialToothNumber, (newVal) => {
  if (!isEditing.value && newVal && formData.value.tooth_number !== newVal) {
    formData.value.tooth_number = newVal;
  }
}, { immediate: true });

const handleSubmit = async () => {
  error.value = null;
  isSubmitting.value = true;
  const token = getAccessTokenCookie();
  if (!token) {
    error.value = 'Authentication token not found. Please log in.';
    emit('error', error.value);
    isSubmitting.value = false;
    return;
  }

  if (!formData.value.tooth_number) {
    error.value = 'Tooth number is required.';
    isSubmitting.value = false;
    return;
  }
  if (!formData.value.condition || (formData.value.condition === 'other' && !formData.value.other_condition_text)) {
    error.value = 'Condition is required.';
     if(formData.value.condition === 'other' && !formData.value.other_condition_text) {
        error.value = 'Please specify the other condition.';
    }
    isSubmitting.value = false;
    return;
  }
  
  if (!formData.value.treatments || formData.value.treatments.length === 0) {
    error.value = 'At least one treatment is required.';
    isSubmitting.value = false;
    return;
  }

  for (const treatment of formData.value.treatments) {
    if (!treatment.treatment_type) {
      error.value = `Treatment type is required for Treatment #${formData.value.treatments.indexOf(treatment) + 1}.`;
      isSubmitting.value = false;
      return;
    }
    if (treatment.steps) {
      for (const step of treatment.steps) {
        if (!step.description) {
          error.value = `Description is required for Step #${treatment.steps.indexOf(step) + 1} in Treatment #${formData.value.treatments.indexOf(treatment) + 1}.`;
          isSubmitting.value = false;
          return;
        }
        if (!step.status) {
           error.value = `Status is required for Step #${treatment.steps.indexOf(step) + 1} in Treatment #${formData.value.treatments.indexOf(treatment) + 1}.`;
           isSubmitting.value = false;
           return;
        }
      }
    }
  }

  let finalCondition = formData.value.condition;
  if (formData.value.condition === 'other') {
    finalCondition = formData.value.other_condition_text;
  }

  const payload = {
    tooth_number: formData.value.tooth_number,
    condition: finalCondition,
    notes: formData.value.notes,
    status: formData.value.status,
    treatments: formData.value.treatments.map(t => ({
      treatment_type: t.treatment_type,
      cost: t.cost ? parseFloat(t.cost) : undefined,
      notes: t.notes,
      xray_taken: t.xray_taken,
      xray_image_url: t.xray_taken 
        ? (t.xray_image_url || (t.xray_image_name && t.xray_image ? `placeholder_for_new_upload_${t.xray_image_name}` : undefined))
        : undefined,
      steps: t.steps.map((step, index) => ({
        step_order: index + 1,
        description: step.description,
        step_date: step.step_date || null,
        status: step.status
      }))
    }))
  };

  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined || payload[key] === '') {
      delete payload[key];
    }
  });
   payload.treatments = payload.treatments.map(treatment => {
    const cleanedTreatment = { ...treatment };
    Object.keys(cleanedTreatment).forEach(tKey => {
      if (cleanedTreatment[tKey] === undefined || cleanedTreatment[tKey] === '' || (Array.isArray(cleanedTreatment[tKey]) && cleanedTreatment[tKey].length === 0) ) {
        if (tKey === 'steps' && Array.isArray(cleanedTreatment[tKey]) && cleanedTreatment[tKey].length === 0) {
           delete cleanedTreatment[tKey];
        } else if (cleanedTreatment[tKey] === undefined || cleanedTreatment[tKey] === '') {
           delete cleanedTreatment[tKey];
        }
      }
    });
    if (cleanedTreatment.steps) {
      cleanedTreatment.steps = cleanedTreatment.steps.map(step => {
        const cleanedStep = { ...step };
        Object.keys(cleanedStep).forEach(sKey => {
          if (cleanedStep[sKey] === undefined || cleanedStep[sKey] === '' || cleanedStep[sKey] === null) {
             if (sKey === 'step_date' && cleanedStep[sKey] === null) {
             } else if (cleanedStep[sKey] === undefined || cleanedStep[sKey] === '' || cleanedStep[sKey] === null) {
                delete cleanedStep[sKey];
             }
          }
        });
        return cleanedStep;
      });
       if (cleanedTreatment.steps.length === 0) delete cleanedTreatment.steps;
    }
    return cleanedTreatment;
  });

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    let response;
    if (isEditing.value && formData.value.id) {
        const url = `${config.public.API_BASE_URL}/patients/${props.patientId}/dental-records`;
        response = await axios.post(url, payload, { headers });
    } else {
        const url = `${config.public.API_BASE_URL}/patients/${props.patientId}/dental-records`;
        response = await axios.post(url, payload, { headers });
    }

    emit('record-saved', response.data);
    emit('close');
  } catch (err) {
    console.error('Error saving dental record:', err.response ? err.response.data : err);
    if (err.response) {
      if (err.response.status === 401) {
        error.value = 'Session expired or unauthorized. Please log in again.';
        emit('error', 'Session expired or unauthorized.');
      } else if (err.response.data && err.response.data.error) {
        error.value = `Failed to save: ${err.response.data.error}`;
      } else if (err.response.data && err.response.data.detail) {
         if (typeof err.response.data.detail === 'string') {
            error.value = `Failed to save: ${err.response.data.detail}`;
        } else if (Array.isArray(err.response.data.detail)) {
            const messages = err.response.data.detail.map(d => `${d.loc.join(' -> ')}: ${d.msg}`).join('; ');
            error.value = `Validation failed: ${messages}`;
        } else {
            error.value = 'Validation failed. Please check your input.';
        }
      } else if (err.response.data && err.response.data.errors) {
        const messages = Object.values(err.response.data.errors).flat();
        error.value = `Validation failed: ${messages.join('; ')}`;
      }
      else {
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

onMounted(() => {
  if (!isEditing.value && props.initialToothNumber) {
    formData.value.tooth_number = props.initialToothNumber;
  }
  if (!formData.value.treatments || formData.value.treatments.length === 0) {
      formData.value.treatments = [defaultTreatment()];
  }
});

</script>

<style scoped>
.max-h-\[70vh\] {
  max-height: 70vh;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #a0aec0; /* Tailwind gray-400 */
  border-radius: 3px;
  transition: background-color 0.2s ease-in-out;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #718096; /* Tailwind gray-500 */
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4a5568; /* Tailwind gray-600 for dark mode 111111111111*/
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #2d3748; /* Tailwind gray-700 for dark modesssss */
}

.form-input-field {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700/70 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base;
}

input:disabled, select:disabled, textarea:disabled {
  cursor: not-allowed;
}
</style>
