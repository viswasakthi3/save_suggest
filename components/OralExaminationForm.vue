<template>
  <UModal v-model="isOpen" :prevent-close="isSubmitting" :ui="{ width: 'sm:max-w-5xl', overlay: { background: 'bg-gray-200/75 dark:bg-gray-800/75 backdrop-blur-sm' } }">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800', header: { padding: 'px-6 py-4' }, body: { padding: 'p-6' }, footer: { padding: 'px-6 py-4' } }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold leading-7 text-gray-900 dark:text-white">
            New Oral Examination
          </h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="handleClose" />
        </div>
      </template>

      <UForm :state="formData" @submit.prevent="handleSave" class="space-y-6">
        <UFormGroup label="Examination Date" name="exam_date" required class="mb-6 max-w-xs">
          <UInput v-model="formData.exam_date" type="date" size="md" />
        </UFormGroup>

        <div class="space-y-8">
          <!-- Row 1: Calculus/Stains & Missing Teeth -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UCard :ui="{ header: { padding: 'px-4 py-3 sm:px-5' }, body: { padding: 'p-4 sm:p-5' }, shadow: 'shadow-md', ring: 'ring-1 ring-gray-200 dark:ring-gray-700' }">
              <template #header>
                <h4 class="text-base font-semibold text-gray-800 dark:text-gray-200">Calculus & Stains</h4>
              </template>
              <div class="space-y-4">
                <div v-for="(item, index) in formData.calculus_stains" :key="index" class="flex items-end space-x-3">
                  <UFormGroup label="Tooth" class="flex-1 min-w-0">
                    <UInput v-model="item.tooth" placeholder="e.g., 17" size="sm" />
                  </UFormGroup>
                  <UFormGroup label="Level" class="flex-1">
                    <USelectMenu v-model="item.level" :options="calculusLevels" value-attribute="key" option-attribute="label" placeholder="Select Level" size="sm" />
                  </UFormGroup>
                  <UButton color="red" variant="soft" icon="i-heroicons-trash-16-solid" size="sm" @click="removeCalculusStain(index)" class="mb-1" />
                </div>
                <UButton type="button" icon="i-heroicons-plus-circle-16-solid" @click="addCalculusStain" variant="outline" size="sm" label="Add Tooth Entry" />
              </div>
            </UCard>

            <UCard :ui="{ header: { padding: 'px-4 py-3 sm:px-5' }, body: { padding: 'p-4 sm:p-5' }, shadow: 'shadow-md', ring: 'ring-1 ring-gray-200 dark:ring-gray-700' }">
              <template #header>
                <h4 class="text-base font-semibold text-gray-800 dark:text-gray-200">Missing Teeth</h4>
              </template>
              <div class="space-y-3">
                <div class="flex items-center space-x-2">
                  <UInput v-model="newMissingTooth" placeholder="Enter tooth number" @keyup.enter="addMissingTooth" size="sm" class="flex-1"/>
                  <UButton type="button" @click="addMissingTooth" variant="outline" size="sm" label="Add Missing" />
                </div>
                <div v-if="formData.missing_teeth.length" class="flex flex-wrap gap-2 pt-1">
                  <UBadge v-for="(tooth, index) in formData.missing_teeth" :key="index" color="gray" variant="solid" size="sm">
                    {{ tooth }}
                    <UButton color="gray" variant="link" icon="i-heroicons-x-mark-16-solid" size="2xs" @click="removeMissingTooth(index)" class="-mr-1.5 ml-0.5 p-0"/>
                  </UBadge>
                </div>
                <p v-else class="text-sm text-gray-500 dark:text-gray-400">No missing teeth recorded.</p>
              </div>
            </UCard>
          </div>

          <!-- Row 2: Pocket Depths & Mobility Scores (Full Width Card with Internal Grid) -->
          <UCard :ui="{ header: { padding: 'px-4 py-3 sm:px-5' }, body: { padding: 'p-4 sm:p-5' }, shadow: 'shadow-md', ring: 'ring-1 ring-gray-200 dark:ring-gray-700' }">
            <template #header>
               <h4 class="text-base font-semibold text-gray-800 dark:text-gray-200">Periodontal Charting</h4>
            </template>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-8">
              <div>
                <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pocket Depths (mm)</h5>
                <div class="grid grid-cols-4 gap-x-2 gap-y-3">
                  <template v-for="quadrant in pocketDepthQuadrants" :key="quadrant.name + '-depths'">
                    <div v-for="tooth in quadrant.teeth" :key="tooth + '-depth'" class="flex-shrink-0">
                      <UFormGroup :label="`T${tooth}`" :name="`pocket_depths.${tooth}`" size="sm">
                        <UInput v-model="formData.pocket_depths[tooth]" type="number" min="0" max="20" placeholder="-" size="xs" />
                      </UFormGroup>
                    </div>
                  </template>
                </div>
              </div>
              <div>
                <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mobility Scores (0-3)</h5>
                <div class="grid grid-cols-4 gap-x-2 gap-y-3">
                  <template v-for="quadrant in mobilityScoreQuadrants" :key="quadrant.name + '-mobility'">
                    <div v-for="tooth in quadrant.teeth" :key="tooth + '-mobility'" class="flex-shrink-0">
                      <UFormGroup :label="`T${tooth}`" :name="`mobility_scores.${tooth}`" size="sm">
                        <UInput v-model="formData.mobility_scores[tooth]" type="number" min="0" max="3" placeholder="-" size="xs" />
                      </UFormGroup>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Row 3: Malocclusion (Full Width Card) -->
          <UCard :ui="{ header: { padding: 'px-4 py-3 sm:px-5' }, body: { padding: 'p-4 sm:p-5' }, shadow: 'shadow-md', ring: 'ring-1 ring-gray-200 dark:ring-gray-700' }">
            <template #header>
                <h4 class="text-base font-semibold text-gray-800 dark:text-gray-200">Malocclusion Assessment</h4>
            </template>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
              <UCheckbox v-model="formData.malocclusion.class_i" label="Class I" size="sm"/>
              <div>
                <UCheckbox v-model="formData.malocclusion.class_ii" label="Class II" size="sm"/>
                <div v-if="formData.malocclusion.class_ii" class="ml-6 mt-1.5 space-y-1.5">
                  <UCheckbox v-model="formData.malocclusion.division_1" label="Division 1" size="xs"/>
                  <UCheckbox v-model="formData.malocclusion.division_2" label="Division 2" size="xs"/>
                </div>
              </div>
              <UCheckbox v-model="formData.malocclusion.class_iii" label="Class III" size="sm"/>
              <UCheckbox v-model="formData.malocclusion.anterior_open_bite" label="Anterior Open Bite" size="sm"/>
              <UCheckbox v-model="formData.malocclusion.posterior_open_bite" label="Posterior Open Bite" size="sm"/>
              <UCheckbox v-model="formData.malocclusion.anterior_cross_bite" label="Anterior Cross Bite" size="sm"/>
              <UCheckbox v-model="formData.malocclusion.posterior_cross_bite" label="Posterior Cross Bite" size="sm"/>
              <UCheckbox v-model="formData.malocclusion.single_tooth_cross_bite" label="Single Tooth Cross Bite" size="sm"/>
              <UCheckbox v-model="formData.malocclusion.crowding" label="Crowding" size="sm"/>
              <UCheckbox v-model="formData.malocclusion.spacing" label="Spacing" size="sm"/>
              <UCheckbox v-model="formData.malocclusion.deep_bite" label="Deep Bite" size="sm"/>
              <UCheckbox v-model="formData.malocclusion.protrusion" label="Protrusion" size="sm"/>
              <UCheckbox v-model="formData.malocclusion.midline_diastema" label="Midline Diastema" size="sm"/>
            </div>
          </UCard>
          
          <!-- Row 4: Impaction & Caries -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UCard :ui="{ header: { padding: 'px-4 py-3 sm:px-5' }, body: { padding: 'p-4 sm:p-5' }, shadow: 'shadow-md', ring: 'ring-1 ring-gray-200 dark:ring-gray-700' }">
              <template #header>
                <h4 class="text-base font-semibold text-gray-800 dark:text-gray-200">Impaction / Root Stumps (RS)</h4>
              </template>
              <div class="space-y-4">
                <div v-for="(item, index) in formData.impaction_info" :key="index" class="space-y-3 border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0 last:pb-0">
                  <div class="flex items-end space-x-3">
                    <UFormGroup label="Tooth" class="flex-1 min-w-0">
                      <UInput v-model="item.tooth" placeholder="e.g., 48" size="sm"/>
                    </UFormGroup>
                    <UFormGroup label="Type/Condition" class="flex-1 min-w-0">
                      <UInput v-model="item.type" placeholder="e.g., Mesioangular, RS" size="sm"/>
                    </UFormGroup>
                    <UButton color="red" variant="soft" icon="i-heroicons-trash-16-solid" size="sm" @click="removeImpactionInfo(index)" class="mb-1"/>
                  </div>
                  <UFormGroup label="Description/Notes">
                    <UTextarea v-model="item.description" placeholder="Detailed notes..." :rows="2" size="sm"/>
                  </UFormGroup>
                </div>
                <UButton type="button" icon="i-heroicons-plus-circle-16-solid" @click="addImpactionInfo" variant="outline" size="sm" label="Add Impaction/RS Entry" />
              </div>
            </UCard>
            
            <UCard :ui="{ header: { padding: 'px-4 py-3 sm:px-5' }, body: { padding: 'p-4 sm:p-5' }, shadow: 'shadow-md', ring: 'ring-1 ring-gray-200 dark:ring-gray-700' }">
              <template #header>
                <h4 class="text-base font-semibold text-gray-800 dark:text-gray-200">Dental Caries</h4>
              </template>
              <div class="space-y-4">
                <div v-for="(caries, index) in formData.caries_chart" :key="index" class="space-y-3 border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0 last:pb-0">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-3 items-start">
                    <UFormGroup label="Tooth" class="sm:col-span-1">
                      <UInput v-model="caries.tooth" placeholder="e.g., 26" size="sm"/>
                    </UFormGroup>
                    <UFormGroup label="Surfaces (e.g. O, M, D)" class="sm:col-span-1">
                      <UInput v-model="caries.surfaces_str" placeholder="O, MO, MOD" size="sm"/>
                    </UFormGroup>
                  </div>
                  <UFormGroup label="Notes" class="mt-1">
                    <UTextarea v-model="caries.notes" placeholder="Cavity, Discoloration..." :rows="2" size="sm"/>
                  </UFormGroup>
                  <div class="flex justify-end pt-1">
                    <UButton color="red" variant="soft" icon="i-heroicons-trash-16-solid" size="sm" @click="removeCariesEntry(index)" />
                  </div>
                </div>
                <UButton type="button" icon="i-heroicons-plus-circle-16-solid" @click="addCariesEntry" variant="outline" size="sm" label="Add Caries Entry" />
              </div>
            </UCard>
          </div>

          <!-- Row 5: Extra Oral Findings (Full Width Card) -->
          <UCard :ui="{ header: { padding: 'px-4 py-3 sm:px-5' }, body: { padding: 'p-4 sm:p-5' }, shadow: 'shadow-md', ring: 'ring-1 ring-gray-200 dark:ring-gray-700' }">
            <template #header>
                <h4 class="text-base font-semibold text-gray-800 dark:text-gray-200">Extra Oral Findings</h4>
            </template>
            <UTextarea v-model="formData.extra_oral_findings" placeholder="Note any findings from extra oral examination (e.g., swelling, TMJ issues, lesions)..." :rows="4" size="sm"/>
          </UCard>
        </div>

        <div v-if="formError" class="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md">
          <p class="text-sm text-red-700 dark:text-red-300">{{ formError }}</p>
        </div>
      </UForm>
      
      <template #footer>
        <div class="flex justify-end space-x-3">
          <UButton type="button" color="gray" variant="ghost" @click="handleClose" :disabled="isSubmitting" size="md">Cancel</UButton>
          <UButton type="button" @click="handleSave" label="Save Examination" :loading="isSubmitting" size="md" />
        </div>
      </template>
    </UCard>
  </UModal>
