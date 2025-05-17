<script setup>
import { ref, computed, watch, reactive } from 'vue';

const props = defineProps({
  modelValue: Boolean, // for v-model to control modal visibility
  patientId: {
    type: [Number, String],
    required: true
  },
  dentistId: { 
    type: [Number, String],
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'save', 'close', 'error']);

const isSubmitting = ref(false);
const formError = ref(null);

const calculusLevels = [
  { key: '+', label: 'Mild (+)' },
  { key: '++', label: 'Moderate (++)' },
  { key: '+++', label: 'Severe (+++)' }
];

const mobilityGrades = [
  { key: '0', label: 'Grade 0 (Normal)' },
  { key: '1', label: 'Grade 1 (Slight)' },
  { key: '2', label: 'Grade 2 (Moderate)' },
  { key: '3', label: 'Grade 3 (Severe)' }
];

const getDefaultFormData = () => ({
  exam_date: new Date().toISOString().split('T')[0],
  calculus_stains: [], // Array of { tooth: '', level: '' }
  malocclusion: {
    class_i: false, class_ii: false, division_1: false, division_2: false, class_iii: false,
    anterior_open_bite: false, posterior_open_bite: false, anterior_cross_bite: false,
    posterior_cross_bite: false, single_tooth_cross_bite: false, crowding: false,
    spacing: false, deep_bite: false, protrusion: false, midline_diastema: false,
  },
  missing_teeth: [],    // Array of strings ['16', '25']
  impaction_info: [],   // Array of { tooth: '', type: '', description: '' }
  caries_chart: [],     // Array of { tooth: '', surfaces_str: '', notes: '' }
  mobility_entries: [], // Array of { tooth: '', grade: null }
  extra_oral_findings: '',
});

const formData = reactive(getDefaultFormData());
const newMissingTooth = ref('');

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value);
    if (!value) {
      isSubmitting.value = false; 
      formError.value = null;
    }
  }
});

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    Object.assign(formData, getDefaultFormData());
    newMissingTooth.value = '';
    formData.mobility_entries = getDefaultFormData().mobility_entries; 
    isSubmitting.value = false;
    formError.value = null;
  }
});

// --- Methods for dynamic form sections ---

// Calculus & Stains
const addCalculusStain = () => {
  formData.calculus_stains.push({ tooth: '', level: null });
};
const removeCalculusStain = (index) => {
  formData.calculus_stains.splice(index, 1);
};

// Missing Teeth
const addMissingTooth = () => {
  const toothValue = newMissingTooth.value.trim();
  if (toothValue && !formData.missing_teeth.includes(toothValue)) {
    formData.missing_teeth.push(toothValue);
    newMissingTooth.value = '';
  } else if (formData.missing_teeth.includes(toothValue)) {
    formError.value = `Tooth ${toothValue} is already in the missing list.`;
    setTimeout(() => { if (formError.value === `Tooth ${toothValue} is already in the missing list.`) formError.value = null; }, 3000);
  }
};
const removeMissingTooth = (index) => {
  formData.missing_teeth.splice(index, 1);
};

// Impaction Info
const addImpactionInfo = () => {
  formData.impaction_info.push({ tooth: '', type: '', description: '' });
};
const removeImpactionInfo = (index) => {
  formData.impaction_info.splice(index, 1);
};

// Caries Chart
const addCariesEntry = () => {
  formData.caries_chart.push({ tooth: '', surfaces_str: '', notes: '' });
};
const removeCariesEntry = (index) => {
  formData.caries_chart.splice(index, 1);
};

// Mobility Entries
const addMobilityEntry = () => {
  formData.mobility_entries.push({ tooth: '', grade: null });
};
const removeMobilityEntry = (index) => {
  formData.mobility_entries.splice(index, 1);
};

// --- Form Submission and Closing ---

const validateForm = () => {
  formError.value = null;
  if (!formData.exam_date) {
    formError.value = "Examination date is required.";
    return false;
  }
  // Add more specific validations as needed
  return true;
}

