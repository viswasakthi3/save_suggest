<template>
  <div class="record-detail-view">
    <!-- 1. Back Button -->
    <div class="top-navigation-bar">
      <button @click="$emit('back-to-list')" class="btn btn-subtle btn-back">
        <ArrowLeft size="18" />
        <span>Go Back</span>
      </button>
    </div>

    <div class="container">
      <form @submit.prevent="handleSubmit">
        <!-- Alert Message -->
        <TransitionFade>
          <div v-if="error" class="alert alert-error">
            <AlertTriangle class="alert-icon" />
            <p>{{ error }}</p>
            <button @click="error = null" class="alert-close" type="button" aria-label="Close">
              <X size="16" />
            </button>
          </div>
        </TransitionFade>

        <div class="main-layout">
          <!-- Left Column: Record Details -->
          <div class="card record-details">
            <div class="card-header">
              <div class="card-title">
                <FileText size="20" />
                <h2>Record Details</h2>
              </div>
            </div>
            <div class="card-content">
              <div class="form-row two-cols">
                <div class="form-group">
                  <label for="detail_tooth_number" class="form-label required">Tooth Number</label>
                  <input type="number"
                         id="detail_tooth_number"
                         v-model.number="formData.tooth_number"
                         required
                         :disabled="isEditing"
                         class="form-input"
                         placeholder="Enter tooth number">
                </div>
                <div class="form-group">
                  <label for="detail_status" class="form-label required">Record Status</label>
                  <div class="select-wrapper">
                    <select id="detail_status"
                            v-model="formData.status"
                            required
                            class="form-select status-select">
                      <option v-for="status in statusOptions" 
                              :key="status.value" 
                              :value="status.value">
                        {{ status.label }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label required">Condition</label>
                <div class="condition-badges">
                  <button 
                    v-for="condition in predefinedConditions" 
                    :key="condition"
                    @click="selectCondition(condition)"
                    :class="[
                      'condition-badge', 
                      formData.condition === condition ? 'condition-badge-selected' : ''
                    ]"
                    type="button">
                    {{ condition }}
                  </button>
                  <button 
                    @click="selectCondition('other')"
                    :class="[
                      'condition-badge', 
                      formData.condition === 'other' ? 'condition-badge-selected' : '',
                      'condition-badge-other'
                    ]"
                    type="button">
                    Other
                  </button>
                </div>
              </div>
              <TransitionExpand>
                <div class="form-group" v-if="formData.condition === 'other'">
                  <label for="detail_other_condition" class="form-label required">Specify Other Condition</label>
                  <input type="text"
                         id="detail_other_condition"
                         v-model="formData.other_condition_text"
                         required
                         placeholder="Describe the condition"
                         class="form-input">
                </div>
              </TransitionExpand>
              <div class="form-group">
                <label for="detail_record_notes" class="form-label">General Notes</label>
                <textarea id="detail_record_notes"
                          v-model="formData.notes"
                          rows="4"
                          placeholder="Add any general notes for this dental record..."
                          class="form-textarea"></textarea>
              </div>
            </div>
          </div>

          <!-- Right Column: Treatments -->
          <div class="treatments-container">
            <div class="treatments-header">
              <div class="section-title">
                <ListChecks size="20" />
                <h2>Treatments</h2>
              </div>
              <button type="button"
                      @click="addTreatment"
                      class="btn btn-primary btn-with-icon">
                <PlusCircle size="18" />
                <span>Add Treatment</span>
              </button>
            </div>

            <div v-if="!formData.treatments || formData.treatments.length === 0" class="empty-state">
              <div class="empty-state-icon">
                <Info size="36" />
              </div>
              <h3>No treatments added yet</h3>
              <p>Click "Add Treatment" to begin creating a treatment plan</p>
            </div>

            <TransitionGroup name="treatment-list" tag="div" class="treatments-list">
              <div v-for="(treatment, treatmentIndex) in formData.treatments"
                   :key="treatmentIndex"
                   class="treatment-card card">
                <div class="card-header">
                  <div class="card-title">
                    <Stethoscope size="18" />
                    <h3>{{ getTreatmentTitle(treatment.treatment_type, treatmentIndex) }}</h3>
                  </div>
                  <button v-if="formData.treatments.length > 0"
                          type="button"
                          @click="removeTreatment(treatmentIndex)"
                          class="btn btn-icon btn-danger-subtle">
                    <Trash2 size="16" aria-label="Remove treatment" />
                  </button>
                </div>

                <div class="card-content">
                  <div class="form-row two-cols">
                    <div class="form-group">
                      <label :for="`detail_treatment_type_${treatmentIndex}`" class="form-label required">Treatment Type</label>
                      <div class="select-wrapper">
                        <select :id="`detail_treatment_type_${treatmentIndex}`"
                                v-model="treatment.treatment_type"
                                required
                                class="form-select">
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
                    </div>
                    <div class="form-group">
                      <label :for="`detail_treatment_cost_${treatmentIndex}`" class="form-label">Estimated Cost</label>
                      <div class="input-with-prefix">
                        <span class="input-prefix">$</span>
                        <input type="number"
                               step="0.01"
                               :id="`detail_treatment_cost_${treatmentIndex}`"
                               v-model.number="treatment.cost"
                               placeholder="0.00"
                               class="form-input has-prefix">
                      </div>
                    </div>
                  </div>

                  <!-- 3. Treatment Notes Toggle & X-Ray -->
                  <div class="treatment-options-row">
                    <div class="form-switch">
                      <input :id="`detail_xray_taken_${treatmentIndex}`"
                             type="checkbox"
                             v-model="treatment.xray_taken"
                             class="switch-input">
                      <label :for="`detail_xray_taken_${treatmentIndex}`" class="switch-label">
                        X-Ray Taken
                      </label>
                    </div>
                    <button type="button"
                            @click="toggleTreatmentNotes(treatmentIndex)"
                            class="btn btn-link btn-toggle-notes">
                      <MessageSquare size="16" />
                      <span>{{ treatmentNotesVisibility[treatmentIndex] ? 'Hide Notes' : 'Add/View Notes' }}</span>
                    </button>
                  </div>

                  <TransitionExpand>
                    <div v-if="treatmentNotesVisibility[treatmentIndex]" class="treatment-notes-area">
                      <label :for="`detail_treatment_notes_${treatmentIndex}`" class="form-label">Treatment Notes</label>
                      <textarea :id="`detail_treatment_notes_${treatmentIndex}`"
                                v-model="treatment.notes"
                                rows="3"
                                placeholder="Add any notes specific to this treatment..."
                                class="form-textarea"></textarea>
                    </div>
                  </TransitionExpand>

                  <TransitionExpand>
                    <div v-if="treatment.xray_taken" class="xray-upload">
                      <label class="form-label">X-Ray Image</label>
                      <div class="upload-zone" @dragover.prevent @drop.prevent="handleFileDrop($event, treatmentIndex)">
                        <input :id="`detail_xray_image_input_${treatmentIndex}`"
                               type="file"
                               @change="handleFileUpload($event, treatmentIndex)"
                               accept="image/png,image/jpeg,image/gif"
                               class="file-input">
                        <div class="upload-content">
                          <div class="upload-icon">
                            <UploadCloud size="32" />
                          </div>
                          <div class="upload-text">
                            <strong>Drag & drop image here</strong>
                            <span>or <label :for="`detail_xray_image_input_${treatmentIndex}`" class="upload-browse">browse files</label></span>
                            <small>PNG, JPG, GIF up to 5MB</small>
                          </div>
                        </div>
                        <TransitionFade>
                          <div v-if="treatment.xray_image_name || treatment.xray_image_url" class="upload-file-info">
                            <div class="file-info">
                              <Image size="16" />
                              <span v-if="treatment.xray_image_name" class="file-name">
                                New: {{ treatment.xray_image_name }}
                              </span>
                              <span v-else-if="treatment.xray_image_url" class="file-name">
                                Current: {{ treatment.xray_image_url.substring(treatment.xray_image_url.lastIndexOf('/') + 1) }}
                              </span>
                            </div>
                            <button @click="clearXrayImage(treatmentIndex)" type="button" class="btn-clear-file" aria-label="Remove file">
                              <X size="14" />
                            </button>
                          </div>
                        </TransitionFade>
                      </div>
                    </div>
                  </TransitionExpand>

                  <!-- Treatment Steps Section -->
                  <div class="treatment-steps">
                    <div class="steps-header">
                      <div class="section-title">
                        <ListOrdered size="18" />
                        <h4>Treatment Steps</h4>
                      </div>
                      <button type="button"
                              @click="addStep(treatmentIndex)"
                              class="btn btn-secondary btn-sm btn-with-icon">
                        <Plus size="14" />
                        <span>Add Step</span>
                      </button>
                    </div>

                    <div v-if="!treatment.steps || treatment.steps.length === 0" class="steps-empty-state">
                      <p>No steps added for this treatment</p>
                    </div>

                    <TransitionGroup name="step-list" tag="div" class="steps-list">
                      <div v-for="(step, stepIndex) in treatment.steps"
                          :key="stepIndex"
                          class="step-item">
                        <div class="step-header">
                          <div class="step-number">
                            <span>Step {{ stepIndex + 1 }}</span>
                          </div>
                          <button type="button"
                                  @click="removeStep(treatmentIndex, stepIndex)"
                                  class="btn btn-icon btn-xs">
                            <X size="14" aria-label="Remove step" />
                          </button>
                        </div>
                        <div class="step-content">
                          <div class="form-group">
                            <label :for="`detail_step_desc_${treatmentIndex}_${stepIndex}`" class="form-label required">Description</label>
                            <input type="text"
                                  :id="`detail_step_desc_${treatmentIndex}_${stepIndex}`"
                                  v-model="step.description"
                                  required
                                  placeholder="Step description"
                                  class="form-input">
                          </div>
                          <div class="form-row two-cols">
                            <div class="form-group">
                              <label :for="`detail_step_date_${treatmentIndex}_${stepIndex}`" class="form-label">Date</label>
                              <UPopover :popper="{ placement: 'bottom-start' }">
                                <UButton 
                                  :id="`detail_step_date_${treatmentIndex}_${stepIndex}`"
                                  class="date-picker-button"
                                  color="white"
                                  variant="outline"
                                  icon="i-heroicons-calendar-days-20-solid"
                                  :label="step.step_date ? getFormattedDate(step.step_date) : 'Select date'"
                                />
                                <template #panel="{ close }">
                                  <UCalendar 
                                    v-model="step.step_date" 
                                    class="p-2" 
                                    :min="new Date(2020, 0, 1)"
                                    :max="new Date(2030, 11, 31)"
                                    @update:model-value="close"
                                  />
                                </template>
                              </UPopover>
                            </div>
                            <div class="form-group">
                              <label :for="`detail_step_status_${treatmentIndex}_${stepIndex}`" class="form-label required">Status</label>
                              <div class="step-status-tabs">
                                <button 
                                  v-for="stepStatus in stepStatusOptions" 
                                  :key="stepStatus.value"
                                  @click="step.status = stepStatus.value"
                                  type="button"
                                  :class="[
                                    'status-tab',
                                    step.status === stepStatus.value ? 'status-tab-active' : '',
                                    `status-tab-${stepStatus.color}`
                                  ]"
                                >
                                  {{ stepStatus.label }}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TransitionGroup>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button"
                  @click="$emit('back-to-list')"
                  class="btn btn-outline">
            Cancel
          </button>
          <button type="submit"
                  :disabled="isSubmitting"
                  class="btn btn-primary">
            <LoaderCircle v-if="isSubmitting" class="btn-icon spin" />
            <span>{{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Record' : 'Save Record') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, h } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  X, ClipboardEdit, LoaderCircle, Image, ArrowLeft, FileText,
  ListChecks, PlusCircle, Info, Stethoscope, Trash2, UploadCloud,
  ListOrdered, Plus, AlertTriangle, MessageSquare
} from 'lucide-vue-next';

// Function to format date for display
const getFormattedDate = (date) => {
  if (!date) return 'Select date';
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'Invalid date';
  }
};

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