</template>

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

const getDefaultFormData = () => ({
  exam_date: new Date().toISOString().split('T')[0],
  calculus_stains: [], // Array of { tooth: '', level: '' }
  pocket_depths: {},   // Object { '18': '', '17': '', ... }
  mobility_scores: {}, // Object { '18': '', '17': '', ... }
  malocclusion: {
    class_i: false, class_ii: false, division_1: false, division_2: false, class_iii: false,
    anterior_open_bite: false, posterior_open_bite: false, anterior_cross_bite: false,
    posterior_cross_bite: false, single_tooth_cross_bite: false, crowding: false,
    spacing: false, deep_bite: false, protrusion: false, midline_diastema: false,
  },
  missing_teeth: [],    // Array of strings ['16', '25']
  impaction_info: [],   // Array of { tooth: '', type: '', description: '' }
  caries_chart: [],     // Array of { tooth: '', surfaces_str: '', notes: '' }
  extra_oral_findings: '',
});

const formData = reactive(getDefaultFormData());
const newMissingTooth = ref('');

// Initialize tooth ranges for periodontal charting
const toothRange = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => (start + i).toString());
const allTeethQuadrants = {
  upperRight: toothRange(11, 18).reverse(),
  upperLeft: toothRange(21, 28),
  lowerLeft: toothRange(31, 38),
  lowerRight: toothRange(41, 48).reverse(),
};