const handleSave = async () => {
  if (!validateForm()) {
    return;
  }
  isSubmitting.value = true;
  formError.value = null;

  try {
    const submissionData = JSON.parse(JSON.stringify(formData));

    submissionData.calculus_stains = submissionData.calculus_stains.filter(item => item.tooth && item.tooth.trim() !== '' && item.level !== null);

    submissionData.missing_teeth = submissionData.missing_teeth.filter(tooth => tooth && tooth.trim() !== '');

    submissionData.impaction_info = submissionData.impaction_info.filter(item => item.tooth && item.tooth.trim() !== '');
    
    submissionData.caries_chart = submissionData.caries_chart
      .filter(item => item.tooth && item.tooth.trim() !== '')
      .map(item => ({
        ...item,
        surfaces: item.surfaces_str ? item.surfaces_str.split(',').map(s => s.trim()).filter(s => s) : [],
        surfaces_str: undefined 
      }));

    submissionData.mobility_entries = submissionData.mobility_entries.filter(item => item.tooth && item.tooth.trim() !== '' && item.grade !== null);

    submissionData.patient_id = props.patientId;
    submissionData.dentist_id = props.dentistId;

    emit('save', submissionData);
  } catch (error) {
    console.error("Error preparing oral examination data:", error);
    formError.value = "An error occurred while preparing the data. Please check console.";
    emit('error', formError.value);
  } finally {
    // isSubmitting.value = false; // Parent component should handle this after API call
  }
};

