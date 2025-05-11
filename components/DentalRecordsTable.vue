<template>
  <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
      <FileText class="h-5 w-5 mr-2 text-green-500" />
      Dental Records
      <span v-if="!loading && records.length > 0" class="ml-2 text-sm text-gray-500 dark:text-gray-400">Showing {{ records.length }} records</span>
    </h3>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tooth #</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Condition</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Primary Treatment</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Record Date</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Cost</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">X-Ray</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-if="loading">
            <td colspan="8" class="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              <LoaderCircle class="h-5 w-5 animate-spin inline mr-2" /> Loading records...
            </td>
          </tr>
          <tr v-else-if="records.length === 0">
            <td colspan="8" class="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No dental records found for this patient.
            </td>
          </tr>
          <tr v-else v-for="record in records" :key="record.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/60">
            <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ record.tooth_number }}</td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{{ record.condition || 'N/A' }}</td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ getMainTreatmentType(record.treatments) }}
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ formatDate(record.record_date) }}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm">
              <span :class="getStatusClass(record.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ record.status || 'N/A' }}
              </span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{{ calculateTotalCost(record.treatments) }}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ hasXRay(record.treatments) }}
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
              <button @click="$emit('view-details', record)" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-2 transition-colors" title="View Details">
                <Eye class="h-4 w-4 inline"/>
              </button>
              <button @click="$emit('edit-record', record)" class="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 mr-2 transition-colors" title="Edit Record">
                 <Pencil class="h-4 w-4 inline"/>
              </button>
              <button @click="$emit('delete-record', record.id)" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="Delete Record">
                 <Trash2 class="h-4 w-4 inline"/>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { FileText, LoaderCircle, Eye, Pencil, Trash2 } from 'lucide-vue-next';

const props = defineProps({
  records: {
    type: Array,
    required: true,
    default: () => [] // Each item is a dental record object from the new API
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['view-details', 'edit-record', 'delete-record']);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' }; // Removed time for brevity
  try {
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (e) {
    return dateString; // Fallback to original string if date is invalid
  }
};

const getMainTreatmentType = (treatments) => {
  if (!treatments || treatments.length === 0) return 'N/A';
  const firstTreatmentType = treatments[0].treatment_type;
  if (treatments.length > 1) {
    return `${firstTreatmentType} (+${treatments.length - 1} more)`;
  }
  return firstTreatmentType || 'N/A';
};

const calculateTotalCost = (treatments) => {
  if (!treatments || treatments.length === 0) return 'N/A';
  const total = treatments.reduce((sum, treatment) => sum + (parseFloat(treatment.cost) || 0), 0);
  return total > 0 ? `$${total.toFixed(2)}` : 'N/A';
};

const hasXRay = (treatments) => {
  if (!treatments || treatments.length === 0) return 'No';
  return treatments.some(t => t.xray_taken) ? 'Yes' : 'No';
};

const getStatusClass = (status) => {
  const s = status?.toLowerCase() || '';
  if (s.includes('complete')) return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200';
  if (s.includes('plan')) return 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200';
  if (s.includes('undergoing') || s.includes('progress')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100';
  if (s.includes('monitor')) return 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-200';
  if (s.includes('cancel')) return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200';
  if (s.includes('initial')) return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-200';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
};

</script>

<style scoped>
/* Minimal styling, relying on Tailwind utility classes */
</style>