const initializeScores = (targetObject) => {
  Object.values(allTeethQuadrants).flat().forEach(tooth => {
    targetObject[tooth] = '';
  });
};

// Call initialize for pocket_depths and mobility_scores
initializeScores(formData.pocket_depths);
initializeScores(formData.mobility_scores);

const pocketDepthQuadrants = [
  { name: 'Upper Right (18-11)', teeth: allTeethQuadrants.upperRight },
  { name: 'Upper Left (21-28)', teeth: allTeethQuadrants.upperLeft },
  { name: 'Lower Right (48-41)', teeth: allTeethQuadrants.lowerRight },
  { name: 'Lower Left (31-38)', teeth: allTeethQuadrants.lowerLeft },
];
const mobilityScoreQuadrants = pocketDepthQuadrants;


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
    initializeScores(formData.pocket_depths); 
    initializeScores(formData.mobility_scores); 
    newMissingTooth.value = '';
    isSubmitting.value = false;
    formError.value = null;
  }
});

// --- Methods for dynamic form sections ---

// Calculus & Stains
const addCalculusStain = () => {
  formData.calculus_stains.push({ tooth: '', level: null }); // MODIFIED: level: null for placeholder
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

    submissionData.calculus_stains = submissionData.calculus_stains.filter(item => item.tooth && item.tooth.trim() !== '');
    
    const cleanedPocketDepths = {};
    Object.keys(submissionData.pocket_depths).forEach(key => {
      const value = submissionData.pocket_depths[key];
      if (value !== '' && value !== null && !isNaN(Number(value))) {
        cleanedPocketDepths[key] = Number(value);
      }
    });
    submissionData.pocket_depths = cleanedPocketDepths;

    const cleanedMobilityScores = {};
    Object.keys(submissionData.mobility_scores).forEach(key => {
      const value = submissionData.mobility_scores[key];
      if (value !== '' && value !== null && !isNaN(Number(value))) {
        cleanedMobilityScores[key] = Number(value);
      }
    });
    submissionData.mobility_scores = cleanedMobilityScores;

    submissionData.missing_teeth = submissionData.missing_teeth.filter(tooth => tooth && tooth.trim() !== '');

    submissionData.impaction_info = submissionData.impaction_info.filter(item => item.tooth && item.tooth.trim() !== '');
    
    submissionData.caries_chart = submissionData.caries_chart
      .filter(item => item.tooth && item.tooth.trim() !== '')
      .map(item => ({
        ...item,
        surfaces: item.surfaces_str ? item.surfaces_str.split(',').map(s => s.trim()).filter(s => s) : [],
        surfaces_str: undefined 
      }));

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

<style scoped>
:deep(.u-form-group label > div) {
  @apply text-sm font-medium text-gray-700 dark:text-gray-300;
}

:deep(.grid .u-form-group label > div) {
    margin-bottom: 0.125rem; 
}
:deep(.grid .u-form-group input) {
    padding-top: 0.375rem;    
    padding-bottom: 0.375rem;
}
</style>