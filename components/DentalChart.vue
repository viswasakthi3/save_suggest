<template>
  <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow w-full">
    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
      <Smile class="h-5 w-5 mr-2 text-blue-500" />
      Dental Chart
    </h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Click on a tooth to view or add treatment records. Dots indicate teeth with recorded conditions.</p>

    <!-- Status Legend -->
    <div class="flex space-x-4 mb-6 text-xs text-gray-600 dark:text-gray-400">
      <div class="flex items-center"><span class="h-2 w-2 bg-green-500 rounded-full mr-1"></span> Completed</div>
      <div class="flex items-center"><span class="h-2 w-2 bg-yellow-500 rounded-full mr-1"></span> Pending</div>
      <!-- Add other statuses if needed -->
    </div>

    <div class="relative">
      <!-- Quadrant Dividing Lines -->
      <div class="absolute top-1/2 left-0 right-0 h-px bg-gray-400 dark:bg-gray-600 transform -translate-y-1/2"></div>
      <div class="absolute top-0 bottom-0 left-1/2 w-px bg-gray-400 dark:bg-gray-600 transform -translate-x-1/2"></div>

      <!-- Upper Jaw -->
      <div class="grid grid-cols-8 gap-1 mb-1 justify-items-center">
        <!-- Upper Right (Quadrant 1: 11-18) -->
        <div v-for="n in 8" :key="'upper-right-' + (19 - n)" class="relative text-center tooth-item">
          <button @click="handleToothClick(19 - n)" class="focus:outline-none">
            <img :src="getToothImagePath(19 - n)" @error="imageError(19 - n)" :alt="'Tooth ' + (19 - n)" class="h-16 w-auto mx-auto" :class="{'opacity-50': !toothImageExists[19 - n]}"/>
            <span v-if="!toothImageExists[19 - n]" class="absolute inset-0 flex items-center justify-center text-xs text-gray-500">No Image</span>
            <span class="block text-xs mt-1 text-gray-700 dark:text-gray-300">{{ 19 - n }}</span>
            <span v-if="getToothStatus(19 - n)" :class="getStatusDotClass(getToothStatus(19 - n))"></span>
          </button>
        </div>
        <!-- Upper Left (Quadrant 2: 21-28) -->
        <div v-for="n in 8" :key="'upper-left-' + (20 + n)" class="relative text-center tooth-item">
          <button @click="handleToothClick(20 + n)" class="focus:outline-none">
            <img :src="getToothImagePath(20 + n)" @error="imageError(20 + n)" :alt="'Tooth ' + (20 + n)" class="h-16 w-auto mx-auto" :class="{'opacity-50': !toothImageExists[20 + n]}"/>
            <span v-if="!toothImageExists[20 + n]" class="absolute inset-0 flex items-center justify-center text-xs text-gray-500">No Image</span>
            <span class="block text-xs mt-1 text-gray-700 dark:text-gray-300">{{ 20 + n }}</span>
            <span v-if="getToothStatus(20 + n)" :class="getStatusDotClass(getToothStatus(20 + n))"></span>
          </button>
        </div>
      </div>

      <!-- Lower Jaw -->
      <div class="grid grid-cols-8 gap-1 mt-1 justify-items-center">
        <!-- Lower Right (Quadrant 4: 41-48) -->
        <div v-for="n in 8" :key="'lower-right-' + (49 - n)" class="relative text-center tooth-item">
          <button @click="handleToothClick(49 - n)" class="focus:outline-none">
            <img :src="getToothImagePath(49 - n)" @error="imageError(49 - n)" :alt="'Tooth ' + (49 - n)" class="h-16 w-auto mx-auto" :class="{'opacity-50': !toothImageExists[49 - n]}"/>
            <span v-if="!toothImageExists[49 - n]" class="absolute inset-0 flex items-center justify-center text-xs text-gray-500">No Image</span>
            <span class="block text-xs mt-1 text-gray-700 dark:text-gray-300">{{ 49 - n }}</span>
            <span v-if="getToothStatus(49 - n)" :class="getStatusDotClass(getToothStatus(49 - n))"></span>
          </button>
        </div>
        <!-- Lower Left (Quadrant 3: 31-38) -->
        <div v-for="n in 8" :key="'lower-left-' + (30 + n)" class="relative text-center tooth-item">
          <button @click="handleToothClick(30 + n)" class="focus:outline-none">
            <img :src="getToothImagePath(30 + n)" @error="imageError(30 + n)" :alt="'Tooth ' + (30 + n)" class="h-16 w-auto mx-auto" :class="{'opacity-50': !toothImageExists[30 + n]}"/>
            <span v-if="!toothImageExists[30 + n]" class="absolute inset-0 flex items-center justify-center text-xs text-gray-500">No Image</span>
            <span class="block text-xs mt-1 text-gray-700 dark:text-gray-300">{{ 30 + n }}</span>
            <span v-if="getToothStatus(30 + n)" :class="getStatusDotClass(getToothStatus(30 + n))"></span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { Smile } from 'lucide-vue-next';
import { computed, reactive } from 'vue';

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

const toothImageExists = reactive({});

// Initialize all tooth image states to true, will be set to false on error
const initializeImageStates = () => {
  const toothNumbers = [
    ...Array.from({ length: 8 }, (_, i) => 11 + i), // 11-18
    ...Array.from({ length: 8 }, (_, i) => 21 + i), // 21-28
    ...Array.from({ length: 8 }, (_, i) => 31 + i), // 31-38
    ...Array.from({ length: 8 }, (_, i) => 41 + i), // 41-48
  ];
  toothNumbers.forEach(num => {
    toothImageExists[num] = true;
  });
};
initializeImageStates();

const getToothImagePath = (toothNumber) => {
  return `/img/teeth/${toothNumber}.png`;
};

const imageError = (toothNumber) => {
  toothImageExists[toothNumber] = false;
};

const toothConditions = computed(() => {
  const conditions = {};
  props.records.forEach(record => {
    if (record.treatments && Array.isArray(record.treatments)) {
      record.treatments.forEach(treatment => {
        if (treatment.tooth_number) {
          // Ensure tooth_number is treated as a string for consistency with FDI
          const toothNumStr = String(treatment.tooth_number);
          conditions[toothNumStr] = {
            status: record.status,
            condition: treatment.treatment_type,
          };
        }
      });
    }
  });
  return conditions;
});

const getToothStatus = (toothNumber) => {
  return toothConditions.value[String(toothNumber)]?.status;
};

const getStatusDotClass = (status) => {
  const baseClass = 'absolute top-1 right-1 h-2.5 w-2.5 rounded-full ring-1 ring-white dark:ring-gray-800';
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

const handleToothClick = (toothNumber) => {
  console.log('Tooth clicked:', toothNumber);
  emit('add-record-for-tooth', String(toothNumber)); // Emit tooth number as string
};

</script>

<style scoped>
.tooth-item {
  min-width: 50px; /* Adjust as needed */
  padding-bottom: 20px; /* Space for number below image */
}
.grid {
    grid-template-columns: repeat(16, minmax(0, 1fr)); /* Ensure 16 columns for the full jaw line */
}
</style>
