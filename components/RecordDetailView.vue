<template>
  <div class="p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
    <div class="flex justify-between items-center pb-4 mb-6 border-b border-gray-300 dark:border-gray-700">
      <div class="flex items-center">
        <button @click="$emit('back-to-list')" class="mr-4 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft class="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </button>
        <h3 class="text-2xl font-semibold text-blue-700 dark:text-blue-400 flex items-center">
          <ClipboardEdit class="h-7 w-7 mr-3" />
          {{ isEditing ? `Edit Record: Tooth #${formData.tooth_number}` : `New Record: Tooth #${formData.tooth_number || '...'}` }}
        </h3>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div v-if="error" class="p-3 mb-4 bg-red-50 dark:bg-red-800/30 border border-red-300 dark:border-red-600 rounded-lg text-red-600 dark:text-red-300 text-sm shadow-md">
        {{ error }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pr-2 custom-scrollbar-minimal">
        <!-- Left Column: Record Details -->
        <div class="space-y-5">
          <div class="p-4 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 rounded-lg shadow-sm">
            <h4 class="text-lg font-medium text-blue-600 dark:text-blue-400/90 mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">Record Details</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="detail_tooth_number" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Tooth Number*</label>
                <input type="number" id="detail_tooth_number" v-model.number="formData.tooth_number" required
                       :disabled="isEditing"
                       class="form-input-field disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed">
              </div>
              <div>
                <label for="detail_record_status" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Record Status*</label>
                <select id="detail_record_status" v-model="formData.status" required class="form-input-field">
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
                <label for="detail_condition" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Condition*</label>
                <select id="detail_condition" v-model="formData.condition" required class="form-input-field">
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
                <label for="detail_other_condition" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Specify Other Condition*</label>
                <input type="text" id="detail_other_condition" v-model="formData.other_condition_text" required
                       placeholder="Describe the condition"
                       class="form-input-field">
              </div>
            </div>
            <div class="mt-4">
              <label for="detail_record_notes" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">General Notes</label>
              <textarea id="detail_record_notes" v-model="formData.notes" rows="4"
                        placeholder="Add any general notes for this dental record..."
                        class="form-input-field"></textarea>
            </div>
          </div>
        </div>

        <!-- Right Column: Treatments -->
        <div class="space-y-5">
          <div class="flex justify-between items-center mb-3 sticky top-0 bg-white dark:bg-gray-800 py-2 z-10">
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
              <button v-if="formData.treatments.length > 0" type="button" @click="removeTreatment(treatmentIndex)"
                      class="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-xs font-medium px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-700/50 transition-colors">
                Remove Treatment
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label :for="`detail_treatment_type_${treatmentIndex}`" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Treatment Type*</label>
                <select :id="`detail_treatment_type_${treatmentIndex}`" v-model="treatment.treatment_type" required class="form-input-field">
                  <option disabled value="">Select treatment</option>
                  <option value="filling">Filling</option>
                  <option value="root_canal">Root Canal</option>
                  <option value="extraction">Extraction</option>
                  <option value="crown">Crown</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="bridge">Bridge</option>
                  <option value="implant">Implant</option>
                  <option value="orthodontics">Orthodontics</option>
                  <option value="other_treatment">Other (Specify)</option>
                </select>
              </div>
              <div>
                <label :for="`detail_treatment_cost_${treatmentIndex}`" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Estimated Cost</label>
                <input type="number" step="0.01" :id="`detail_treatment_cost_${treatmentIndex}`" v-model.number="treatment.cost"
                       placeholder="0.00"
                       class="form-input-field">
              </div>
            </div>
            <div class="mt-4">
              <label :for="`detail_treatment_notes_${treatmentIndex}`" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Treatment Notes</label>
              <textarea :id="`detail_treatment_notes_${treatmentIndex}`" v-model="treatment.notes" rows="3"
                        placeholder="Add any notes specific to this treatment..."
                        class="form-input-field"></textarea>
            </div>
            <div class="mt-4 flex items-center">
              <input :id="`detail_xray_taken_${treatmentIndex}`" type="checkbox" v-model="treatment.xray_taken"
                     class="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:bg-gray-700 dark:focus:ring-blue-600 dark:ring-offset-gray-800">
              <label :for="`detail_xray_taken_${treatmentIndex}`" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">X-Ray Taken</label>
            </div>
            <div v-if="treatment.xray_taken" class="mt-4">
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">X-Ray Image</label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <div class="space-y-1 text-center">
                  <Image class="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" />
                  <div class="flex text-sm text-gray-500 dark:text-gray-400">
                    <label :for="`detail_xray_image_input_${treatmentIndex}`" class="relative cursor-pointer bg-white dark:bg-gray-800/60 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 dark:ring-offset-gray-900">
                      <span>Upload a file</span>
                      <input :id="`detail_xray_image_input_${treatmentIndex}`" name="xray_image" type="file" @change="handleFileUpload($event, treatmentIndex)" class="sr-only">
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
                  <label :for="`detail_step_desc_${treatmentIndex}_${stepIndex}`" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Description*</label>
                  <input type="text" :id="`detail_step_desc_${treatmentIndex}_${stepIndex}`" v-model="step.description" required placeholder="Step description"
                         class="form-input-field text-sm">
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label :for="`detail_step_date_${treatmentIndex}_${stepIndex}`" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Date</label>
                    <input type="date" :id="`detail_step_date_${treatmentIndex}_${stepIndex}`" v-model="step.step_date"
                           class="form-input-field text-sm">
                  </div>
                  <div>
                    <label :for="`detail_step_status_${treatmentIndex}_${stepIndex}`" class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">Status*</label>
                    <select :id="`detail_step_status_${treatmentIndex}_${stepIndex}`" v-model="step.status" required
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
      <div class="flex justify-end space-x-3 pt-6 border-t border-gray-300 dark:border-gray-700 mt-8">
        <button type="button" @click="$emit('back-to-list')"
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
</template>

<script setup>
import { ref, watch, onMounted, toRefs } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { X, ClipboardEdit, LoaderCircle, Image, ArrowLeft } from 'lucide-vue-next';

const props = defineProps({
  recordDataProp: { // Renamed to avoid conflict with local ref if any, and to signify it's a prop
    type: Object,
    default: null
  },
  patientId: {
    type: [String, Number],
    required: true
  },
  initialToothNumberProp: { // Renamed for clarity
    type: [String, Number],
    default: null
  },
  isCreatingNew: { // To distinguish between editing an existing record and creating a brand new one
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'record-saved', 'error', 'back-to-list']);

const config = useRuntimeConfig();
const isEditing = ref(false); // True if recordDataProp has an ID (editing existing)
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
  tooth_number: props.initialToothNumberProp,
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
    emit('error', 'Authentication token not found. Please log in.'); // Emit error for parent to handle
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
    currentTreatment.xray_image_url = ''; // Clear existing URL if new file is chosen
    error.value = null; 
  } else { // File input was cleared
    currentTreatment.xray_image = null;
    currentTreatment.xray_image_name = '';
    // If a file was cleared, we don't automatically clear xray_image_url
    // as it might be a persisted URL from the server. User has to explicitly remove/change.
  }
};