// Format date for step date picker
const formatDate = (dateString) => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  
  // Try to parse the date string
  try {
    return new Date(dateString);
  } catch (e) {
    console.error('Error parsing date:', e);
    return null;
  }
};

const predefinedConditions = ["Healthy", "Decayed", "Filled", "Missing", "Cracked", "Wisdom", "Impacted"];

const statusOptions = [
  { value: 'initial', label: 'Initial', color: 'blue', step: 1 },
  { value: 'diagnosis_planned', label: 'Diagnosis Planned', color: 'indigo', step: 2 },
  { value: 'intreatment', label: 'In Treatment', color: 'yellow', step: 3 },
  { value: 'completed', label: 'Completed', color: 'emerald', step: 4 }
];

const stepStatusOptions = [
  { value: 'pending', label: 'Pending', color: 'blue' },
  { value: 'in_progress', label: 'In Progress', color: 'yellow' },
  { value: 'done', label: 'Done', color: 'green' },
  { value: 'skipped', label: 'Skipped', color: 'red' },
];

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

// For Treatment Notes Toggle
const treatmentNotesVisibility = ref([]);

// Function to format treatment type for display
const getTreatmentTitle = (type, index) => {
  if (!type) return `Treatment ${index + 1}`;
  
  // Format the treatment type by capitalizing and replacing underscores
  const formattedType = type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return formattedType || `Treatment ${index + 1}`;
};

