<template>
  <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
      <Smile class="h-5 w-5 mr-2 text-blue-500" />
      Dental Chart
    </h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Click on a tooth to view or add treatment records. Dots indicate teeth with recorded conditions.</p>

    <!-- Status Legend -->
    <div class="flex space-x-4 mb-4 text-xs text-gray-600 dark:text-gray-400">
      <div class="flex items-center"><span class="h-2 w-2 bg-green-500 rounded-full mr-1"></span> Completed</div>
      <div class="flex items-center"><span class="h-2 w-2 bg-yellow-500 rounded-full mr-1"></span> Pending</div>
      <!-- Add other statuses if needed -->
    </div>

    <!-- Upper Jaw (Maxilla) -->
    <div class="mb-8">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Upper Jaw (Maxilla)</h4>
      <div class="grid grid-cols-8 gap-2 justify-items-center">
        <!-- Right Side (Patient's Right) -->
        <div v-for="n in 8" :key="'upper-right-' + n" class="relative text-center pt-1 pb-5">
          <button @click="handleToothClick(n)" :class="getToothClasses(n)">
            {{ n }}
            <span v-if="getToothStatus(n)" :class="getStatusDotClass(getToothStatus(n))"></span>
          </button>
          <span class="text-xs text-gray-600 dark:text-gray-400 absolute bottom-0 left-1/2 transform -translate-x-1/2 w-max max-w-[40px] truncate">{{ getConditionText(n) }}</span>
        </div>
        <!-- Left Side (Patient's Left) -->
        <div v-for="n in 8" :key="'upper-left-' + (9 + n - 1)" class="relative text-center pt-1 pb-5">
           <button @click="handleToothClick(9 + n - 1)" :class="getToothClasses(9 + n - 1)">
            {{ 9 + n - 1 }}
            <span v-if="getToothStatus(9 + n - 1)" :class="getStatusDotClass(getToothStatus(9 + n - 1))"></span>
          </button>
           <span class="text-xs text-gray-600 dark:text-gray-400 absolute bottom-0 left-1/2 transform -translate-x-1/2 w-max max-w-[40px] truncate">{{ getConditionText(9 + n - 1) }}</span>
        </div>
      </div>
    </div>

    <!-- Lower Jaw (Mandible) -->
    <div class="mb-2">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Lower Jaw (Mandible)</h4>
       <div class="grid grid-cols-8 gap-2 justify-items-center">
        <!-- Right Side (Patient's Right) -->
        <div v-for="n in 8" :key="'lower-right-' + (32 - n + 1)" class="relative text-center pt-1 pb-5">
          <button @click="handleToothClick(32 - n + 1)" :class="getToothClasses(32 - n + 1)">
            {{ 32 - n + 1 }}
            <span v-if="getToothStatus(32 - n + 1)" :class="getStatusDotClass(getToothStatus(32 - n + 1))"></span>
          </button>
           <span class="text-xs text-gray-600 dark:text-gray-400 absolute bottom-0 left-1/2 transform -translate-x-1/2 w-max max-w-[40px] truncate">{{ getConditionText(32 - n + 1) }}</span>
        </div>
        <!-- Left Side (Patient's Left) -->
        <div v-for="n in 8" :key="'lower-left-' + (17 + n - 1)" class="relative text-center pt-1 pb-5">
           <button @click="handleToothClick(17 + n - 1)" :class="getToothClasses(17 + n - 1)">
            {{ 17 + n - 1 }}
            <span v-if="getToothStatus(17 + n - 1)" :class="getStatusDotClass(getToothStatus(17 + n - 1))"></span>
          </button>
           <span class="text-xs text-gray-600 dark:text-gray-400 absolute bottom-0 left-1/2 transform -translate-x-1/2 w-max max-w-[40px] truncate">{{ getConditionText(17 + n - 1) }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { Smile } from 'lucide-vue-next';
import { computed } from 'vue';

const props = defineProps({
  patientId: {
    type: [String, Number],
    required: true
  },
  records: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['add-record-for-tooth']);

const toothConditions = computed(() => {
  const conditions = {};
  props.records.forEach(record => {
    if (record.treatments && Array.isArray(record.treatments)) {
      record.treatments.forEach(treatment => {
        if (treatment.tooth_number) {
          const toothNum = parseInt(treatment.tooth_number, 10);
          if (!isNaN(toothNum)) {
            conditions[toothNum] = {
              status: record.status,
              condition: treatment.treatment_type,
            };
          }
        }
      });
    }
  });
  return conditions;
});

const getToothStatus = (toothNumber) => {
  return toothConditions.value[toothNumber]?.status;
};

const getConditionText = (toothNumber) => {
   return toothConditions.value[toothNumber]?.condition || '-';
};

const getStatusDotClass = (status) => {
  const baseClass = 'absolute top-0 right-0 h-2 w-2 rounded-full ring-1 ring-white dark:ring-gray-800';
  switch (status?.toLowerCase()) {
    case 'completed':
      return `${baseClass} bg-green-500`;
    case 'scheduled':
    case 'pending':
      return `${baseClass} bg-yellow-500`;
    default:
      return '';
  }
};

const getToothClasses = (toothNumber) => {
  const base = 'w-9 h-9 border rounded flex items-center justify-center text-sm relative focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75';
  const status = getToothStatus(toothNumber);
  let colors = 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';

  if (status) {
     colors = 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800';
  }

  return `${base} ${colors}`;
};

const handleToothClick = (toothNumber) => {
  console.log('Tooth clicked:', toothNumber);
  emit('add-record-for-tooth', toothNumber);
};

</script>

<style scoped>
</style>
