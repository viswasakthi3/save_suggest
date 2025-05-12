<template>
  <div class="bg-slate-50 dark:bg-slate-900 shadow-xl rounded-xl overflow-hidden">
    <!-- Compact header bar -->
    <div class="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-700 dark:to-purple-800 px-4 py-3 flex justify-between items-center">
      <button @click="$emit('back-to-list')" 
              class="flex items-center text-white text-sm font-medium hover:bg-white/20 py-1 px-2 rounded-md transition-colors">
        <ArrowLeft class="h-4 w-4 mr-1.5" />Back
      </button>
      <div class="text-white font-medium flex items-center">
        <div v-if="isEditing">Editing Tooth #{{ formData.tooth_number }}</div>
        <div v-else>New Tooth Record</div>
      </div>
      <button 
        type="submit"
        form="dental-record-form" 
        :disabled="isSubmitting"
        class="bg-white text-indigo-600 hover:bg-indigo-50 font-medium text-sm py-1 px-3 rounded-md shadow-sm flex items-center transition-colors disabled:opacity-60"
      >
        <LoaderCircle v-if="isSubmitting" class="animate-spin h-4 w-4 mr-1.5" />
        <Save v-else class="h-4 w-4 mr-1.5" />
        {{ isSubmitting ? 'Saving' : 'Save' }}
      </button>
    </div>

    <!-- Add debug information panel at the top for troubleshooting -->
    <div v-if="showDebugInfo" class="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
      <div class="flex justify-between items-center">
        <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-300">Debug Information</h3>
        <button @click="showDebugInfo = false" class="text-yellow-600 dark:text-yellow-400">
          <X class="h-4 w-4" />
        </button>
      </div>
      <div class="text-xs font-mono mt-2 overflow-auto max-h-40 bg-black/5 dark:bg-black/20 p-2 rounded">
        <p>Patient ID: {{ props.patientId }}</p>
        <p>Initial Tooth: {{ props.initialToothNumberProp }}</p>
        <p>Is Editing: {{ isEditing }}</p>
        <p>Record ID: {{ formData.id || 'New Record' }}</p>
        <p>Raw Record Data: {{ recordDataDebug }}</p>
      </div>
    </div>

    <!-- Main content in a two-column layout -->
    <div class="p-4">
      <!-- Error alert -->
      <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded text-sm text-red-600 dark:text-red-300 flex items-start">
        <AlertCircle class="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
        <span>{{ error }}</span>
      </div>

      <form id="dental-record-form" @submit.prevent="handleSubmit">
        <!-- Two-column layout for desktop -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <!-- Left column - Basic info -->
          <div class="space-y-4 lg:col-span-1">
            <!-- Tooth and Status Card -->
            <div class="bg-white dark:bg-slate-800 shadow-sm rounded-lg overflow-hidden">
              <div class="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                <h2 class="font-medium text-slate-800 dark:text-slate-200">Basic Information</h2>
              </div>
              <div class="p-4 space-y-4">
                <!-- Tooth number -->
                <div class="form-group">
                  <label for="detail_tooth_number" class="form-label">
                    <Pill class="h-3.5 w-3.5 inline mr-1 opacity-70" />
                    Tooth Number*
                  </label>
                  <input 
                    type="number" 
                    id="detail_tooth_number" 
                    v-model.number="formData.tooth_number" 
                    required
                    :disabled="isEditing"
                    class="form-input" 
                    placeholder="Enter tooth number"
                  />
                </div>
                
                <!-- Status -->
                <div class="form-group">
                  <label for="detail_record_status" class="form-label">
                    <Activity class="h-3.5 w-3.5 inline mr-1 opacity-70" />
                    Status*
                  </label>
                  <select id="detail_record_status" v-model="formData.status" required class="form-input">
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
            </div>
            
            <!-- Condition Card -->
            <div class="bg-white dark:bg-slate-800 shadow-sm rounded-lg overflow-hidden">
              <div class="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                <h2 class="font-medium text-slate-800 dark:text-slate-200">Condition</h2>
              </div>
              <div class="p-4">
                <div class="flex flex-wrap gap-2 mb-3">
                  <button 
                    v-for="condition in predefinedConditions" 
                    :key="condition"
                    type="button"
                    @click="formData.condition = condition"
                    class="px-2 py-1 text-xs rounded-full border transition-colors"
                    :class="formData.condition === condition 
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'"
                  >
                    {{ condition }}
                  </button>
                  
                  <button 
                    type="button"
                    @click="formData.condition = 'other'"
                    class="px-2 py-1 text-xs rounded-full border transition-colors"
                    :class="formData.condition === 'other'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'"
                  >
                    Other
                  </button>
                </div>

                <div v-if="formData.condition === 'other'" class="form-group animate-fadeIn">
                  <input 
                    type="text" 
                    id="detail_other_condition" 
                    v-model="formData.other_condition_text" 
                    required
                    placeholder="Specify condition"
                    class="form-input text-sm" 
                  />
                </div>
              </div>
            </div>
            
            <!-- Notes Card -->
            <div class="bg-white dark:bg-slate-800 shadow-sm rounded-lg overflow-hidden">
              <div class="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                <h2 class="font-medium text-slate-800 dark:text-slate-200">Notes</h2>
              </div>
              <div class="p-4">
                <textarea 
                  id="detail_record_notes" 
                  v-model="formData.notes" 
                  rows="3"
                  placeholder="Add any general notes..."
                  class="form-input"
                ></textarea>
              </div>
            </div>
            
            <!-- Summary Card -->
            <div class="bg-indigo-50 dark:bg-indigo-900/20 shadow-sm rounded-lg overflow-hidden">
              <div class="px-4 py-3 bg-indigo-100/50 dark:bg-indigo-900/40 border-b border-indigo-200 dark:border-indigo-800/50">
                <h2 class="font-medium text-indigo-900 dark:text-indigo-200 flex items-center">
                  <CheckCircle2 class="h-4 w-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                  Summary
                </h2>
              </div>
              <div class="p-4 text-sm">
                <div class="flex justify-between mb-2">
                  <span class="text-slate-500 dark:text-slate-400">Tooth:</span>
                  <span class="font-medium text-slate-800 dark:text-slate-200">
                    #{{ formData.tooth_number || '—' }}
                  </span>
                </div>
                <div class="flex justify-between mb-2">
                  <span class="text-slate-500 dark:text-slate-400">Condition:</span>
                  <span class="font-medium text-slate-800 dark:text-slate-200">
                    {{ formData.condition === 'other' ? formData.other_condition_text : formData.condition || '—' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500 dark:text-slate-400">Treatments:</span>
                  <span class="font-medium text-slate-800 dark:text-slate-200">
                    {{ formData.treatments?.length || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Right column - Treatments -->
          <div class="lg:col-span-2">
            <div class="bg-white dark:bg-slate-800 shadow-sm rounded-lg overflow-hidden">
              <div class="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600 flex justify-between items-center">
                <h2 class="font-medium text-slate-800 dark:text-slate-200 flex items-center">
                  <Stethoscope class="h-4 w-4 mr-1.5 opacity-70" />
                  Treatments
                </h2>
                <button 
                  type="button" 
                  @click="addTreatment"
                  class="text-xs flex items-center px-2 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 rounded transition-colors"
                >
                  <Plus class="h-3.5 w-3.5 mr-1" />
                  Add
                </button>
              </div>
              
              <!-- Empty state -->
              <div v-if="!formData.treatments || formData.treatments.length === 0" 
                  class="p-8 text-center">
                <Stethoscope class="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p class="text-sm text-slate-500 dark:text-slate-400">No treatments added yet</p>
                <button 
                  type="button" 
                  @click="addTreatment"
                  class="mt-3 text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                >
                  Add Treatment
                </button>
              </div>
              
              <!-- Treatment accordion list -->
              <div v-else class="divide-y divide-slate-200 dark:divide-slate-700">
                <div v-for="(treatment, treatmentIndex) in formData.treatments" 
                    :key="treatmentIndex"
                    class="relative">
                  <!-- Treatment header -->
                  <button 
                    type="button"
                    @click="toggleTreatment(treatmentIndex)"
                    class="w-full p-3 flex items-center justify-between focus:outline-none text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <div class="flex items-center">
                      <div class="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-medium mr-2">
                        {{ treatmentIndex + 1 }}
                      </div>
                      <div class="text-sm">
                        <span class="font-medium text-slate-800 dark:text-slate-200">
                          {{ getTreatmentTypeLabel(treatment.treatment_type) || 'New Treatment' }}
                        </span>
                        <span v-if="treatment.cost" class="text-xs text-slate-500 dark:text-slate-400 ml-2">
                          ${{ treatment.cost }}
                        </span>
                      </div>
                    </div>
                    <div class="flex items-center">
                      <span v-if="treatment.steps && treatment.steps.length" class="mr-3 px-1.5 py-0.5 text-xs bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-full">
                        {{ treatment.steps.length }}
                      </span>
                      <ChevronDown v-if="!treatment._expanded" class="h-4 w-4 text-slate-400" />
                      <ChevronUp v-else class="h-4 w-4 text-slate-400" />
                    </div>
                    
                    <!-- Delete button (absolutely positioned) -->
                    <button 
                      type="button" 
                      @click.stop="removeTreatment(treatmentIndex)"
                      class="absolute top-3 right-10 p-1 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                    >
                      <Trash2 class="h-3.5 w-3.5" />
                    </button>
                  </button>
                  
                  <!-- Treatment details -->
                  <div v-if="treatment._expanded" class="p-3 pt-0 bg-slate-50/50 dark:bg-slate-800/50 animate-fadeIn">
                    <!-- Compact form grid -->
                    <div class="grid grid-cols-2 gap-3 mt-2 mb-3">
                      <div class="form-group">
                        <label :for="`detail_treatment_type_${treatmentIndex}`" class="form-label-sm">Type*</label>
                        <select 
                          :id="`detail_treatment_type_${treatmentIndex}`" 
                          v-model="treatment.treatment_type" 
                          required 
                          class="form-input-sm"
                        >
                          <option disabled value="">Select treatment</option>
                          <option value="filling">Filling</option>
                          <option value="root_canal">Root Canal</option>
                          <option value="extraction">Extraction</option>
                          <option value="crown">Crown</option>
                          <option value="cleaning">Cleaning</option>
                          <option value="bridge">Bridge</option>
                          <option value="implant">Implant</option>
                          <option value="orthodontics">Orthodontics</option>
                          <option value="other_treatment">Other</option>
                        </select>
                      </div>
                      
                      <div class="form-group">
                        <label :for="`detail_treatment_cost_${treatmentIndex}`" class="form-label-sm">Cost</label>
                        <div class="relative">
                          <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <DollarSign class="h-3.5 w-3.5 text-slate-400" />
                          </div>
                          <input 
                            type="number" 
                            step="0.01" 
                            :id="`detail_treatment_cost_${treatmentIndex}`" 
                            v-model.number="treatment.cost"
                            placeholder="0.00"
                            class="form-input-sm pl-6"
                          />
                        </div>
                      </div>
                      
                      <div class="col-span-2">
                        <label :for="`detail_treatment_notes_${treatmentIndex}`" class="form-label-sm">Notes</label>
                        <textarea 
                          :id="`detail_treatment_notes_${treatmentIndex}`" 
                          v-model="treatment.notes" 
                          rows="2"
                          placeholder="Add treatment notes..."
                          class="form-input-sm"
                        ></textarea>
                      </div>
                    </div>
                    
                    <!-- X-ray section -->
                    <div class="flex items-center justify-between mb-3 text-sm">
                      <label class="flex items-center cursor-pointer">
                        <input 
                          :id="`detail_xray_taken_${treatmentIndex}`" 
                          type="checkbox" 
                          v-model="treatment.xray_taken"
                          class="sr-only"
                        />
                        <span class="relative w-8 h-4 bg-slate-200 rounded-full transition-colors duration-200 ease-in-out dark:bg-slate-700"
                              :class="{'bg-indigo-500 dark:bg-indigo-600': treatment.xray_taken}">
                          <span class="absolute left-0 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out transform dark:bg-slate-300"
                                :class="{'translate-x-4': treatment.xray_taken}">
                          </span>
                        </span>
                        <span class="ml-2 text-xs text-slate-700 dark:text-slate-300">X-Ray</span>
                      </label>
                      
                      <div v-if="treatment.xray_image_url" class="text-xs">
                        <button 
                          type="button"
                          @click="openImagePreview(treatment.xray_image_url)"
                          class="text-indigo-600 dark:text-indigo-400 hover:underline mr-2"
                        >
                          <Image class="h-3.5 w-3.5 inline mr-1" />
                          View
                        </button>
                        <button 
                          type="button"
                          @click="removeXrayImage(treatmentIndex)"
                          class="text-red-500 hover:text-red-700"
                        >
                          <Trash2 class="h-3.5 w-3.5 inline" />
                        </button>
                      </div>
                    </div>
                    
                    <div v-if="treatment.xray_taken && !treatment.xray_image_url" class="mb-3 animate-fadeIn">
                      <label :for="`detail_xray_image_input_${treatmentIndex}`" 
                             class="flex justify-center items-center p-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer">
                        <div class="text-center">
                          <Image class="mx-auto h-6 w-6 text-slate-400" />
                          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Click to upload X-ray image</p>
                        </div>
                        <input :id="`detail_xray_image_input_${treatmentIndex}`" 
                               type="file" 
                               class="sr-only" 
                               accept="image/*"
                               @change="handleFileUpload($event, treatmentIndex)">
                      </label>
                    </div>

                    <!-- Steps section -->
                    <div class="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                      <div class="flex justify-between items-center mb-2">
                        <h3 class="text-xs font-medium text-slate-700 dark:text-slate-300">
                          <ListChecks class="h-3.5 w-3.5 inline mr-1" />
                          Steps
                        </h3>
                        <button 
                          type="button" 
                          @click="addStep(treatmentIndex)"
                          class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <Plus class="h-3 w-3 inline mr-0.5" />
                          Add
                        </button>
                      </div>
                      
                      <!-- Empty steps message -->
                      <div v-if="!treatment.steps || treatment.steps.length === 0" class="text-center text-xs text-slate-500 dark:text-slate-400 py-2">
                        No steps added
                      </div>
                      
                      <!-- Compact steps list -->
                      <div v-else class="space-y-2">
                        <div v-for="(step, stepIndex) in treatment.steps" :key="stepIndex" 
                             class="border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 shadow-sm">
                          <div class="flex justify-between items-center px-2 py-1.5 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                            <div class="flex items-center">
                              <div class="flex-shrink-0 h-4 w-4 rounded-full mr-1.5 flex items-center justify-center text-[10px] font-medium"
                                   :class="getStepStatusColor(step.status)">
                                {{ stepIndex + 1 }}
                              </div>
                              <div class="text-xs font-medium text-slate-600 dark:text-slate-300">
                                {{ formatStepStatus(step.status) }}
                              </div>
                            </div>
                            <button 
                              type="button" 
                              @click="removeStep(treatmentIndex, stepIndex)"
                              class="text-slate-400 hover:text-red-500"
                            >
                              <X class="h-3.5 w-3.5" />
                            </button>
                          </div>
                          
                          <div class="p-2 space-y-2">
                            <input 
                              type="text" 
                              :id="`detail_step_desc_${treatmentIndex}_${stepIndex}`" 
                              v-model="step.description" 
                              required 
                              placeholder="Step description"
                              class="form-input-sm text-xs"
                            >
                            
                            <div class="grid grid-cols-2 gap-2">
                              <div class="relative">
                                <Calendar class="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-400" />
                                <input 
                                  type="date" 
                                  :id="`detail_step_date_${treatmentIndex}_${stepIndex}`" 
                                  v-model="step.step_date"
                                  class="form-input-sm pl-6 text-xs"
                                >
                              </div>
                              <select 
                                :id="`detail_step_status_${treatmentIndex}_${stepIndex}`" 
                                v-model="step.status" 
                                required
                                class="form-input-sm text-xs"
                              >
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
          </div>
        </div>
      </form>
    </div>

    <!-- Image preview modal -->
    <div v-if="previewImage" 
         class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
         @click="previewImage = null">
      <div class="max-w-3xl max-h-[80vh] relative">
        <img :src="previewImage" alt="X-ray preview" class="max-w-full max-h-full rounded-md object-contain" />
        <button 
          type="button"
          @click.stop="previewImage = null"
          class="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
        >
          <X class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { 
  ClipboardEdit, LoaderCircle, Image, ArrowLeft, CheckCircle, CheckCircle2,
  Circle, Trash2, X, Calendar, Plus, Pill, AlertCircle, 
  ListChecks, Activity, DollarSign, Save, ChevronDown, ChevronUp, Stethoscope
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

// Add debug flags
const showDebugInfo = ref(true); // Set to true for debugging
const recordDataDebug = ref('No data received');

const config = useRuntimeConfig();
const isEditing = ref(false);
const error = ref(null);
const isSubmitting = ref(false);
const previewImage = ref(null);

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
  steps: [],
  _expanded: true // UI state for expanded/collapsed view
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

const toggleTreatment = (index) => {
  formData.value.treatments[index]._expanded = !formData.value.treatments[index]._expanded;
};

const openImagePreview = (url) => {
  previewImage.value = url;
};

const getTreatmentSummary = () => {
  if (!formData.value.treatments || formData.value.treatments.length === 0) {
    return '';
  }
  
  const types = formData.value.treatments
    .filter(t => t.treatment_type)
    .map(t => getTreatmentTypeLabel(t.treatment_type));
  
  if (types.length === 0) return '';
  
  const uniqueTypes = [...new Set(types)];
  if (uniqueTypes.length <= 2) return `(${uniqueTypes.join(', ')})`;
  return `(${uniqueTypes.slice(0, 2).join(', ')} and more)`;
};

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

    // Create preview URL
    currentTreatment.xray_image_url = URL.createObjectURL(file);
    currentTreatment.xray_image = file;
    currentTreatment.xray_image_name = file.name;
    error.value = null; 
  } else {
    currentTreatment.xray_image = null;
    currentTreatment.xray_image_name = '';
  }
};

const handleFileDrop = (event, treatmentIndex) => {
  const dt = event.dataTransfer;
  const file = dt.files[0];
  
  if (file) {
    handleFileUpload({ target: { files: [file] } }, treatmentIndex);
  }
};

const removeXrayImage = (treatmentIndex) => {
  const currentTreatment = formData.value.treatments[treatmentIndex];
  if (currentTreatment.xray_image_url && currentTreatment.xray_image) {
    URL.revokeObjectURL(currentTreatment.xray_image_url);
  }
  currentTreatment.xray_image = null;
  currentTreatment.xray_image_name = '';
  currentTreatment.xray_image_url = '';
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

const getTreatmentTypeLabel = (type) => {
  const labels = {
    'filling': 'Filling',
    'root_canal': 'Root Canal',
    'extraction': 'Extraction',
    'crown': 'Crown',
    'cleaning': 'Cleaning',
    'bridge': 'Bridge',
    'implant': 'Implant',
    'orthodontics': 'Orthodontics',
    'other_treatment': 'Other Treatment'
  };
  return labels[type] || type || 'Not specified';
};

const getStatusBadgeClass = (status) => {
  const classes = {
    'initial': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'diagnosis_planned': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    'treatment_planned': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    'undergoing_treatment': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    'monitoring': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    'completed': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
  };
  return classes[status] || classes['initial'];
};

const formatStatus = (status) => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatStepStatus = (status) => {
  const labels = {
    'pending': 'Pending',
    'in_progress': 'In Progress',
    'done': 'Done',
    'skipped': 'Skipped'
  };
  return labels[status] || status;
};

const getStepStatusColor = (status) => {
  const colors = {
    'pending': 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    'in_progress': 'bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-300',
    'done': 'bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-300',
    'skipped': 'bg-red-200 text-red-700 dark:bg-red-800 dark:text-red-300'
  };
  return colors[status] || colors['pending'];
};

const getStepStatusBadgeClass = (status) => {
  const colors = {
    'pending': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    'in_progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'done': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    'skipped': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
  };
  return colors[status] || colors['pending'];
};

// Force refresh the form data if needed
const forceRefreshForm = () => {
  if (!formData.value.id && props.recordDataProp?.id) {
    console.log("Force refreshing form with record data:", props.recordDataProp);
    processRecordData(props.recordDataProp);
  }
};

// Create a separate function to process the record data for reusability
const processRecordData = (data) => {
  if (data && data.id) {
    recordDataDebug.value = JSON.stringify(data).substring(0, 100) + '...';
    console.log("Processing record data:", data);
    
    isEditing.value = true;
    let conditionValue = data.condition || '';
    let otherConditionTextValue = '';
    
    if (conditionValue && !predefinedConditions.includes(conditionValue)) {
      otherConditionTextValue = conditionValue;
      conditionValue = 'other';
    }

    const processedTreatments = (data.treatments && data.treatments.length > 0)
      ? data.treatments.map(t => ({
          ...defaultTreatment(),
          ...t,
          xray_image: null,
          xray_image_name: t.xray_image_url ? 'Image loaded' : (t.xray_image_name || ''),
          xray_image_url: t.xray_image_url || '',
          steps: t.steps 
            ? t.steps.map(s => ({ ...defaultStep(), ...s })) 
            : [],
          _expanded: true
        }))
      : [defaultTreatment()];

    // Explicitly create a new object to ensure reactivity
    formData.value = {
      id: data.id,
      tooth_number: data.tooth_number,
      condition: conditionValue,
      other_condition_text: otherConditionTextValue,
      notes: data.notes || '',
      status: data.status || 'initial',
      treatments: processedTreatments
    };
    
    console.log("Form data updated:", formData.value);
  } else {
    recordDataDebug.value = 'No valid record data';
    isEditing.value = false;
    formData.value = {
      ...initialFormData(),
      tooth_number: props.initialToothNumberProp || '',
    };
    if (!formData.value.treatments || formData.value.treatments.length === 0) {
      formData.value.treatments = [defaultTreatment()];
    }
  }
  error.value = null;
};

// Watch for prop changes with immediate effect
watch(() => props.recordDataProp, (newVal) => {
  processRecordData(newVal);
}, { immediate: true, deep: true });

// Watch for prop changes to update the form data
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
    error.value = formData.value.condition === 'other' ? 'Please specify the other condition.' : 'Condition is required.';
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
        // Auto-expand the treatment with the error
        treatment._expanded = true;
        return;
      }
      
      if (treatment.steps) {
        for (let j = 0; j < treatment.steps.length; j++) {
          const step = treatment.steps[j];
          if (!step.description) {
            error.value = `Description is required for Step #${j + 1} in Treatment #${i + 1}.`;
            isSubmitting.value = false;
            // Auto-expand the treatment with the error
            treatment._expanded = true;
            return;
          }
          if (!step.status) {
             error.value = `Status is required for Step #${j + 1} in Treatment #${i + 1}.`;
             isSubmitting.value = false;
             treatment._expanded = true;
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

  // Prepare payload (strip UI-specific properties)
  const payload = {
    tooth_number: formData.value.tooth_number,
    condition: finalCondition,
    notes: formData.value.notes,
    status: formData.value.status,
    treatments: formData.value.treatments.map(t => {
      const { _expanded, ...treatment } = t;
      return {
        ...treatment,
        treatment_type: treatment.treatment_type,
        cost: treatment.cost ? parseFloat(treatment.cost) : undefined,
        notes: treatment.notes,
        xray_taken: treatment.xray_taken,
        xray_image_url: treatment.xray_taken 
          ? (treatment.xray_image ? `PENDING_UPLOAD_${treatment.xray_image_name}` : treatment.xray_image_url || undefined) 
          : undefined,
        steps: treatment.steps?.map((step, index) => ({
          step_order: index + 1,
          description: step.description,
          step_date: step.step_date || null,
          status: step.status
        }))
      };
    })
  };

  // Clean payload
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
      if (cleanedTreatment[tKey] === undefined || cleanedTreatment[tKey] === '' || 
         (Array.isArray(cleanedTreatment[tKey]) && cleanedTreatment[tKey].length === 0)) {
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
    
    let url = `${config.public.API_BASE_URL}/patients/${props.patientId}/dental-records`;
    let method = 'post';
    
    // Use PUT for updates if we have a record ID
    if (isEditing.value && formData.value.id) {
      url = `${url}/${formData.value.id}`;
      method = 'put';
    }
    
    const response = await axios({
      method,
      url,
      data: payload,
      headers
    });

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

// Enhanced initialization on mount
onMounted(() => {
  console.log("Component mounted with props:", {
    recordDataProp: props.recordDataProp,
    patientId: props.patientId,
    initialToothNumber: props.initialToothNumberProp,
    isCreatingNew: props.isCreatingNew
  });
  
  if (props.recordDataProp) {
    console.log("Initial record data:", props.recordDataProp);
    nextTick(() => {
      forceRefreshForm();
    });
  } else if (props.isCreatingNew) {
    console.log("Creating new record");
    formData.value = initialFormData();
    isEditing.value = false;
  }

  // Add keypress to toggle debug panel
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      showDebugInfo.value = !showDebugInfo.value;
    }
  });
});
</script>

<style scoped>
.form-label {
  @apply block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1;
}

.form-label-sm {
  @apply block text-xs font-medium text-slate-600 dark:text-slate-400 mb-0.5;
}

.form-input {
  @apply w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm;
}

.form-input-sm {
  @apply w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-xs;
}

.form-group {
  @apply space-y-1;
}

.animate-fadeIn {
  animation: fadeIn 0.15s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