const initializeTreatmentNotesVisibility = (treatmentsArray) => {
  treatmentNotesVisibility.value = treatmentsArray ? treatmentsArray.map(() => false) : [];
};

const selectCondition = (condition) => {
  formData.value.condition = condition;
  if (condition !== 'other') {
    formData.value.other_condition_text = '';
  }
};

const toggleTreatmentNotes = (treatmentIndex) => {
  treatmentNotesVisibility.value[treatmentIndex] = !treatmentNotesVisibility.value[treatmentIndex];
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
  handleFileProcess(file, treatmentIndex);
};

const handleFileDrop = (event, treatmentIndex) => {
  const file = event.dataTransfer.files[0];
  handleFileProcess(file, treatmentIndex);
};

const handleFileProcess = (file, treatmentIndex) => {
  const currentTreatment = formData.value.treatments[treatmentIndex];

  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'File size exceeds 5MB limit.';
      currentTreatment.xray_image = null;
      currentTreatment.xray_image_name = '';
      return;
    }
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      error.value = 'Invalid file type. Only PNG, JPG, GIF allowed.';
      currentTreatment.xray_image = null;
      currentTreatment.xray_image_name = '';
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

const clearXrayImage = (treatmentIndex) => {
  const treatment = formData.value.treatments[treatmentIndex];
  treatment.xray_image = null;
  treatment.xray_image_name = '';
  treatment.xray_image_url = '';
};