const addTreatment = () => {
  if (!formData.value.treatments) {
    formData.value.treatments = [];
  }
  formData.value.treatments.push(defaultTreatment());
};

const removeTreatment = (treatmentIndex) => {
  // Allow removing the last treatment. If all are removed, user can add new ones.
  formData.value.treatments.splice(treatmentIndex, 1);
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

watch(() => props.recordDataProp, (newVal) => {
  if (newVal && newVal.id) { // Editing an existing record
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
            xray_image_name: t.xray_image_url ? '' : (t.xray_image_name || ''), // Name only if no URL (new file scenario)
            steps: t.steps ? JSON.parse(JSON.stringify(t.steps)).map(s => ({ ...defaultStep(), ...s })) : []
          }))
        : [defaultTreatment()] // Ensure at least one treatment structure if editing an old record that might not have it
    };
  } else { // Creating a new record or initializing from tooth number
    isEditing.value = false; // Explicitly false if no ID
    formData.value = {
      ...initialFormData(), // This will use props.initialToothNumberProp
      tooth_number: props.initialToothNumberProp || formData.value.tooth_number, // Prioritize prop
    };
    if (!formData.value.treatments || formData.value.treatments.length === 0) {
        formData.value.treatments = [defaultTreatment()];
    }
  }
  error.value = null;
}, { immediate: true, deep: true });


