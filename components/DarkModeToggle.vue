<template>
    <button @click="toggleDarkMode" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
      <Sun v-if="isDarkMode" class="w-5 h-5 text-yellow-500" />
      <Moon v-else class="w-5 h-5 text-gray-500 dark:text-gray-400" />
    </button>
  </template>
  
  <script setup>
  import { inject } from 'vue'
  import { Sun, Moon } from 'lucide-vue-next'
  
  const isDarkMode = inject('isDarkMode')
  const toggleDarkMode = inject('toggleDarkMode')
  </script>
  