const handleClose = () => {
  if (!isSubmitting.value) {
    emit('close'); 
    emit('update:modelValue', false); 
  }
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50"
    @click.self="handleClose"
  >
    <div class="relative mx-auto p-0 border w-full max-w-7xl shadow-lg rounded-md bg-white dark:bg-gray-800 max-h-[calc(100vh-80px)] flex flex-col">
      
      <!-- Modal Header (Non-scrollable) -->
      <div class="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          @click="handleClose"
          class="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Oral Examination Form</h3>

        <div v-if="formError" class="p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
          <span>{{ formError }}</span>
          <button @click="formError = null" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Form element wraps scrollable body and fixed footer -->
      <form @submit.prevent="handleSave" class="flex flex-col flex-grow overflow-hidden">
        
        <!-- Scrollable Form Body -->
        <div class="flex-grow overflow-y-auto p-6 space-y-6">
          <!-- Examination Date -->
          <div class="mb-2">
            <label for="exam_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Examination Date <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="formData.exam_date" 
              type="date" 
              id="exam_date" 
              required 
              class="w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
          </div>

          <!-- Two-column layout for main content -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
            
            <!-- Column 1 -->
            <div class="space-y-6">
              <!-- Calculus & Stains Section -->
              <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-md bg-slate-50 dark:bg-slate-800/30">
                <legend class="text-lg font-medium text-gray-800 dark:text-gray-200 px-2">Calculus & Stains</legend>
                
                <div v-for="(item, index) in formData.calculus_stains" :key="index" class="flex items-end gap-4 mb-2">
                  <div class="flex-1">
                    <label :for="`tooth-calculus-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tooth Number
                    </label>
                    <input 
                      v-model="item.tooth" 
                      :id="`tooth-calculus-${index}`" 
                      type="text" 
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g. 11"
                    >
                  </div>
                  <div class="flex-1">
                    <label :for="`level-calculus-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Level
                    </label>
                    <select 
                      v-model="item.level" 
                      :id="`level-calculus-${index}`" 
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Level</option>
                      <option v-for="level in calculusLevels" :key="level.key" :value="level.key">
                        {{ level.label }}
                      </option>
                    </select>
                  </div>
                  <button 
                    type="button" 
                    @click="removeCalculusStain(index)" 
                    class="px-2 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                  >
                    Remove
                  </button>
                </div>
                
                <button 
                  type="button" 
                  @click="addCalculusStain" 
                  class="mt-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 flex items-center"
                >
                  <span class="mr-1">+</span> Add Calculus/Stain
                </button>
              </fieldset>

              <!-- Missing Teeth -->
              <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-md bg-slate-50 dark:bg-slate-800/30">
                <legend class="text-lg font-medium text-gray-800 dark:text-gray-200 px-2">Missing Teeth</legend>
                
                <div class="flex items-end gap-4 mb-4">
                  <div class="flex-1">
                    <label for="new-missing-tooth" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tooth Number
                    </label>
                    <input 
                      v-model="newMissingTooth" 
                      id="new-missing-tooth" 
                      type="text" 
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g. 18"
                    >
                  </div>
                  <button 
                    type="button" 
                    @click="addMissingTooth" 
                    class="px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                  >
                    Add
                  </button>
                </div>
                
                <div v-if="formData.missing_teeth.length > 0" class="flex flex-wrap gap-2 mt-2">
                  <div 
                    v-for="(tooth, index) in formData.missing_teeth" 
                    :key="`missing-${index}`" 
                    class="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full flex items-center"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300 mr-2">{{ tooth }}</span>
                    <button 
                      type="button" 
                      @click="removeMissingTooth(index)" 
                      class="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </fieldset>

              <!-- Impaction Info -->
              <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-md bg-slate-50 dark:bg-slate-800/30">
                <legend class="text-lg font-medium text-gray-800 dark:text-gray-200 px-2">Impaction Information</legend>
                
                <div v-for="(item, index) in formData.impaction_info" :key="`impaction-${index}`" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <label :for="`impaction-tooth-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tooth Number
                    </label>
                    <input 
                      v-model="item.tooth" 
                      :id="`impaction-tooth-${index}`" 
                      type="text" 
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g. 18"
                    >
                  </div>
                  <div>
                    <label :for="`impaction-type-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <input 
                      v-model="item.type" 
                      :id="`impaction-type-${index}`" 
                      type="text" 
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g. Mesioangular"
                    >
                  </div>
                  <div class="flex items-end gap-2">
                    <div class="flex-1">
                      <label :for="`impaction-desc-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <input 
                        v-model="item.description" 
                        :id="`impaction-desc-${index}`" 
                        type="text" 
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Additional notes"
                      >
                    </div>
                    <button 
                      type="button" 
                      @click="removeImpactionInfo(index)" 
                      class="px-2 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                <button 
                  type="button" 
                  @click="addImpactionInfo" 
                  class="mt-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 flex items-center"
                >
                  <span class="mr-1">+</span> Add Impaction
                </button>
              </fieldset>

              <!-- Mobility Scores Section -->
              <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-md bg-slate-50 dark:bg-slate-800/30">
                <legend class="text-lg font-medium text-gray-800 dark:text-gray-200 px-2">Mobility Scores</legend>
                
                <div v-for="(item, index) in formData.mobility_entries" :key="`mobility-${index}`" class="flex items-end gap-4 mb-2">
                  <div class="flex-1">
                    <label :for="`tooth-mobility-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tooth Number
                    </label>
                    <input 
                      v-model="item.tooth" 
                      :id="`tooth-mobility-${index}`" 
                      type="text" 
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g. 11"
                    >
                  </div>
                  <div class="flex-1">
                    <label :for="`grade-mobility-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Grade
                    </label>
                    <select 
                      v-model="item.grade" 
                      :id="`grade-mobility-${index}`" 
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option :value="null">Select Grade</option>
                      <option v-for="grade in mobilityGrades" :key="grade.key" :value="grade.key">
                        {{ grade.label }}
                      </option>
                    </select>
                  </div>
                  <button 
                    type="button" 
                    @click="removeMobilityEntry(index)" 
                    class="px-2 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                  >
                    Remove
                  </button>
                </div>
                
                <button 
                  type="button" 
                  @click="addMobilityEntry" 
                  class="mt-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 flex items-center"
                >
                  <span class="mr-1">+</span> Add Mobility Score
                </button>
              </fieldset>
            </div>

            <!-- Column 2 -->
            <div class="space-y-6">
              <!-- Malocclusion -->
              <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-md bg-slate-50 dark:bg-slate-800/30">
                <legend class="text-lg font-medium text-gray-800 dark:text-gray-200 px-2">Malocclusion</legend>
                
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div class="flex items-center">
                    <input 
                      v-model="formData.malocclusion.class_i" 
                      id="class_i" 
                      type="checkbox" 
                      class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    >
                    <label for="class_i" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Class I</label>
                  </div>
                  
                  <div class="flex items-center">
                    <input 
                      v-model="formData.malocclusion.class_ii" 
                      id="class_ii" 
                      type="checkbox" 
                      class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    >
                    <label for="class_ii" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Class II</label>
                  </div>
                  
                  <div class="flex items-center">
                    <input 
                      v-model="formData.malocclusion.division_1" 
                      id="division_1" 
                      type="checkbox" 
                      class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    >
                    <label for="division_1" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Division 1</label>
                  </div>
                  
                  <div class="flex items-center">
                    <input 
                      v-model="formData.malocclusion.division_2" 
                      id="division_2" 
                      type="checkbox" 
                      class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    >
                    <label for="division_2" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Division 2</label>
                  </div>
                  
                  <div class="flex items-center">
                    <input 
                      v-model="formData.malocclusion.class_iii" 
                      id="class_iii" 
                      type="checkbox" 
                      class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    >
                    <label for="class_iii" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Class III</label>
                  </div>
                  
                  <div class="flex items-center">
                    <input 
                      v-model="formData.malocclusion.anterior_open_bite" 
                      id="anterior_open_bite" 
                      type="checkbox" 
                      class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    >
                    <label for="anterior_open_bite" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Anterior Open Bite</label>
                  </div>
                  
                  <div class="flex items-center">
                    <input 
                      v-model="formData.malocclusion.posterior_open_bite" 
                      id="posterior_open_bite" 
                      type="checkbox" 
                      class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    >
                    <label for="posterior_open_bite" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Posterior Open Bite</label>
                  </div>
                  
                  <div class="flex items-center">
                    <input 
                      v-model="formData.malocclusion.anterior_cross_bite" 
                      id="anterior_cross_bite" 
                      type="checkbox" 
                      class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    >
                    <label for="anterior_cross_bite" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Anterior Cross Bite</label>
                  </div>
                  
                  <div class="flex items-center">
                    <input 
                      v-model="formData.malocclusion.posterior_cross_bite" 
                      id="posterior_cross_bite" 
                      type="checkbox" 
                      class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    >
                    <label for="posterior_cross_bite" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Posterior Cross Bite</label>
                  </div>
                  
                  <div class="flex items-center">
                    <input 
                      v-model="formData.malocclusion.single_tooth_cross_bite" 
                      id="single_tooth_cross_bite" 
                      type="checkbox" 
                      class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    >
                    <label for="single_tooth_cross_bite" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Single Tooth Cross Bite</label>
                  </div>
                  
                  <div class="flex items-center">
                    <input 
                      v-model="formData.malocclusion.crowding" 
                      id="crowding" 
                      type="checkbox" 
                      class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    >
                    <label for="crowding" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Crowding</label>
                  </div>
                  
                  <div class="flex items-center">
                    <input 
                      v-model="formData.malocclusion.spacing" 
                      id="spacing" 
                      type="checkbox" 
                      class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    >
                    <label for="spacing" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Spacing</label>
                  </div>
                  
                  <div class="flex items-center">
                    <input 
                      v-model="formData.malocclusion.deep_bite" 
                      id="deep_bite" 
                      type="checkbox" 
                      class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    >
                    <label for="deep_bite" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Deep Bite</label>
                  </div>
                  
                  <div class="flex items-center">
                    <input 
                      v-model="formData.malocclusion.protrusion" 
                      id="protrusion" 
                      type="checkbox" 
                      class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    >
                    <label for="protrusion" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Protrusion</label>
                  </div>
                  
                  <div class="flex items-center">
                    <input 
                      v-model="formData.malocclusion.midline_diastema" 
                      id="midline_diastema" 
                      type="checkbox" 
                      class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    >
                    <label for="midline_diastema" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Midline Diastema</label>
                  </div>
                </div>
              </fieldset>

              <!-- Caries Chart -->
              <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-md bg-slate-50 dark:bg-slate-800/30">
                <legend class="text-lg font-medium text-gray-800 dark:text-gray-200 px-2">Caries Chart</legend>
                
                <div v-for="(item, index) in formData.caries_chart" :key="`caries-${index}`" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <label :for="`caries-tooth-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tooth Number
                    </label>
                    <input 
                      v-model="item.tooth" 
                      :id="`caries-tooth-${index}`" 
                      type="text" 
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g. 36"
                    >
                  </div>
                  <div>
                    <label :for="`caries-surfaces-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Surfaces
                    </label>
                    <input 
                      v-model="item.surfaces_str" 
                      :id="`caries-surfaces-${index}`" 
                      type="text" 
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g. M,O,D (comma separated)"
                    >
                  </div>
                  <div class="flex items-end gap-2">
                    <div class="flex-1">
                      <label :for="`caries-notes-${index}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes
                      </label>
                      <input 
                        v-model="item.notes" 
                        :id="`caries-notes-${index}`" 
                        type="text" 
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Additional notes"
                      >
                    </div>
                    <button 
                      type="button" 
                      @click="removeCariesEntry(index)" 
                      class="px-2 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                <button 
                  type="button" 
                  @click="addCariesEntry" 
                  class="mt-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 flex items-center"
                >
                  <span class="mr-1">+</span> Add Caries Entry
                </button>
              </fieldset>
              
              <!-- Extra-Oral Findings (Moved to Column 2) -->
              <fieldset class="border border-gray-300 dark:border-gray-600 p-4 rounded-md bg-slate-50 dark:bg-slate-800/30">
                <legend class="text-lg font-medium text-gray-800 dark:text-gray-200 px-2">Extra-Oral Findings</legend>
                
                <div>
                  <label for="extra_oral_findings" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea 
                    v-model="formData.extra_oral_findings" 
                    id="extra_oral_findings" 
                    rows="4"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter any extra-oral findings or observations here"
                  ></textarea>
                </div>
              </fieldset>
            </div>
          </div>
        </div>

        <!-- Form Footer / Buttons (Non-scrollable part of form) -->
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button 
            type="button" 
            @click="handleClose" 
            :disabled="isSubmitting"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
          >
            <span v-if="isSubmitting" class="mr-2">
              <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isSubmitting ? 'Saving...' : 'Save Examination' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
