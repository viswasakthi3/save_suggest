<template>
  <div class="record-detail-view">
    <!-- 1. Back Button - Moved to give more space -->
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
          <!-- Left Column Wrapper -->
          <div class="left-column-wrapper">
            <!-- Record Details Card -->
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

            <!-- X-Ray Gallery and Upload Section - REORDERED -->
            <div class="card xray-section">
              <div class="card-header">
                <div class="card-title">
                  <Image size="20" />
                  <h2>Patient X-rays</h2>
                </div>
              </div>
              <div class="card-content">
                <!-- REORDERED: X-Ray Thumbnails Display FIRST -->
                <h4>Existing X-rays</h4>
                <div v-if="isLoadingXrays" class="loading-state">
                  <LoaderCircle class="spin" size="24" /> Loading X-rays...
                </div>
                <div v-else-if="xrayFetchError" class="alert alert-warning">
                  <AlertTriangle size="16" class="alert-icon" /> {{ xrayFetchError }}
                </div>
                <div v-else-if="filteredXrays.length === 0" class="empty-state-compact">
                  <Info size="20" /> No X-rays found for tooth #{{ formData.tooth_number }}.
                </div>
                <div v-else class="xray-thumbnail-grid">
                  <div v-for="(xray, index) in filteredXrays" :key="xray.id" class="xray-thumbnail">
                    <img :src="xray.image_url" :alt="xray.description || 'X-ray image'" loading="lazy" @click="openXrayModal(index)">
                    <div class="thumbnail-overlay">
                      <p class="thumbnail-description">{{ xray.description || 'View X-ray' }}</p>
                      <small>Tooth: {{ xray.tooth_number }}</small>
                    </div>
                    <button @click.stop="confirmDeleteXray(xray)" class="btn-delete-thumbnail">
                      <Trash2 size="14" />
                    </button>
                  </div>
                </div>

                <hr class="section-divider">
                
                <!-- X-Ray Upload Form SECOND -->
                <form @submit.prevent="handleSubmitNewXray" class="xray-upload-form">
                  <h4>Upload New X-ray</h4>
                  <div class="form-row two-cols">
                    <div class="form-group">
                      <label for="new_xray_tooth_number" class="form-label">Tooth Number</label>
                      <input type="number" id="new_xray_tooth_number" v-model.number="newXrayForm.tooth_number" class="form-input" placeholder="Enter tooth number">
                    </div>
                    <div class="form-group">
                      <label for="new_xray_description" class="form-label">Description</label>
                      <input type="text" id="new_xray_description" v-model="newXrayForm.description" class="form-input" placeholder="X-ray description">
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="new_xray_file_input" class="form-label">X-ray File</label>
                    <div class="file-input-container">
                      <input type="file" id="new_xray_file_input" @change="handleNewXrayFileChange" accept="image/png,image/jpeg,image/gif" class="file-input-hidden">
                      <div class="file-input-ui">
                        <span v-if="!newXrayForm.fileName">Choose a file...</span>
                        <span v-else>{{ newXrayForm.fileName }}</span>
                        <button type="button" class="btn btn-secondary btn-sm">Browse</button>
                      </div>
                    </div>
                    <small class="form-text">PNG, JPG, GIF. Max 5MB.</small>
                  </div>
                  <div v-if="newXrayForm.filePreview" class="xray-upload-preview">
                    <img :src="newXrayForm.filePreview" alt="X-ray preview" class="preview-image">
                    <button type="button" @click="clearNewXrayFile" class="btn btn-sm btn-danger-subtle btn-clear-preview">
                      <X size="14" /> Remove
                    </button>
                  </div>
                  <div v-if="xrayUploadError" class="alert alert-error-inline">
                    <AlertTriangle size="14" class="alert-icon" /> {{ xrayUploadError }}
                  </div>
                  <button type="submit" :disabled="isUploadingXray || !newXrayForm.file" class="btn btn-primary btn-with-icon">
                    <LoaderCircle v-if="isUploadingXray" class="btn-icon spin" />
                    <Upload v-else class="btn-icon" />
                    <span>{{ isUploadingXray ? 'Uploading...' : 'Upload X-ray' }}</span>
                  </button>
                </form>
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

                  <!-- <TransitionExpand>
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
                  </TransitionExpand> -->

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
                              <DatePicker 
                                :id="`detail_step_date_${treatmentIndex}_${stepIndex}`"
                                v-model="step.step_date"
                                placeholder="Select date"
                                class="date-picker-custom"
                              />
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

    <!-- X-Ray Modal Viewer - Improved with zooming & external controls -->
    <Transition name="modal-fade">
      <div v-if="showXrayModal && currentModalXray" class="xray-modal-overlay" @click.self="closeXrayModal">
        <div class="xray-modal-content">
          <button @click="closeXrayModal" class="modal-close-button" aria-label="Close X-ray viewer">
            <X size="28" />
          </button>
          
          <div class="modal-image-container">
            <img :src="currentModalXray.image_url" 
                 :alt="currentModalXray.description || 'X-ray image'" 
                 class="modal-image"
                 :class="{ 'zoomed': isImageZoomed }"
                 @click="toggleImageZoom">
          </div>
          
          <div class="modal-caption">
            <p>{{ currentModalXray.description }} (Tooth: {{ currentModalXray.tooth_number }})</p>
            <small>Uploaded: {{ getFormattedDate(currentModalXray.created_at) }}</small>
            <div class="modal-controls">
              <button @click="toggleImageZoom" class="modal-control-btn zoom-btn" aria-label="Zoom image">
                <ZoomIn v-if="!isImageZoomed" size="18" />
                <ZoomOut v-else size="18" />
                <span>{{ isImageZoomed ? 'Reset Zoom' : 'Zoom' }}</span>
              </button>
              <button @click="confirmDeleteXray(currentModalXray)" class="modal-control-btn delete-btn" aria-label="Delete X-ray">
                <Trash2 size="18" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
        
        <button v-if="filteredXrays.length > 1" @click="prevXrayInModal" class="modal-nav-button prev" aria-label="Previous X-ray">
          <ChevronLeft size="36" />
        </button>
        <button v-if="filteredXrays.length > 1" @click="nextXrayInModal" class="modal-nav-button next" aria-label="Next X-ray">
          <ChevronRight size="36" />
        </button>
      </div>
    </Transition>
    
    <!-- Delete Confirmation Modal -->
    <Transition name="modal-fade">
      <div v-if="showDeleteConfirmation" class="confirmation-modal-overlay">
        <div class="confirmation-modal">
          <h3>Delete X-ray</h3>
          <p>Are you sure you want to delete this X-ray? This action cannot be undone.</p>
          <div class="confirmation-actions">
            <button @click="cancelDeleteXray" class="btn btn-outline">Cancel</button>
            <button @click="deleteXray" class="btn btn-danger" :disabled="isDeletingXray">
              <LoaderCircle v-if="isDeletingXray" class="btn-icon spin" size="14" />
              <span>{{ isDeletingXray ? 'Deleting...' : 'Delete X-ray' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, h, shallowRef } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import DatePicker from './DatePicker.vue';
import {
  X, ClipboardEdit, LoaderCircle, Image, ArrowLeft, FileText,
  ListChecks, PlusCircle, Info, Stethoscope, Trash2, UploadCloud,
  ListOrdered, Plus, AlertTriangle, MessageSquare, ZoomIn, ZoomOut,
  ChevronLeft, ChevronRight, Upload
} from 'lucide-vue-next';

// Create a simple date formatter for consistent date presentation
const getFormattedDate = (date) => {
  if (!date) return 'Select date';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(dateObj);
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

// X-Ray Gallery and Modal State
const patientXrays = ref([]);
const isLoadingXrays = ref(false);
const xrayFetchError = ref(null);
const showXrayModal = ref(false);
const currentXrayModalIndex = ref(0);

// New state for X-ray management
const isImageZoomed = ref(false);
const showDeleteConfirmation = ref(false);
const xrayToDelete = ref(null);
const isDeletingXray = ref(false);
const deleteXrayError = ref(null);

// New X-Ray Upload State - Improved with filename
const newXrayForm = ref({
  tooth_number: props.initialToothNumberProp || (props.recordDataProp ? props.recordDataProp.tooth_number : ''),
  description: '',
  file: null,
  fileName: '',
  filePreview: null
});
const isUploadingXray = ref(false);
const xrayUploadError = ref(null);

const fetchPatientXrays = async () => {
  if (!props.patientId) return;
  isLoadingXrays.value = true;
  xrayFetchError.value = null;
  try {
    const token = Cookies.get('dental_access_token');
    const response = await axios.get(`${config.public.API_BASE_URL}/patients/${props.patientId}/xrays`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    patientXrays.value = response.data.xrays || [];
  } catch (err) {
    console.error('Error fetching patient x-rays:', err);
    xrayFetchError.value = 'Failed to load X-rays. Please try again.';
    patientXrays.value = []; // Clear xrays on error
  } finally {
    isLoadingXrays.value = false;
  }
};

const filteredXrays = computed(() => {
  if (!formData.value.tooth_number) {
    return patientXrays.value;
  }
  return patientXrays.value.filter(xray => 
    xray.tooth_number === formData.value.tooth_number
  );
});

const openXrayModal = (index) => {
  currentXrayModalIndex.value = index;
  showXrayModal.value = true;
};

const closeXrayModal = () => {
  showXrayModal.value = false;
};

const nextXrayInModal = () => {
  if (filteredXrays.value.length > 0) {
    currentXrayModalIndex.value = (currentXrayModalIndex.value + 1) % filteredXrays.value.length;
  }
};

const prevXrayInModal = () => {
  if (filteredXrays.value.length > 0) {
    currentXrayModalIndex.value = (currentXrayModalIndex.value - 1 + filteredXrays.value.length) % filteredXrays.value.length;
  }
};

const currentModalXray = computed(() => {
  if (filteredXrays.value.length === 0 || currentXrayModalIndex.value < 0 || currentXrayModalIndex.value >= filteredXrays.value.length) {
    return null;
  }
  return filteredXrays.value[currentXrayModalIndex.value];
});

const handleNewXrayFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    newXrayForm.value.file = file;
    newXrayForm.value.fileName = file.name;
    newXrayForm.value.filePreview = URL.createObjectURL(file);
    xrayUploadError.value = null; // Clear previous error
  } else {
    clearNewXrayFile();
  }
};

const clearNewXrayFile = () => {
  if (newXrayForm.value.filePreview) {
    URL.revokeObjectURL(newXrayForm.value.filePreview);
  }
  newXrayForm.value.file = null;
  newXrayForm.value.fileName = '';
  newXrayForm.value.filePreview = null;
  const fileInput = document.getElementById('new_xray_file_input');
  if (fileInput) {
    fileInput.value = ''; // Reset file input
  }
};

const handleSubmitNewXray = async () => {
  if (!newXrayForm.value.file || !props.patientId) {
    xrayUploadError.value = 'Please select a file and ensure patient ID is available.';
    return;
  }
  if (!newXrayForm.value.tooth_number) {
    xrayUploadError.value = 'Tooth number is required.';
    return;
  }
   if (!newXrayForm.value.description) {
    xrayUploadError.value = 'Description is required.';
    return;
  }

  isUploadingXray.value = true;
  xrayUploadError.value = null;

  const xrayFormData = new FormData();
  xrayFormData.append('patient_id', props.patientId);
  xrayFormData.append('tooth_number', newXrayForm.value.tooth_number);
  xrayFormData.append('description', newXrayForm.value.description);
  xrayFormData.append('file', newXrayForm.value.file);

  try {
    const token = Cookies.get('dental_access_token');
    await axios.post(`https://api.theluvit.com/patients/upload-xray`, xrayFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
    // Success
    clearNewXrayFile();
    newXrayForm.value.description = '';
    // Optionally, keep tooth_number or reset it
    // newXrayForm.value.tooth_number = props.initialToothNumberProp || (props.recordDataProp ? props.recordDataProp.tooth_number : '');
    await fetchPatientXrays(); // Refresh the X-ray list
  } catch (err) {
    console.error('Error uploading X-ray:', err.response ? err.response.data : err.message);
    xrayUploadError.value = (err.response && err.response.data && err.response.data.message) || 'X-ray upload failed. Please try again.';
  } finally {
    isUploadingXray.value = false;
  }
};

const toggleImageZoom = () => {
  isImageZoomed.value = !isImageZoomed.value;
};

const confirmDeleteXray = (xray) => {
  xrayToDelete.value = xray;
  showDeleteConfirmation.value = true;
};

const cancelDeleteXray = () => {
  xrayToDelete.value = null;
  showDeleteConfirmation.value = false;
  deleteXrayError.value = null;
};

const deleteXray = async () => {
  if (!xrayToDelete.value || !xrayToDelete.value.id) {
    cancelDeleteXray();
    return;
  }

  isDeletingXray.value = true;
  deleteXrayError.value = null;

  try {
    const token = Cookies.get('dental_access_token');
    await axios.delete(`${config.public.API_BASE_URL}/patients/xrays/${xrayToDelete.value.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Close modal if the current X-ray is being deleted
    if (showXrayModal.value && currentModalXray.value && currentModalXray.value.id === xrayToDelete.value.id) {
      closeXrayModal();
    }
    
    // Remove the deleted X-ray from the list
    patientXrays.value = patientXrays.value.filter(x => x.id !== xrayToDelete.value.id);
    
    // Reset the state
    cancelDeleteXray();
  } catch (err) {
    console.error('Error deleting X-ray:', err);
    deleteXrayError.value = 'Failed to delete X-ray. Please try again.';
  } finally {
    isDeletingXray.value = false;
  }
};

watch(() => props.patientId, (newPatientId) => {
  if (newPatientId) {
    fetchPatientXrays();
  } else {
    patientXrays.value = []; // Clear xrays if patientId is null
  }
}, { immediate: true });

watch(() => props.initialToothNumberProp, (newVal) => {
    if (newVal && (!newXrayForm.value.tooth_number || props.isCreatingNew)) {
        newXrayForm.value.tooth_number = newVal;
    }
}, { immediate: true });

onMounted(() => {
  if (props.patientId) {
    fetchPatientXrays();
  }
  if (props.initialToothNumberProp && (!formData.value.tooth_number || props.isCreatingNew)) {
    formData.value.tooth_number = props.initialToothNumberProp;
  }
   if (props.initialToothNumberProp && !newXrayForm.value.tooth_number) {
    newXrayForm.value.tooth_number = props.initialToothNumberProp;
  }
  if (props.recordDataProp && props.recordDataProp.tooth_number && !newXrayForm.value.tooth_number) {
    newXrayForm.value.tooth_number = props.recordDataProp.tooth_number;
  }
});
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
  margin-bottom: 100px;
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
  text-align: left !important;
  width: 100% !important;
  padding: 0.625rem 0.875rem !important;
  background-color: rgb(var(--color-bg)) !important;
  border: 1px solid rgb(var(--color-border)) !important;
  border-radius: var(--radius-md) !important;
  font-size: 0.9375rem !important;
  font-family: var(--font-family-sans) !important;
  line-height: 1.5 !important;
  color: rgb(var(--color-text)) !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  justify-content: flex-start !important;
  height: auto !important;
}

.date-picker-button:focus {
  border-color: rgb(var(--color-primary)) !important;
  box-shadow: 0 0 0 3px rgb(var(--color-primary-light) / 0.5) !important;
  outline: none !important;
}

/* Tailgrids DatePicker customizations */
.date-picker-input {
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

:deep(.tg-datepicker) {
  width: 100%;
}

:deep(.tg-datepicker input) {
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

:deep(.tg-datepicker input:focus) {
  border-color: rgb(var(--color-primary));
  box-shadow: 0 0 0 3px rgb(var(--color-primary-light) / 0.5);
  outline: none;
  background-color: rgb(var(--color-surface));
}

:deep(.tg-datepicker .calendar-header) {
  background-color: rgb(var(--color-primary));
}

:deep(.tg-datepicker .selected-day) {
  background-color: rgb(var(--color-primary));
}

:deep(.tg-datepicker .today) {
  border-color: rgb(var(--color-primary));
}

/* Custom DatePicker styling to match the form design */
.date-picker-custom {
  width: 100%;
}

.date-picker-custom input {
  display: block;
  width: 100%;
  padding: 0.625rem 0.875rem 0.625rem 2.5rem;
  background-color: rgb(var(--color-bg));
  border: 1px solid rgb(var(--color-border));
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-family: var(--font-family-sans);
  line-height: 1.5;
  color: rgb(var(--color-text));
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.date-picker-custom input:focus {
  border-color: rgb(var(--color-primary));
  box-shadow: 0 0 0 3px rgb(var(--color-primary-light) / 0.5);
  outline: none;
  background-color: rgb(var(--color-surface));
}

/* Override the calendar button colors to match your theme */
.date-picker-custom .bg-primary {
  background-color: rgb(var(--color-primary));
}

.date-picker-custom .hover\:bg-primary:hover {
  background-color: rgb(var(--color-primary-dark));
}

.date-picker-custom .bg-dark {
  background-color: rgb(var(--color-text));
}

/* X-Ray Section Styles */
.main-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.left-column-wrapper {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.treatments-container {
  flex: 1.5;
  min-width: 300px;
}

.xray-section .card-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.xray-upload-form {
  padding: 15px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: rgb(var(--color-surface-muted));
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.xray-upload-form h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.1em;
  font-weight: 600;
  color: rgb(var(--color-text));
}

.form-input-file {
  display: block;
  width: 100%;
  padding: 8px 12px;
  font-size: 0.9rem;
  line-height: 1.5;
  color: rgb(var(--color-text));
  background-color: rgb(var(--color-bg));
  border: 1px solid rgb(var(--color-border));
  border-radius: var(--radius-md);
  transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
}

.form-input-file:focus {
  border-color: rgb(var(--color-primary));
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(var(--color-primary-light), 0.25);
}

.xray-upload-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.xray-upload-preview .preview-image {
  max-width: 100px;
  max-height: 100px;
  border-radius: var(--radius-md);
  border: 1px solid rgb(var(--color-border));
  object-fit: cover;
}

.btn-clear-preview {
  margin-left: auto;
}

.alert-error-inline {
  padding: 8px 12px;
  font-size: 0.85rem;
  background-color: rgb(var(--color-danger) / 0.1);
  color: rgb(var(--color-danger));
  border: 1px solid rgb(var(--color-danger));
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-divider {
  border: none;
  border-top: 1px solid rgb(var(--color-border));
  margin: 20px 0;
}

.xray-thumbnail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.xray-thumbnail {
  position: relative;
  cursor: pointer;
  border-radius: var(--radius-md);
  overflow: hidden;
  aspect-ratio: 1 / 1;
  background-color: rgb(var(--color-surface-muted));
  border: 1px solid rgb(var(--color-border));
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.xray-thumbnail:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.xray-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumbnail-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
  color: white;
  padding: 8px;
  font-size: 0.8rem;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.xray-thumbnail:hover .thumbnail-overlay {
  opacity: 1;
}

.thumbnail-description {
  font-weight: 500;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.thumbnail-overlay small {
  font-size: 0.7rem;
  opacity: 0.9;
}

.loading-state, .empty-state-compact {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 15px;
  color: rgb(var(--color-text-muted));
  font-size: 0.9rem;
  justify-content: center;
  min-height: 80px;
}

/* X-Ray Modal Styles */
.xray-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.xray-modal-content {
  position: relative;
  background-color: rgb(var(--color-surface));
  padding: 20px;
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-image {
  max-width: 100%;
  max-height: calc(90vh - 120px);
  object-fit: contain;
  border-radius: var(--radius-md);
}

.modal-close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0,0,0,0.3);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.modal-close-button:hover {
  background: rgba(0,0,0,0.5);
}

.modal-nav-button {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  z-index: 1010;
}

.modal-controls {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.modal-control-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  border: 1px solid rgb(var(--color-border));
  background: rgb(var(--color-surface));
  color: rgb(var(--color-text));
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-control-btn.zoom-btn:hover {
  background: rgb(var(--color-primary-light) / 0.2);
  color: rgb(var(--color-primary-dark));
  border-color: rgb(var(--color-primary-light));
}

.modal-control-btn.delete-btn:hover {
  background: rgb(var(--color-danger) / 0.1);
  color: rgb(var(--color-danger));
  border-color: rgb(var(--color-danger) / 0.5);
}

.modal-image-container {
  position: relative;
  overflow: hidden;
  max-width: 100%;
  max-height: calc(90vh - 180px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-image {
  max-width: 100%;
  max-height: calc(90vh - 180px);
  object-fit: contain;
  border-radius: var(--radius-md);
  transition: transform 0.3s ease;
  cursor: zoom-in;
}

.modal-image.zoomed {
  transform: scale(1.5);
  cursor: zoom-out;
}

.modal-nav-button.prev {
  left: 15px;
}

.modal-nav-button.next {
  right: 15px;
}

.modal-nav-button:hover {
  background: rgba(0,0,0,0.5);
}

.modal-caption {
  margin-top: 15px;
  text-align: center;
  color: rgb(var(--color-text));
}

.modal-caption p {
  margin: 0 0 5px 0;
  font-size: 1rem;
}

.modal-caption small {
  font-size: 0.85rem;
  color: rgb(var(--color-text-muted));
}

/* Modal Fade Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Confirmation modal */
.confirmation-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1020;
}

.confirmation-modal {
  background: rgb(var(--color-surface));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 24px;
  width: 90%;
  max-width: 450px;
}

.confirmation-modal h3 {
  margin-top: 0;
  color: rgb(var(--color-danger));
}

.confirmation-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-danger {
  background-color: rgb(var(--color-danger));
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: rgb(var(--color-danger) / 0.8);
}

/* Responsive adjustments for top navigation */
.top-navigation-bar {
  padding-left: 0;
  margin-left: 0;
}

/* Improved file input styling */
.file-input-container {
  position: relative;
  width: 100%;
}

.file-input-hidden {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  top: 0;
  left: 0;
  cursor: pointer;
  z-index: 2;
}

.file-input-ui {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0.875rem;
  background-color: rgb(var(--color-bg));
  border: 1px solid rgb(var(--color-border));
  border-radius: var(--radius-md));
  min-height: var(--form-control-height);
  overflow: hidden;
}

.file-input-ui span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  color: rgb(var(--color-text-muted));
  margin-right: 10px;
}

.file-input-container:hover .file-input-ui {
  border-color: rgb(var(--color-primary));
}

/* X-ray thumbnail delete button */
.xray-thumbnail {
  position: relative;
}

.btn-delete-thumbnail {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s, background-color 0.2s;
  color: rgb(var(--color-danger));
  cursor: pointer;
}

.xray-thumbnail:hover .btn-delete-thumbnail {
  opacity: 1;
}

.btn-delete-thumbnail:hover {
  background: white;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }

  .left-column-wrapper, .treatments-container {
    flex-basis: auto;
    width: 100%;
  }

  .xray-thumbnail-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }

  .modal-nav-button {
    width: 40px;
    height: 40px;
  }

  .modal-nav-button svg {
    width: 24px;
    height: 24px;
  }
}

.treatments-list {
  display: flex;
  flex-direction: column;
  gap: 1.75rem; /* Increased gap between treatments */
}
</style>