// Watch for changes in initialToothNumberProp if it's for a new record being composed
watch(() => props.initialToothNumberProp, (newVal) => {
  if (!isEditing.value && newVal && formData.value.tooth_number !== newVal) {
    formData.value.tooth_number = newVal;
  }
}, { immediate: true });


const handleSubmit = async () => {
  error.value = null;
  isSubmitting.value = true;
  const token = getAccessTokenCookie();
  if (!token) {
    // Error already set and emitted by getAccessTokenCookie
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
  
  // Validate treatments and steps
  if (formData.value.treatments && formData.value.treatments.length > 0) {
    for (let i = 0; i < formData.value.treatments.length; i++) {
      const treatment = formData.value.treatments[i];
      if (!treatment.treatment_type) {
        error.value = `Treatment type is required for Treatment #${i + 1}.`;
        isSubmitting.value = false;
        return;
      }
      if (treatment.steps) {
        for (let j = 0; j < treatment.steps.length; j++) {
          const step = treatment.steps[j];
          if (!step.description) {
            error.value = `Description is required for Step #${j + 1} in Treatment #${i + 1}.`;
            isSubmitting.value = false;
            return;
          }
          if (!step.status) {
             error.value = `Status is required for Step #${j + 1} in Treatment #${i + 1}.`;
             isSubmitting.value = false;
             return;
          }
        }
      }
    }
  } else {
    // If treatments are mandatory, add validation here.
    // For now, allowing no treatments if user removes all. API might enforce it.
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
    // Include record ID if editing, for APIs that need it in payload for POST-based upsert
    // id: isEditing.value ? formData.value.id : undefined, 
    treatments: formData.value.treatments.map(t => ({
      treatment_type: t.treatment_type,
      cost: t.cost ? parseFloat(t.cost) : undefined,
      notes: t.notes,
      xray_taken: t.xray_taken,
      // This logic needs to be robust: if t.xray_image (File) exists, it means a new upload.
      // The actual URL will come from server post-upload.
      // If t.xray_image_url exists and no new t.xray_image, use existing.
      xray_image_url: t.xray_taken 
        ? (t.xray_image ? `PENDING_UPLOAD_${t.xray_image_name}` : t.xray_image_url || undefined) 
        : undefined,
      steps: t.steps.map((step, index) => ({
        step_order: index + 1,
        description: step.description,
        step_date: step.step_date || null,
        status: step.status
      }))
    }))
  };
  
  // TODO: Actual X-Ray File Upload Handling
  // For each treatment in formData.value.treatments:
  // if (treatment.xray_image instanceof File) {
  //   const uploadedUrl = await uploadFileToServer(treatment.xray_image, token); // Implement this
  //   Find corresponding treatment in payload and set its xray_image_url = uploadedUrl;
  // }

  // Clean payload: remove undefined/empty string keys, except for specific fields if API expects them
 Object.keys(payload).forEach(key => {
    if (payload[key] === undefined || payload[key] === '') {
      // Keep 'notes' if it's an empty string, as it might be intentional
      if (key !== 'notes') {
        delete payload[key];
      }
    }
  });
   payload.treatments = payload.treatments.map(treatment => {
    const cleanedTreatment = { ...treatment };
    Object.keys(cleanedTreatment).forEach(tKey => {
      if (cleanedTreatment[tKey] === undefined || cleanedTreatment[tKey] === '' || (Array.isArray(cleanedTreatment[tKey]) && cleanedTreatment[tKey].length === 0) ) {
        if (tKey === 'steps' && Array.isArray(cleanedTreatment[tKey]) && cleanedTreatment[tKey].length === 0) {
           delete cleanedTreatment[tKey]; 
        } else if (tKey !== 'notes' && (cleanedTreatment[tKey] === undefined || cleanedTreatment[tKey] === '')) {
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
                // keep it as null
             } else if (sKey !== 'description' && (cleanedStep[sKey] === undefined || cleanedStep[sKey] === '' || cleanedStep[sKey] === null)) {
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
    
    // The API uses POST for upsert based on tooth_number for a given patient.
    // It doesn't use a record ID in the URL for updates.
    const url = `${config.public.API_BASE_URL}/patients/${props.patientId}/dental-records`;
    
    const response = await axios.post(url, payload, { headers });

    emit('record-saved', response.data);
    // emit('close'); // Not needed if parent handles navigation via 'back-to-list' or 'record-saved'
  } catch (err) {
    console.error('Error saving dental record:', err.response ? err.response.data : err);
    let errorMessage = 'An unexpected error occurred. Please check your connection and try again.';
    if (err.response) {
      if (err.response.status === 401) {
        errorMessage = 'Session expired or unauthorized. Please log in again.';
        emit('error', errorMessage); // Parent should handle logout
      } else if (err.response.data) {
        if (err.response.data.error) {
          errorMessage = `Failed to save: ${err.response.data.error}`;
        } else if (err.response.data.detail) {
           if (typeof err.response.data.detail === 'string') {
              errorMessage = `Failed to save: ${err.response.data.detail}`;
          } else if (Array.isArray(err.response.data.detail)) {
              const messages = err.response.data.detail.map(d => `${d.loc.join(' -> ')}: ${d.msg}`).join('; ');
              errorMessage = `Validation failed: ${messages}`;
          } else {
              errorMessage = 'Validation failed. Please check your input.';
          }
        } else if (err.response.data.errors) { // Fallback for other error structures
          const messages = Object.values(err.response.data.errors).flat();
          errorMessage = `Validation failed: ${messages.join('; ')}`;
        } else {
          errorMessage = `An error occurred (Status: ${err.response.status}). Please try again.`;
        }
      }
    }
    error.value = errorMessage;
    // emit('error', errorMessage); // Error is displayed locally, parent can also listen if needed
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  // Initial population is handled by the watcher on props.recordDataProp
  // This ensures that if props change, the form updates.
  // If creating a brand new record (not from a tooth click, but a general "add record" button)
  // and initialToothNumberProp is not set, tooth_number might be null or an empty field.
  if (props.isCreatingNew && !props.recordDataProp && !props.initialToothNumberProp) {
      formData.value = initialFormData(); // Reset to ensure clean state
      isEditing.value = false;
  }
});

</script>

<style scoped>
.form-input-field {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700/70 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base;
}

input:disabled, select:disabled, textarea:disabled {
  cursor: not-allowed;
  /* Tailwind handles most disabled styling, but you can add more if needed */
  @apply bg-gray-100 dark:bg-gray-700/50;
}

.custom-scrollbar-minimal::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.custom-scrollbar-minimal::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar-minimal::-webkit-scrollbar-thumb {
  background-color: #cbd5e1; /* Tailwind gray-300 */
  border-radius: 3px;
}
.custom-scrollbar-minimal::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0; /* Tailwind gray-400 */
}

.dark .custom-scrollbar-minimal::-webkit-scrollbar-thumb {
  background-color: #4a5568; /* Tailwind gray-600 for dark mode */
}
.dark .custom-scrollbar-minimal::-webkit-scrollbar-thumb:hover {
  background-color: #718096; /* Tailwind gray-500 for dark mode */
}
</style>
