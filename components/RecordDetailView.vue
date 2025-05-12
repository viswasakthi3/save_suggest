<template>
  <div class="p-4 sm:p-6 bg-slate-50 dark:bg-gray-900 min-h-[calc(100vh-var(--header-height,0px))]">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center pb-5 mb-6 border-b border-gray-300 dark:border-gray-700">
        <div class="flex items-center">
          <button @click="$emit('back-to-list')" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mr-3 text-gray-600 dark:text-gray-300">
            <ArrowLeft class="h-6 w-6" />
          </button>
          <h3 class="text-2xl sm:text-3xl font-bold text-sky-700 dark:text-sky-400 flex items-center">
            <ClipboardEdit class="h-8 w-8 mr-3" />
            {{ isEditing ? `Edit Record: Tooth #${formData.tooth_number}` : `New Record: Tooth #${formData.tooth_number || '...'}` }}
          </h3>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <div v-if="error" class="flex items-start p-4 mb-4 bg-red-100 dark:bg-red-900/60 border-l-4 border-red-500 dark:border-red-600 rounded-md shadow-md text-red-700 dark:text-red-200">
          <AlertTriangle class="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
          <span>{{ error }}</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 pr-2 custom-scrollbar-minimal">
          <!-- Left Column: Record Details -->
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
              <div class="flex items-center text-xl font-semibold text-sky-700 dark:text-sky-400 mb-6 pb-3 border-b border-gray-300 dark:border-gray-600">
                <FileText class="h-6 w-6 mr-3" />
                Record Details
              </div>
              <div class="space-y-5">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label for="detail_tooth_number" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tooth Number*</label>
                    <input type="number" id="detail_tooth_number" v-model.number="formData.tooth_number" required
                           :disabled="isEditing"
                           class="form-input-field disabled:bg-gray-100 dark:disabled:bg-gray-700/70 disabled:cursor-not-allowed disabled:text-gray-500 dark:disabled:text-gray-400">
                  </div>
                  <div>
                    <label for="detail_record_status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Record Status*</label>
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
                </div>
                <div class="sm:col-span-2">
                  <label for="detail_condition" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Condition*</label>
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
                  <label for="detail_other_condition" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Specify Other Condition*</label>
                  <input type="text" id="detail_other_condition" v-model="formData.other_condition_text" required
                         placeholder="Describe the condition"
                         class="form-input-field">
                </div>
                <div class="sm:col-span-2">
                  <label for="detail_record_notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">General Notes</label>
                  <textarea id="detail_record_notes" v-model="formData.notes" rows="4"
                            placeholder="Add any general notes for this dental record..."
                            class="form-input-field"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Treatments -->
          <div class="lg:col-span-3 space-y-6">
            <div class="sticky top-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-lg shadow-md z-10 border border-gray-200 dark:border-gray-700">
              <div class="flex justify-between items-center">
                <h4 class="text-xl font-semibold text-sky-700 dark:text-sky-400 flex items-center">
                  <ListChecks class="h-6 w-6 mr-3" />
                  Treatments
                </h4>
                <button type="button" @click="addTreatment"
                        class="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-gray-900 transition-colors">
                  <PlusCircle class="h-5 w-5 mr-2" />
                  Add Treatment
                </button>
              </div>
            </div>

            <div v-if="!formData.treatments || formData.treatments.length === 0" class="bg-slate-100 dark:bg-gray-800/60 p-6 rounded-lg text-center text-slate-500 dark:text-slate-400 shadow border border-gray-200 dark:border-gray-700">
                <Info class="h-10 w-10 mx-auto mb-3 text-slate-400 dark:text-slate-500" />
                <p class="font-medium">No treatments added yet.</p>
                <p class="text-sm">Click "Add Treatment" to get started.</p>
            </div>

            <div v-for="(treatment, treatmentIndex) in formData.treatments" :key="treatmentIndex"
                 class="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl shadow-xl mb-6 border border-gray-200 dark:border-gray-700">
              
              <div class="flex justify-between items-center mb-5 pb-3 border-b border-gray-300 dark:border-gray-600">
                <h4 class="text-lg font-semibold text-sky-600 dark:text-sky-400 flex items-center">
                  <Stethoscope class="h-5 w-5 mr-2.5"/>
                  Treatment {{ treatmentIndex + 1 }}
                </h4>
                <button v-if="formData.treatments.length > 0" type="button" @click="removeTreatment(treatmentIndex)"
                        class="flex items-center text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium px-2 py-1 rounded-md hover:bg-red-100 dark:hover:bg-red-700/50 transition-colors">
                  <Trash2 class="h-4 w-4 mr-1" />
                  Remove
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label :for="`detail_treatment_type_${treatmentIndex}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Treatment Type*</label>
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
                  <label :for="`detail_treatment_cost_${treatmentIndex}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Estimated Cost</label>
                  <input type="number" step="0.01" :id="`detail_treatment_cost_${treatmentIndex}`" v-model.number="treatment.cost"
                         placeholder="0.00"
                         class="form-input-field">
                </div>
              </div>
              <div class="mt-5">
                <label :for="`detail_treatment_notes_${treatmentIndex}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Treatment Notes</label>
                <textarea :id="`detail_treatment_notes_${treatmentIndex}`" v-model="treatment.notes" rows="3"
                          placeholder="Add any notes specific to this treatment..."
                          class="form-input-field"></textarea>
              </div>
              <div class="mt-5 flex items-center">
                <input :id="`detail_xray_taken_${treatmentIndex}`" type="checkbox" v-model="treatment.xray_taken"
                       class="h-4 w-4 text-sky-600 border-gray-300 dark:border-gray-500 rounded focus:ring-sky-500 dark:bg-gray-700 dark:focus:ring-sky-600 dark:ring-offset-gray-800 cursor-pointer">
                <label :for="`detail_xray_taken_${treatmentIndex}`" class="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer">X-Ray Taken</label>
              </div>
              <div v-if="treatment.xray_taken" class="mt-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">X-Ray Image</label>
                <div class="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-sky-500 dark:hover:border-sky-400 transition-colors group">
                  <div class="space-y-1 text-center">
                    <UploadCloud class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors" />
                    <div class="flex text-sm text-gray-600 dark:text-gray-400">
                      <label :for="`detail_xray_image_input_${treatmentIndex}`" class="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-sky-600 dark:text-sky-400 hover:text-sky-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500 dark:ring-offset-gray-900">
                        <span>Upload a file</span>
                        <input :id="`detail_xray_image_input_${treatmentIndex}`" name="xray_image" type="file" @change="handleFileUpload($event, treatmentIndex)" class="sr-only">
                      </label>
                      <p class="pl-1">or drag and drop</p>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    <div v-if="treatment.xray_image_name || treatment.xray_image_url" class="pt-2">
                      <p v-if="treatment.xray_image_name" class="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        New: {{ treatment.xray_image_name }}
                      </p>
                      <p v-else-if="treatment.xray_image_url" class="text-sm text-sky-600 dark:text-sky-400 truncate max-w-xs" :title="treatment.xray_image_url">
                        Current: {{ treatment.xray_image_url.substring(treatment.xray_image_url.lastIndexOf('/') + 1) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Treatment Steps Section -->
              <div class="mt-8 pt-6 border-t border-gray-300 dark:border-gray-600">
                <div class="flex justify-between items-center mb-4">
                  <h5 class="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                    <ListOrdered class="h-5 w-5 mr-2.5 text-gray-600 dark:text-gray-300"/>
                    Treatment Steps
                  </h5>
                  <button type="button" @click="addStep(treatmentIndex)"
                          class="flex items-center px-3.5 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-900 transition-colors">
                    <Plus class="h-4 w-4 mr-1.5" />
                    Add Step
                  </button>
                </div>
                <div v-if="!treatment.steps || treatment.steps.length === 0" class="text-sm text-center text-gray-500 dark:text-gray-400 py-4 px-3 bg-slate-100 dark:bg-gray-700/50 rounded-md shadow-sm">
                  No steps added for this treatment.
                </div>
                <div v-else class="space-y-4">
                  <div v-for="(step, stepIndex) in treatment.steps" :key="stepIndex" class="bg-slate-50 dark:bg-gray-700/70 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-600/80">
                    <div class="flex justify-between items-center mb-3">
                       <p class="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                         <ChevronRight class="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400"/>
                         Step {{ stepIndex + 1 }}
                       </p>
                       <button type="button" @click="removeStep(treatmentIndex, stepIndex)"
                               class="flex items-center text-pink-500 hover:text-pink-700 dark:hover:text-pink-400 text-xs font-medium hover:bg-pink-100 dark:hover:bg-pink-700/40 p-1 rounded-md transition-colors">
                               <X class="h-3.5 w-3.5 mr-0.5"/> Remove
                       </button>
                    </div>
                    <div class="space-y-3">
                      <div>
                        <label :for="`detail_step_desc_${treatmentIndex}_${stepIndex}`" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description*</label>
                        <input type="text" :id="`detail_step_desc_${treatmentIndex}_${stepIndex}`" v-model="step.description" required placeholder="Step description"
                               class="form-input-field text-sm py-1.5">
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label :for="`detail_step_date_${treatmentIndex}_${stepIndex}`" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date</label>
                          <input type="date" :id="`detail_step_date_${treatmentIndex}_${stepIndex}`" v-model="step.step_date"
                                 class="form-input-field text-sm py-1.5">
                        </div>
                        <div>
                          <label :for="`detail_step_status_${treatmentIndex}_${stepIndex}`" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status*</label>
                          <select :id="`detail_step_status_${treatmentIndex}_${stepIndex}`" v-model="step.status" required
                                  class="form-input-field text-sm py-1.5">
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
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-4 pt-8 pb-4 border-t border-gray-300 dark:border-gray-700 mt-10">
          <button type="button" @click="$emit('back-to-list')"
                  class="px-5 py-2.5 border border-gray-400 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-gray-900 transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="isSubmitting"
                  class="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center transition-colors dark:focus:ring-offset-gray-900">
            <LoaderCircle v-if="isSubmitting" class="animate-spin h-5 w-5 mr-2.5" />
            {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Record' : 'Save Record') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, toRefs } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { 
  X, ClipboardEdit, LoaderCircle, Image, ArrowLeft, 
  FileText, ListChecks, PlusCircle, Info, Stethoscope, Trash2, UploadCloud, ListOrdered, Plus, ChevronRight, AlertTriangle 
} from 'lucide-vue-next';

const props = defineProps({
  recordDataProp: {
    type: Object,
    default: null
  },
  patientId: {
    type: [String, Number],
    required: true
  },
  initialToothNumberProp: {
    type: [String, Number],
    default: null
  },
  isCreatingNew: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'record-saved', 'error', 'back-to-list']);

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
    emit('error', 'Authentication token not found. Please log in.');
  }
  return token;
};

