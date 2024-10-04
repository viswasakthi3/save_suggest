<template>
    <div class="flex flex-col min-h-screen dark:bg-gray-900 dark:text-white">
      <!-- Header -->
      <header class="container mx-auto p-4">
        <!-- Centered Site Name -->
        <div class="flex flex-col items-center justify-center">
          <img src="/img/save.png" class="w-12 h-auto mb-2" alt="Save Suggest Logo">
          <a href="https://savesuggest.com" >
    <h1 class="text-4xl font-extrabold text-[#1A2421] dark:text-white mb-2">Save Suggest</h1>
  </a>
          <p class="text-center text-gray-600 dark:text-gray-300">
            Save your links and revisit them anytime.
          </p>
        </div>
      </header>
  
      <!-- User Profile and Name -->
      <section v-if="user" class="container mx-auto text-center">
        <!-- User Profile Picture -->
        <div v-if="user.poster_path" class="mb-2 flex justify-center">
          <img :src="user.poster_path" :alt="user.name" class="w-24 h-24 rounded-full object-cover shadow-md">
        </div>
        <!-- User Name -->
        <h2 class="text-2xl font-semibold mb-2">{{ user.name }}</h2>
      </section>
  
      <!-- Main Content -->
      <main class="container mx-auto flex-grow">
        <!-- Loading and Error Messages -->
        <div v-if="loading" class="my-4 text-center text-gray-600">Loading collection, please wait...</div>
        <div v-if="error" class="my-4 text-red-500 text-center">{{ error }}</div>
  
        <!-- Collection Details -->
        <div v-if="collection" class="mb-8">
          <!-- Collection Image -->
          <div v-if="collection.img_url" class="mb-4 flex justify-center">
            <img :src="collection.img_url" :alt="collection.name" class="w-full max-h-64 object-cover rounded-md shadow-md">
          </div>
          <!-- Collection Name and Description -->
          <h3 class="text-3xl font-bold mb-2 text-center">{{ collection.name }}</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4 text-center">{{ collection.description }}</p>
          <!-- Collection Metadata -->
          <div class="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span>Created on {{ formatDate(collection.inserted_date) }}</span>
          </div>
  
          <!-- Small Search Input -->
          <div class="relative mb-6 max-w-md mx-auto">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search links"
              class="w-full pl-8 pr-4 py-2 text-sm bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-0 focus:border-gray-300 transition-all duration-300 ease-in-out dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>
  
          <!-- Links in the Collection -->
          <div v-if="filteredLinks.length > 0" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div v-for="link in filteredLinks" :key="link.id" class="p-4 border rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
              <!-- Image -->
              <img 
                v-if="link.img" 
                :src="link.img" 
                :alt="link.title || link.link"
                class="w-full h-48 object-cover mb-4 rounded-md cursor-pointer"
                @click="openImageModal(link.img)"
              />
  
              <!-- Link Title -->
              <h4 class="font-bold mb-2 truncate">
                <a @click.prevent="openLink(link.link)" class="text-blue-500 hover:underline cursor-pointer">
                  {{ link.title || link.link }}
                </a>
              </h4>
  
              <!-- Description -->
              <p v-if="link.description" class="text-gray-700 dark:text-gray-300 mb-2">{{ truncateText(link.description, 100) }}</p>
  
              <!-- Notes -->
              <p v-if="link.notes" class="text-gray-700 dark:text-gray-300 mb-2">{{ truncateText(link.notes, 100) }}</p>
  
              <!-- Date and Copy Link Button -->
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-500">{{ formatDate(link.created_at) }}</p>
                <button @click="copyLink(link.link)" class="text-gray-500 hover:text-gray-700" title="Copy Link">
                  <Copy class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-600 dark:text-gray-400 text-center">
            No links found in this collection.
          </div>
        </div>
      </main>
  
      <!-- Image Modal -->
      <div v-if="selectedImage" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" @click.self="selectedImage = null">
        <img :src="selectedImage" alt="Full size image" class="max-w-full max-h-full object-contain rounded-md shadow-lg" />
        <button @click="selectedImage = null" class="absolute top-4 right-4 text-white hover:text-gray-300">
          <X class="w-6 h-6" />
        </button>
      </div>
  
      <!-- Footer -->
      <footer class="mt-auto py-6 bg-gray-100 dark:bg-gray-800">
        <div class="container mx-auto px-4">
          <div class="text-center text-gray-600 dark:text-gray-300 text-sm md:text-base">
            <p class="mb-2">For feedback and other inquiries, please contact:</p>
            <a href="mailto:yethuku13@gmail.com" class="text-blue-500 hover:underline dark:text-blue-400">yethuku13@gmail.com</a>
          </div>
        </div>
      </footer>
    </div>
  </template>
  
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import axios from 'axios';

  import { Copy, X } from 'lucide-vue-next';
  


  
  const route = useRoute();
  const router = useRouter();
  const config = useRuntimeConfig();
  
  const collection = ref(null);
  const user = ref(null);
  const error = ref(null);
  const loading = ref(false);
  const searchQuery = ref('');
  const selectedImage = ref(null);
  
  const collection_id = route.params.collection_id;
  
  const fetchCollection = async () => {
    loading.value = true;
    try {
      const response = await axios.get(`${config.public.API_BASE_URL}/view_collection_other/${collection_id}`);
      const data = response.data;
      collection.value = data.collection;
      user.value = data.user;
  
      // Format the links data if necessary
      collection.value.links.forEach(link => {
        // Ensure all necessary fields are present
        link.title = link.title || '';
        link.description = link.description || '';
        link.notes = link.notes || '';
        link.img = link.img || '';
      });
    } catch (err) {
      console.error('Failed to fetch collection:', err);
      if (err.response && err.response.data && err.response.data.error) {
        error.value = err.response.data.error;
      } else {
        error.value = 'Failed to load collection.';
      }
    } finally {
      loading.value = false;
    }
  };
  
  onMounted(() => {
    fetchCollection();
  });
  
  // Utility Functions
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Computed property for filtered links
  const filteredLinks = computed(() => {
    if (!collection.value || !collection.value.links) return [];
    if (!searchQuery.value) return collection.value.links;
    return collection.value.links.filter(link =>
      (link.title && link.title.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (link.description && link.description.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (link.link && link.link.toLowerCase().includes(searchQuery.value.toLowerCase()))
    );
  });
  
  // Function to open link in a new tab
  const openLink = (url) => {
    window.open(url, '_blank');
  };
  
  // Function to copy link to clipboard
  const copyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      // You can show a notification here if you have one
    } catch (err) {
      console.error('Failed to copy link: ', err);
      // You can show an error notification here
    }
  };
  
  // Function to open image modal
  const openImageModal = (imageUrl) => {
    selectedImage.value = imageUrl;
  };
  
  // Function to go back to the previous page
  const goBack = () => {
    router.back();
  };


  useHead(() => {
  return {
    title: collection.value && user.value ? `${collection.value.name} by ${user.value.name} - SaveSuggest` : 'SaveSuggest',
    meta: [
      { name: 'description', content: collection.value?.description || '' },
      { property: 'og:title', content: collection.value && user.value ? `${collection.value.name} by ${user.value.name} - SaveSuggest` : 'SaveSuggest' },
      { property: 'og:description', content: collection.value?.description || '' },
      { property: 'og:image', content: collection.value?.img_url || '/img/save_preview_1.png' },
      { property: 'og:url', content: `https://savesuggest.com/collections/${collection_id}` },
      { name: 'twitter:title', content: collection.value && user.value ? `${collection.value.name} by ${user.value.name} - SaveSuggest` : 'SaveSuggest' },
      { name: 'twitter:description', content: collection.value?.description || '' },
      { name: 'twitter:image', content: collection.value?.img_url || '/img/save_preview_1.png' },
      { name: 'twitter:card', content: 'summary_large_image' }
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/png',
        href: '/favicon.png'
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
      }
    ]
  };
});

  </script>
  
  <style>
  /* Add any additional styles if needed */
  </style>
  