const addTreatment = () => {
  if (!formData.value.treatments) {
    formData.value.treatments = [];
  }
  formData.value.treatments.push(defaultTreatment());
  treatmentNotesVisibility.value.push(false); // Sync visibility state
};

const removeTreatment = (treatmentIndex) => {
  formData.value.treatments.splice(treatmentIndex, 1);
  treatmentNotesVisibility.value.splice(treatmentIndex, 1); // Sync visibility state
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
            steps: t.steps ? JSON.parse(JSON.stringify(t.steps)).map(s => {
              // Convert date string to Date object for the date picker
              const step = { ...defaultStep(), ...s };
              if (step.step_date) {
                step.step_date = formatDate(step.step_date);
              }
              return step;
            }) : []
          }))
        : [defaultTreatment()]
    };
  } else {
    isEditing.value = false;
    formData.value = {
      ...initialFormData(),
      tooth_number: props.initialToothNumberProp || (formData.value.tooth_number || null), // Ensure tooth_number is set if available
    };
    if (!formData.value.treatments || formData.value.treatments.length === 0) {
        formData.value.treatments = [defaultTreatment()];
    }
  }
  initializeTreatmentNotesVisibility(formData.value.treatments);
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
  
  // Format dates before submission
  formatDatesBeforeSubmit();
  
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

  // Clean up the payload
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined || payload[key] === '') {
      if (key !== 'notes') { // Allow empty notes
        delete payload[key];
      }
    }
  });
  
  payload.treatments = payload.treatments.map(treatment => {
    const cleanedTreatment = { ...treatment };
    Object.keys(cleanedTreatment).forEach(tKey => {
      if (cleanedTreatment[tKey] === undefined || cleanedTreatment[tKey] === '' || (Array.isArray(cleanedTreatment[tKey]) && cleanedTreatment[tKey].length === 0)) {
        if (tKey === 'steps' && Array.isArray(cleanedTreatment[tKey]) && cleanedTreatment[tKey].length === 0) {
           delete cleanedTreatment[tKey];
        } else if (tKey !== 'notes' && (cleanedTreatment[tKey] === undefined || cleanedTreatment[tKey] === '')) { // Allow empty notes for treatment
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
                // keep null step_date
             } else if (sKey !== 'description' && (cleanedStep[sKey] === undefined || cleanedStep[sKey] === '' || cleanedStep[sKey] === null)) { // description is required
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
  // formData and treatmentNotesVisibility initialization is handled by the immediate watch on recordDataProp
});

// Define reusable transition components
const TransitionFade = {
  name: 'fade',
  setup(props, { slots }) {
    return () => h('transition', {
      name: 'fade',
      mode: 'out-in',
      appear: true
    }, slots.default?.())
  }
};

const TransitionExpand = {
  name: 'expand',
  setup(props, { slots }) {
    return () => h('transition', {
      name: 'expand',
      appear: true
    }, slots.default?.())
  }
};

// Function to format dates before submission
const formatDatesBeforeSubmit = () => {
  formData.value.treatments.forEach(treatment => {
    if (treatment.steps) {
      treatment.steps.forEach(step => {
        if (step.step_date instanceof Date) {
          step.step_date = step.step_date.toISOString().split('T')[0];
        }
      });
    }
  });
};
</script>

<style>
:root {
  --color-primary: 14 165 233; /* sky-500 */
  --color-primary-light: 186 230 253; /* sky-200 */
  --color-primary-dark: 3 105 161; /* sky-700 */
  --color-secondary: 20 184 166; /* teal-500 */
  --color-danger: 239 68 68; /* red-500 */
  --color-success: 34 197 94; /* green-500 */
  --color-warning: 245 158 11; /* amber-500 */
  --color-surface: 255 255 255; /* white - For card backgrounds */
  --color-surface-hover: 243 244 246; /* gray-100 */
  --color-surface-muted: 249 250 251; /* gray-50 */
  --color-bg: 248 250 252; /* slate-50 - For page background and input backgrounds */
  --color-border: 226 232 240; /* slate-200 */
  --color-text: 15 23 42; /* slate-900 */
  --color-text-muted: 100 116 139; /* slate-500 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --container-max: 1280px;
  --container-padding: 1.5rem;
  --form-control-height: 2.75rem;
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  --font-family-heading: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.dark {
  --color-primary: 56 189 248; /* sky-400 */
  --color-primary-light: 2 132 199; /* sky-600 */
  --color-primary-dark: 125 211 252; /* sky-300 */
  --color-surface: 31 41 55; /* gray-800 */
  --color-surface-hover: 55 65 81; /* gray-700 */
  --color-surface-muted: 17 24 39; /* gray-900 */
  --color-bg: 17 24 39; /* gray-900 */
  --color-border: 55 65 81; /* gray-700 */
  --color-text: 248 250 252; /* slate-50 */
  --color-text-muted: 156 163 175; /* gray-400 */
}

.record-detail-view {
  min-height: calc(100vh - var(--header-height, 0px));
  background-color: rgb(var(--color-bg));
  padding-bottom: 2rem;
  font-family: var(--font-family-sans);
  letter-spacing: -0.01em;
  line-height: 1.5;
}

.top-navigation-bar {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 1rem var(--container-padding) 0.5rem;
  display: flex;
  align-items: center;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgb(var(--color-text-muted));
}

.btn-back:hover {
  color: rgb(var(--color-primary-dark));
  border-color: rgb(var(--color-primary-dark) / 0.5);
}

.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

.main-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-top: 1rem;
  margin-bottom: 2rem;
}

@media (min-width: 1024px) {
  .main-layout {
    grid-template-columns: 2fr 3fr;
    gap: 2.5rem;
  }
}

.card {
  background-color: rgb(var(--color-surface));
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  border: 1px solid rgb(var(--color-border));
  height: fit-content;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgb(var(--color-border) / 0.7);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: rgb(var(--color-primary-dark));
}

.card-title h2, .card-title h3, .card-title h4 {
  margin: 0;
  font-weight: 600;
  font-family: var(--font-family-heading);
  color: rgb(var(--color-primary-dark));
  letter-spacing: -0.02em;
}

.card-content {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.form-row.two-cols {
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .form-row.two-cols {
    grid-template-columns: 1fr 1fr;
  }
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: rgb(var(--color-text));
}

.form-label.required::after {
  content: "*";
  color: rgb(var(--color-danger));
  margin-left: 0.25rem;
}

.form-input, .form-select, .form-textarea {
  display: block;
  width: 100%;
  padding: 0.625rem 0.875rem;
  background-color: rgb(var(--color-bg));
  border: 1px solid rgb(var(--color-border));
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-family: var(--font-family-sans);
  line-height: 1.5;
  color: rgb(var(--color-text));
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  border-color: rgb(var(--color-primary));
  box-shadow: 0 0 0 3px rgb(var(--color-primary-light) / 0.5);
  outline: none;
  background-color: rgb(var(--color-surface));
}

.form-input::placeholder, .form-textarea::placeholder {
  color: rgb(var(--color-text-muted) / 0.7);
}

.form-input:disabled, .form-select:disabled, .form-textarea:disabled {
  background-color: rgb(var(--color-surface-muted) / 0.5);
  color: rgb(var(--color-text-muted));
  cursor: not-allowed;
}

.form-textarea {
  min-height: 5rem;
  resize: vertical;
}

.select-wrapper {
  position: relative;
}

.select-wrapper::after {
  content: "▼";
  font-size: 0.7em;
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgb(var(--color-text-muted));
  pointer-events: none;
}

.form-select {
  appearance: none;
  padding-right: 2.5rem;
}

.input-with-prefix {
  position: relative;
  display: flex;
}

.input-prefix {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgb(var(--color-text-muted));
  pointer-events: none;
}

.form-input.has-prefix {
  padding-left: 1.75rem;
}

.form-switch {
  display: flex;
  align-items: center;
}

.switch-input {
  appearance: none;
  width: 2.5rem;
  height: 1.25rem;
  background-color: rgb(var(--color-text-muted) / 0.3);
  border-radius: 999px;
  position: relative;
  margin-right: 0.75rem;
  transition: background-color var(--transition-fast);
  cursor: pointer;
}

.switch-input:checked {
  background-color: rgb(var(--color-primary));
}

.switch-input::before {
  content: "";
  position: absolute;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  left: 0.125rem;
  top: 0.125rem;
  background-color: white;
  transition: transform var(--transition-normal);
}

.switch-input:checked::before {
  transform: translateX(1.25rem);
}

.switch-label {
  font-size: 0.9375rem;
  cursor: pointer;
  user-select: none;
  color: rgb(var(--color-text));
}

.treatment-options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-link {
  background: none;
  border: none;
  color: rgb(var(--color-primary));
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.btn-link:hover {
  color: rgb(var(--color-primary-dark));
  background-color: rgb(var(--color-primary-light) / 0.3);
}

.btn-toggle-notes svg {
  margin-bottom: -2px;
}

.treatment-notes-area {
  margin-top: 0.75rem;
  margin-bottom: 1.25rem;
}

.xray-upload {
  margin-top: 1.25rem;
}

.upload-zone {
  border: 2px dashed rgb(var(--color-border));
  border-radius: var(--radius-lg);
  padding: 2rem 1.5rem;
  text-align: center;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
  position: relative;
  cursor: pointer;
  background-color: rgb(var(--color-bg) / 0.5);
}

.upload-zone:hover, .upload-zone:focus-within {
  border-color: rgb(var(--color-primary));
  background-color: rgb(var(--color-primary-light) / 0.15);
}

.file-input {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-icon {
  color: rgb(var(--color-text-muted) / 0.7);
  margin-bottom: 1rem;
}

.upload-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.upload-browse {
  color: rgb(var(--color-primary));
  cursor: pointer;
  font-weight: 500;
  transition: color var(--transition-fast);
  text-decoration: underline;
}

.upload-browse:hover {
  color: rgb(var(--color-primary-dark));
}

.upload-text strong {
  font-weight: 500;
  color: rgb(var(--color-text));
}

.upload-text small {
  color: rgb(var(--color-text-muted));
  font-size: 0.75rem;
}

.upload-file-info {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background-color: rgb(var(--color-primary-light) / 0.15);
  border-radius: var(--radius-md);
  border: 1px solid rgb(var(--color-primary-light) / 0.4);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(var(--color-primary-dark));
  font-size: 0.875rem;
  font-weight: 500;
}

.file-name {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-clear-file {
  background: none;
  border: none;
  color: rgb(var(--color-text-muted));
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.btn-clear-file:hover {
  color: rgb(var(--color-danger));
  background-color: rgb(var(--color-danger) / 0.1);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: var(--radius-md);
  padding: 0.625rem 1.25rem;
  transition: all var(--transition-fast);
  cursor: pointer;
  font-size: 0.9375rem;
  line-height: 1.5;
  border: 1px solid transparent;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  border-radius: var(--radius-sm);
}

.btn-primary {
  background-color: rgb(var(--color-primary));
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: rgb(var(--color-primary-dark));
}

.btn-secondary {
  background-color: rgb(var(--color-secondary));
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: rgb(var(--color-secondary) / 0.9);
}

.btn-outline {
  background-color: transparent;
  border: 1px solid rgb(var(--color-border));
  color: rgb(var(--color-text-muted));
}

.btn-outline:hover:not(:disabled) {
  background-color: rgb(var(--color-surface-hover));
  color: rgb(var(--color-text));
  border-color: rgb(var(--color-border) / 0.7);
}

.btn-subtle {
  background-color: transparent;
  border: 1px solid rgb(var(--color-border));
  color: rgb(var(--color-text-muted));
}

.btn-subtle:hover:not(:disabled) {
  background-color: rgb(var(--color-surface-hover));
  color: rgb(var(--color-text));
  border-color: rgb(var(--color-border) / 0.7);
}

.btn-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-danger-subtle {
  color: rgb(var(--color-danger));
  background-color: transparent;
}

.btn-danger-subtle:hover {
  background-color: rgb(var(--color-danger) / 0.1);
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border-radius: var(--radius-md);
}

.btn-xs {
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border-radius: var(--radius-sm);
}

.btn-icon.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  padding-bottom: 1rem;
  border-top: 1px solid rgb(var(--color-border));
  margin-top: 2rem;
}

.treatments-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.treatments-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid rgb(var(--color-border));
  background-color: rgb(var(--color-surface));
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: rgb(var(--color-primary-dark));
}

.section-title h2, .section-title h3, .section-title h4 {
  margin: 0;
  font-weight: 600;
  color: inherit;
}

.empty-state {
  padding: 3rem 1.5rem;
  text-align: center;
  background-color: rgb(var(--color-surface));
  border-radius: var(--radius-lg);
  border: 1px solid rgb(var(--color-border));
  color: rgb(var(--color-text-muted));
}

.empty-state-icon {
  margin: 0 auto 1rem;
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgb(var(--color-surface-muted));
  color: rgb(var(--color-text-muted) / 0.8);
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  font-weight: 500;
  color: rgb(var(--color-text));
}

.empty-state p {
  margin: 0;
  font-size: 0.9375rem;
}

.steps-empty-state {
  padding: 1.25rem;
  text-align: center;
  background-color: rgb(var(--color-bg));
  border-radius: var(--radius-md);
  color: rgb(var(--color-text-muted));
  font-size: 0.9375rem;
}

.treatment-steps {
  margin-top: 2rem;
  border-top: 1px solid rgb(var(--color-border) / 0.7);
  padding-top: 1.5rem;
}

.steps-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.steps-header .section-title {
  color: rgb(var(--color-primary-dark));
}

.steps-header .section-title h4 {
  color: rgb(var(--color-primary-dark));
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-item {
  background-color: rgb(var(--color-bg));
  border-radius: var(--radius-md);
  border: 1px solid rgb(var(--color-border));
  overflow: hidden;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 1rem;
  background-color: rgb(var(--color-surface-muted) / 0.5);
  border-bottom: 1px solid rgb(var(--color-border) / 0.7);
}

.step-number {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--color-text));
}

.step-content {
  padding: 1rem;
}

.alert {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  position: relative;
  font-size: 0.9375rem;
}

.alert-error {
  background-color: rgb(254 226 226 / 0.8);
  border-left: 4px solid rgb(var(--color-danger));
  color: rgb(153 27 27);
}

.dark .alert-error {
  background-color: rgb(127 29 29 / 0.5);
  border-color: rgb(220 38 38);
  color: rgb(254 202 202);
}

.alert-icon {
  flex-shrink: 0;
  margin-right: 0.85rem;
  margin-top: 0.125rem;
  width: 1.35rem;
  height: 1.35rem;
}

.alert-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: currentColor;
  opacity: 0.7;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
}

.alert-close:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.07);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.expand-enter-active,
.expand-leave-active {
  transition: all var(--transition-normal) ease-in-out;
  max-height: 600px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
  overflow: hidden;
}

.treatment-list-move,
.step-list-move {
  transition: transform var(--transition-normal) ease-in-out;
}

.treatment-list-enter-active,
.step-list-enter-active {
  transition: all var(--transition-normal) ease-out;
}

.treatment-list-leave-active,
.step-list-leave-active {
  transition: all var(--transition-normal) ease-in;
  position: absolute;
  width: calc(100% - 2 * 1.5rem);
}

.treatment-list-enter-from,
.treatment-list-leave-to,
.step-list-enter-from,
.step-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.condition-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.condition-badge {
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  background-color: rgb(var(--color-bg));
  color: rgb(var(--color-text));
  border: 1px solid rgb(var(--color-border));
  cursor: pointer;
  transition: all var(--transition-fast);
}

.condition-badge:hover {
  background-color: rgb(var(--color-primary-light) / 0.2);
  border-color: rgb(var(--color-primary-light));
}

.condition-badge-selected {
  background-color: rgb(var(--color-primary));
  color: white;
  border-color: rgb(var(--color-primary));
}

.condition-badge-selected:hover {
  background-color: rgb(var(--color-primary-dark));
  border-color: rgb(var(--color-primary-dark));
}

.condition-badge-other.condition-badge-selected {
  background-color: rgb(var(--color-secondary));
  border-color: rgb(var(--color-secondary));
}

.condition-badge-other.condition-badge-selected:hover {
  background-color: rgb(var(--color-secondary) / 0.9);
  border-color: rgb(var(--color-secondary) / 0.9);
}

.date-picker-wrapper :deep(.dp__main) {
  font-family: var(--font-family-sans);
}

.date-picker-wrapper :deep(.dp__input) {
  width: 100%;
  padding: 0.625rem 0.875rem;
  background-color: rgb(var(--color-bg));
  border: 1px solid rgb(var(--color-border));
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-family: var(--font-family-sans);
  line-height: 1.5;
  color: rgb(var(--color-text));
}

.date-picker-wrapper :deep(.dp__input:focus) {
  border-color: rgb(var(--color-primary));
  box-shadow: 0 0 0 3px rgb(var(--color-primary-light) / 0.5);
  outline: none;
  background-color: rgb(var(--color-surface));
}

.date-picker-wrapper :deep(.dp__calendar_header) {
  font-weight: 500;
}

.date-picker-wrapper :deep(.dp__active_date) {
  background-color: rgb(var(--color-primary));
}

.date-picker-wrapper :deep(.dp__today) {
  border-color: rgb(var(--color-primary));
}

.status-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  overflow-x: auto;
  padding: 0.25rem 0;
}

.status-tab {
  padding: 0.5rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: rgb(var(--color-bg));
  color: rgb(var(--color-text-muted));
  border: 1px solid rgb(var(--color-border));
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.status-tab:hover {
  background-color: rgb(var(--color-surface-hover));
}

.status-tab-active {
  color: white;
}

.status-tab-blue.status-tab-active {
  background-color: rgb(37 99 235);
  border-color: rgb(30 64 175);
}

.status-tab-indigo.status-tab-active {
  background-color: rgb(79 70 229);
  border-color: rgb(67 56 202);
}

.status-tab-purple.status-tab-active {
  background-color: rgb(147 51 234);
  border-color: rgb(126 34 206);
}

.status-tab-yellow.status-tab-active {
  background-color: rgb(202 138 4);
  border-color: rgb(161 98 7);
}

.status-tab-green.status-tab-active {
  background-color: rgb(22 163 74);
  border-color: rgb(21 128 61);
}

.status-tab-emerald.status-tab-active {
  background-color: rgb(5 150 105);
  border-color: rgb(4 120 87);
}

.status-tab-red.status-tab-active {
  background-color: rgb(220 38 38);
  border-color: rgb(185 28 28);
}

.step-status-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.step-status-tabs .status-tab {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.date-picker-button {
  text-align: left;
  width: 100%;
  padding: 0.625rem 0.875rem;
  background-color: rgb(var(--color-bg)) !important;
  border: 1px solid rgb(var(--color-border)) !important;
  border-radius: var(--radius-md) !important;
  font-size: 0.9375rem;
  font-family: var(--font-family-sans);
  line-height: 1.5;
  color: rgb(var(--color-text)) !important;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-picker-button:focus {
  border-color: rgb(var(--color-primary)) !important;
  box-shadow: 0 0 0 3px rgb(var(--color-primary-light) / 0.5) !important;
  outline: none;
}
</style>