const handleFileUpload = (event, treatmentIndex) => {
  const file = event.target.files[0];
  const currentTreatment = formData.value.treatments[treatmentIndex];

  if (file) {
    if (file.size > 5 * 1024 * 1024) {
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
  if (!formData.value.treatments) {
    formData.value.treatments = [];
  }
  formData.value.treatments.push(defaultTreatment());
};

const removeTreatment = (treatmentIndex) => {
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
      tooth_number: props.initialToothNumberProp || formData.value.tooth_number,
    };
    if (!formData.value.treatments || formData.value.treatments.length === 0) {
        formData.value.treatments = [defaultTreatment()];
    }
  }
  error.value = null;
}, { immediate: true, deep: true });

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
  
 Object.keys(payload).forEach(key => {
    if (payload[key] === undefined || payload[key] === '') {
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
    
    const url = `${config.public.API_BASE_URL}/patients/${props.patientId}/dental-records`;
    
    const response = await axios.post(url, payload, { headers });

    emit('record-saved', response.data);
  } catch (err) {
    console.error('Error saving dental record:', err.response ? err.response.data : err);
    let errorMessage = 'An unexpected error occurred. Please check your connection and try again.';
    if (err.response) {
      if (err.response.status === 401) {
        errorMessage = 'Session expired or unauthorized. Please log in again.';
        emit('error', errorMessage);
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
        } else if (err.response.data.errors) {
          const messages = Object.values(err.response.data.errors).flat();
          errorMessage = `Validation failed: ${messages.join('; ')}`;
        } else {
          errorMessage = `An error occurred (Status: ${err.response.status}). Please try again.`;
        }
      }
    }
    error.value = errorMessage;
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  if (props.isCreatingNew && !props.recordDataProp && !props.initialToothNumberProp) {
      formData.value = initialFormData();
      isEditing.value = false;
  }
});

</script>

<style scoped>
.form-input-field {
  @apply w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700/60 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base transition-colors;
}

input:disabled, select:disabled, textarea:disabled {
  cursor: not-allowed;
  @apply bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400;
}

.custom-scrollbar-minimal::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar-minimal::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar-minimal::-webkit-scrollbar-thumb {
  background-color: #9ca3af;
  border-radius: 3px;
}
.custom-scrollbar-minimal::-webkit-scrollbar-thumb:hover {
  background-color: #6b7280;
}

.dark .custom-scrollbar-minimal::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}
.dark .custom-scrollbar-minimal::-webkit-scrollbar-thumb:hover {
  background-color: #374151;
}

.form-input-field:focus {
  @apply ring-offset-1 dark:ring-offset-gray-800 ring-offset-white;
}
</style>
