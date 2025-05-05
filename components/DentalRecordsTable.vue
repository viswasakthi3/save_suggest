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
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tooth</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Condition</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Treatment</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cost</th>
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
          <!-- Iterate over records (appointments) -->
          <template v-else v-for="record in records" :key="record.id">
            <!-- If a record has multiple treatments, display each as a row -->
            <tr v-if="record.treatments && record.treatments.length > 0" 
                v-for="(treatment, index) in record.treatments" 
                :key="record.id + '-' + treatment.id" 
                class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{{ treatment.tooth_number || 'N/A' }}</td>
              <td class="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{{ treatment.condition || 'N/A' }}</td>
              <td class="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{{ treatment.treatment_type || 'N/A' }}</td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ record.date || 'N/A' }}</td>
              <td class="px-4 py-4 whitespace-nowrap text-sm">
                <span :class="getStatusClass(record.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ record.status || 'N/A' }}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ treatment.cost !== null ? '$' + parseFloat(treatment.cost).toFixed(2) : 'N/A' }}</td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                 <!-- TODO: Add logic to show/link X-Ray based on treatment.xray_image_path -->
                 {{ treatment.xray_taken ? 'Yes' : 'No' }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <button @click="$emit('view-details', record)" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-2" title="View Details">
                  <Eye class="h-4 w-4 inline"/>
                </button>
                <button @click="$emit('edit-record', record)" class="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 mr-2" title="Edit Record">
                   <Pencil class="h-4 w-4 inline"/>
                </button>
                <button @click="$emit('delete-record', record.id)" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Delete Record">
                   <Trash2 class="h-4 w-4 inline"/>
                </button>
              </td>
            </tr>
             <!-- Fallback row if appointment has no treatments (display basic info) -->
            <tr v-else class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">N/A</td>
              <td class="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{{ record.reason || 'N/A' }}</td>
              <td class="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">N/A</td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ record.date || 'N/A' }}</td>
              <td class="px-4 py-4 whitespace-nowrap text-sm">
                <span :class="getStatusClass(record.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ record.status || 'N/A' }}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">N/A</td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">N/A</td>
              <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
                 <button @click="$emit('view-details', record)" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-2" title="View Details">
                  <Eye class="h-4 w-4 inline"/>
                </button>
                <button @click="$emit('edit-record', record)" class="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 mr-2" title="Edit Record">
                   <Pencil class="h-4 w-4 inline"/>
                </button>
                <button @click="$emit('delete-record', record.id)" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Delete Record">
                   <Trash2 class="h-4 w-4 inline"/>
                </button>
              </td>
            </tr>
          </template>
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
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['view-details', 'edit-record', 'delete-record']);

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'scheduled':
    case 'pending': // Added pending based on form
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'in_progress': // Added in_progress based on form
       return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'no-show':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'; // Adjusted no-show style
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};
</script>

<style scoped>
/* Add any specific styles for the records table */
</style>
