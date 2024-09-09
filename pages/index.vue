


<template>

<div class="flex flex-col min-h-screen">
    <!-- Main content wrapper -->
    <div class="container mx-auto p-4 max-w-full">
      <div class="flex items-center justify-center space-x-4">
  <img src="/img/save.png"class="w-12 h-auto">
  <h1 class="text-3xl font-bold">SaveSuggest.com</h1>
</div>


      <div class="auth-container">
  <div class="google-signup-wrapper">
    <google_signup v-if="!accessToken" class="google-signup" />
  </div>
  <face3 v-if="accessToken" class="face" />
</div>

      <!-- Centered and Reduced Width Paste URL Bar -->
      <div class="mb-6 flex justify-center">
    <div class="relative w-full max-w-lg">
      <input 
        ref="urlInputRef"
        v-model="url"
        type="text" 
        placeholder="Paste URL" 
        class="w-full p-3 pr-24 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
         @keydown="handleKeydown"
      />
      <button 
        @click="url ? clearUrl() : handlePaste()"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
      >
        {{ url ? 'Clear' : '📋 Paste' }}
      </button>
    </div>
  </div>
      <!-- Loading, Error, and Success Messages -->
      <div v-if="loading" class="mb-4 text-center text-gray-600">Loading preview, please wait...</div>
      <div v-if="error" class="mb-4 text-red-500 text-center">{{ error }}</div>
      <div v-if="linkSaved" class="mb-4 text-green-500 text-center">Link saved successfully!</div>
  
      <!-- Preview Section -->
      <div v-if="url" class="mb-6 flex justify-center">
        <div class="w-full max-w-lg border rounded-lg p-4 shadow-md">
          <div v-if="!metadata && !loading" class="mb-4 text-yellow-500 text-center">
            No details found. You can still save this link.
          </div>
          <div v-if="metadata && metadata.title" class="mb-3 flex items-center justify-between">
            <h2 class="font-bold text-xl">{{ metadata.title }}</h2>
            <button @click="startEditingTitle" v-if="!editingTitle" class="text-blue-500 hover:text-blue-600">
              <Pencil class="w-5 h-5" />
            </button>
          </div>
          <div v-if="editingTitle" class="mb-3">
            <input 
              v-model="editedTitle" 
              type="text" 
              class="w-full p-2 border rounded-md"
              @keyup.enter="updateTitle"
            />
            <div class="mt-2">
              <button @click="updateTitle" class="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 mr-2">
                OK
              </button>
              <button @click="cancelEditTitle" class="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </div>
          <p v-if="metadata && metadata.description" class="text-gray-600 mb-3">{{ truncateText(metadata.description, 150) }}</p>

            <!-- Add the link display here -->
      <a :href="url" target="_blank" rel="noopener noreferrer" class="block mb-3 text-blue-500 hover:underline break-all">
        {{ url }}
      </a>
      
          <div v-if="metadata && metadata.image" class="mb-3">
            <div :class="{'w-16 h-16 mx-auto': isLogo, 'max-w-full': !isLogo}">
              <img 
                :src="metadata.image" 
                :alt="metadata.title"
                :style="imageDisplayStyle"
                @load="onImageLoad"
                class="rounded-md"
              />
            </div>
          </div>
          <div class="mb-3">
            <h3 class="font-bold mb-2">Add to Collections:</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="collection in collections"
                :key="collection.id"
                @click="toggleCollectionSelection(collection.id)"
          class="px-3 py-1 rounded-full transition duration-200 flex items-center"
          :class="[
            selectedCollectionIds.includes(collection.id) 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          ]"
        >
          {{ collection.name }}
          <span v-if="selectedCollectionIds.includes(collection.id)" class="ml-1">✓</span>
          <span v-else class="ml-1">+</span>
        </button>
      </div>
    </div>
    <textarea 
      v-model="notes" 
      placeholder="Add notes (optional)" 
      class="w-full p-2 mb-3 border rounded-md"
      rows="1"
    ></textarea>
    <button 
      @click="saveLink"
      :disabled="saving"
      class="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-200 disabled:bg-gray-400"
    >
      {{ saving ? 'Saving...' : 'Save Link' }}
    </button>
  </div>
</div>

<!-- Collections Filter -->
<div class="mb-6 text-center">
  <h2 class="text-2xl font-bold mb-3">{{ selectedCollectionId ? getCollectionName(selectedCollectionId) : 'Your Collections' }}</h2>
  <p v-if="selectedCollectionId" class="text-gray-600 mb-3">{{ getCollectionDescription(selectedCollectionId) }}</p>
  <div class="flex flex-wrap justify-center gap-2 mb-3">
    <button
      @click="selectCollection(null)"
      :class="['px-3 py-1 rounded-full transition duration-200', 
               selectedCollectionId === null 
               ? 'bg-blue-500 text-white' 
               : 'bg-gray-200 hover:bg-gray-300']"
    >
      All Links
    </button>
    <button
      v-for="collection in collections"
      :key="collection.id"
      @click="selectCollection(collection.id)"
      :class="['px-3 py-1 rounded-full transition duration-200', 
               selectedCollectionId === collection.id 
               ? 'bg-blue-500 text-white' 
               : 'bg-gray-200 hover:bg-gray-300']"
    >
      {{ collection.name }}
    </button>
    <button 
      @click="showNewCollectionForm = true" 
      class="px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition duration-200"
    >
      + New Collection
    </button>
  </div>
</div>

<!-- New Collection Form -->
<div v-if="showNewCollectionForm" class="mt-4 p-4 border rounded-lg shadow-md max-w-lg mx-auto">
  <h3 class="text-lg font-bold mb-3">Create New Collection</h3>
  <input v-model="newCollection.name" type="text" placeholder="Collection Name" class="w-full p-2 mb-2 border rounded-md" />
  <input v-model="newCollection.description" type="text" placeholder="Description (optional)" class="w-full p-2 mb-3 border rounded-md" />
  <div class="flex justify-end">
    <button @click="createNewCollection" :disabled="creatingCollection" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 disabled:bg-gray-400">
      {{ creatingCollection ? 'Creating...' : 'Create' }}
    </button>
    <button @click="showNewCollectionForm = false" class="px-4 py-2 ml-2 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200">Cancel</button>
  </div>
</div>

  <!-- Saved Links Section -->
  <div class="max-w-5xl mx-auto w-full">
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-4">
        <h2 class="text-2xl font-bold">{{ 'Saved Links' }}</h2>
        <div class="relative">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search links"
            class="pl-8 pr-4 py-2 text-sm bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-gray-300 transition-all duration-300 ease-in-out"
          />
          <span class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </div>
    </div>

    <!-- Auto-aligned Saved Links -->
    <div :class="{
      'grid gap-4': currentLayout === 'grid' || (currentLayout === 'masonry' && filteredAndSearchedLinks.length === 1),
      'grid-cols-auto-fit': currentLayout === 'grid' || (currentLayout === 'masonry' && filteredAndSearchedLinks.length === 1),
      'space-y-4': currentLayout === 'list',
      'masonry-grid': currentLayout === 'masonry' && filteredAndSearchedLinks.length > 1
    }">
      <div v-for="link in sortedAndFilteredLinks" :key="link.id" 
           :class="{
             'mb-4 p-4 border rounded-lg shadow-md': true, 
             'masonry-item': currentLayout === 'masonry' && filteredAndSearchedLinks.length > 1,
             'max-w-sm mx-auto': filteredAndSearchedLinks.length === 1
           }">
        <img 
          v-if="link.img && currentLayout !== 'list'" 
          :src="link.img" 
          :alt="link.title"
          class="w-full h-48 object-cover mb-4 rounded-md"
        />
        <div class="flex justify-between items-start mb-2">
          <h3 v-if="link.title" class="font-bold text-lg">{{ link.title }}</h3>
          <div>
            <button @click="editLink(link)" class="text-blue-500 hover:text-blue-600 mr-2">
              <Pencil class="w-5 h-5" />
            </button>
            <button @click="openDeleteModal(link)" class="text-red-500 hover:text-red-600">
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Link and Copy Button -->
        <div class="flex items-center justify-between">
          <a :href="link.link" target="_blank" class="text-blue-500 hover:underline mb-2 block truncate">
            {{ link.link }}
          </a>

        </div>

        <p v-if="link.description" class="text-gray-600 mb-2">{{ truncateText(link.description, 100) }}</p>
        <p v-if="link.notes" class="text-gray-600 mb-2">Notes: {{ truncateText(link.notes, 100) }}</p>
        <img 
          v-if="link.img && currentLayout === 'list'" 
          :src="link.img" 
          :alt="link.title"
          :style="getImageStyle(link)"
          class="rounded-md mb-2 cursor-pointer" 
          @click="openImageModal(link.img)"
          @load="(event) => onSavedLinkImageLoad(event, link)"
        />


        <div class="flex items-center justify-between">
  <p class="text-sm text-gray-500 mb-2">Created: {{ formatDate(link.created_at) }}</p>





  <button @click="copyLink(link.link)" class="text-gray-500 hover:text-gray-700">
   
    <UTooltip text="copy">
   
    <Copy class="w-4 h-4" /></UTooltip>
  </button>
</div>

        <div class="flex flex-wrap gap-2">
          <span 
            v-for="collectionId in link.collection_ids" 
            :key="collectionId" 
            class="px-2 py-1 bg-gray-200 rounded-full text-sm cursor-pointer hover:bg-gray-300"
            @click="selectCollection(collectionId)"
          >
            {{ getCollectionName(collectionId) }}
          </span>
        </div>


     
      </div>
    </div>
  </div>

<!-- Edit Link Modal -->
    <!-- Edit Link Modal -->
    <div v-if="editingLink" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="cancelEdit">
      <div class="bg-white p-6 rounded-lg max-w-lg w-full">
        <h2 class="text-2xl font-bold mb-4">Edit Link</h2>
        <input v-model="editingLink.title" class="w-full p-2 mb-2 border rounded" placeholder="Title" />
        <input v-model="editingLink.link" class="w-full p-2 mb-2 border rounded" placeholder="URL" />
        <textarea v-model="editingLink.description" class="w-full p-2 mb-2 border rounded" placeholder="Description" rows="3"></textarea>
        <textarea v-model="editingLink.notes" class="w-full p-2 mb-2 border rounded" placeholder="Notes" rows="3"></textarea>
        
        <!-- Collection Selection -->
        <div class="mb-3">
          <h3 class="font-bold mb-2">Collections:</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="collection in collections"
              :key="collection.id"
              @click="toggleCollectionSelection(collection.id)"
              class="px-3 py-1 rounded-full transition duration-200 flex items-center"
              :class="[
                selectedCollectionIds.includes(collection.id) 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              ]"
            >
              {{ collection.name }}
              <span v-if="selectedCollectionIds.includes(collection.id)" class="ml-1">✓</span>
              <span v-else class="ml-1">+</span>
            </button>
          </div>
        </div>

        <div class="flex justify-end">
          <button @click="updateLink" :disabled="saving" class="px-4 py-2 bg-blue-500 text-white rounded mr-2 disabled:bg-gray-400">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
          <button @click="cancelEdit" class="px-4 py-2 bg-gray-300 rounded">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="selectedImage" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="selectedImage = null">
      <img :src="selectedImage" alt="Full size image" class="max-w-full max-h-full object-contain" />
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
<div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white p-6 rounded-lg max-w-sm w-full">
    <h2 class="text-2xl font-bold mb-4">Delete Link</h2>
    <p class="mb-4">Are you sure you want to delete this link?</p>
    <div class="flex justify-end">
      <button @click="confirmDelete" class="px-4 py-2 bg-red-500 text-white rounded mr-2 hover:bg-red-600">
        Yes, Delete
      </button>
      <button @click="closeDeleteModal" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
        Cancel
      </button>
    </div>
    <button @click="closeDeleteModal" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
      <X class="w-6 h-6" />
    </button>
  </div>
</div>
<!-- Feedback and Contact Section -->
<!-- Feedback and Contact Section -->
<footer class="mt-auto py-6 bg-gray-100">
      <div class="container mx-auto px-4">
        <div class="text-center text-gray-600 text-sm md:text-base">
          <p class="mb-2">For feedback and other inquiries, please contact:</p>
          <a href="mailto:yethuku13@gmail.com" class="text-blue-500 hover:underline">yethuku13@gmail.com</a>
        </div>
      </div>
    </footer>
</div>
<div v-if="notification.show" class="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg">
    {{ notification.message }}
  </div>

</template>

<script setup>

useSeoMeta({
  title: 'SaveSuggest - Save, Organize & Share Your Favorite Links',
  description: 'Discover a smarter way to save, organize, and share your links with SaveSuggest. Create personalized collections, preview content, and share with friends. Start organizing today!',
  ogTitle: 'SaveSuggest - Save, Organize & Share Your Favorite Links',
  ogDescription: 'Easily save and manage links, create collections, and share previews with others. Join SaveSuggest and take control of your online content today!',
  ogImage: '/img/save.png',
  ogUrl: 'https://savesuggest.com',
  twitterTitle: 'SaveSuggest - Save, Organize & Share Your Favorite Links',
  twitterDescription: 'Save, organize, and share links effortlessly. Create collections and see link previews with SaveSuggest. Start organizing your digital life today!',
  twitterImage: '/img/save-suggest.png',
  twitterCard: 'summary_large_image'
})

useHead({
  htmlAttrs: {
    lang: 'en'
  },
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: '/favicon.png'
    }
  ]
})










import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { LayoutGrid, List, Grid, Pencil, Trash2, X, Copy } from 'lucide-vue-next'

const url = ref('')
const metadata = ref(null)
const loading = ref(false)
const error = ref(null)
const collections = ref([])
const selectedCollectionIds = ref([])
const showNewCollectionForm = ref(false)
const newCollection = ref({ name: '', description: '' })
const savedLinks = ref([])
const notes = ref('')
const saving = ref(false)
const creatingCollection = ref(false)
const editingTitle = ref(false)
const editedTitle = ref('')
const searchQuery = ref('')
const selectedImage = ref(null)
const linkSaved = ref(false)
const editingLink = ref(null)
const imageAspectRatio = ref(1)
const isLogo = ref(false)
const imageWidth = ref(0)
const imageHeight = ref(0)
const imageLoaded = ref(false)
const savedLinkImages = ref({})
const currentLayout = ref('grid')
const selectedCollectionId = ref(null)
const showLayoutModal = ref(false)
const config = useRuntimeConfig()



const copyLink = async (link) => {
  try {
    await navigator.clipboard.writeText(link);
    notification.value = { show: true, message: 'Link copied to clipboard' };
    setTimeout(() => {
      notification.value.show = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy link: ', err);
    notification.value = { show: true, message: 'Failed to copy link' };
    setTimeout(() => {
      notification.value.show = false;
    }, 2000);
  }
}

const notification = ref({ show: false, message: '' });

const fetchMetadata = async () => {
  if (!url.value) {
    error.value = 'Please enter a URL'
    return
  }

  loading.value = true
  error.value = null
  metadata.value = null

  try {
    const response = await $fetch('/api/fetch-metadata', {
      params: { url: url.value }
    })

    if (response.error) {
      error.value = response.error
    } else {
      metadata.value = response.metadata
    }
  } catch (err) {
    console.error('Error fetching metadata:', err)
    error.value = 'Failed to fetch metadata'
  } finally {
    loading.value = false
  }
}


const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    fetchMetadata();
  }
};


const getToken = () => {
  const tokenCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("access_token"))
  
  if (tokenCookie) {
    return tokenCookie.split("=")[1]
  } else {
    console.error("Access token not found in cookies")
    error.value = " Please log in to save links"
    return null
  }
}

const makeAuthenticatedRequest = async (requestFunction) => {
  const token = getToken()
  if (!token) {
    throw new Error("No authentication token available")
  }
  return requestFunction(token)
}

const saveLink = async () => {
  saving.value = true
  linkSaved.value = false
  try {
    await makeAuthenticatedRequest(async (token) => {
      await axios.post(`${config.public.API_BASE_URL}/save_links`, {
        link: url.value,
        collection_ids: selectedCollectionIds.value,
        notes: notes.value,
        img: metadata.value?.image,
        title: metadata.value?.title,
        description: metadata.value?.description
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
    })
    // Clear form and refresh data
    url.value = ''
    metadata.value = null
    selectedCollectionIds.value = []
    notes.value = ''
    linkSaved.value = true
    setTimeout(() => {
      linkSaved.value = false
    }, 3000)
    await fetchUserData()
  } catch (error) {
    console.error("An error occurred while saving the link: ", error)
    this.error = "Failed to save the link. Please try again."
  } finally {
    saving.value = false
  }
}

const fetchUserData = async () => {
  try {
    await makeAuthenticatedRequest(async (token) => {
      const { data } = await axios.get(`${config.public.API_BASE_URL}/get_user_data_links`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      collections.value = data.collections
      savedLinks.value = data.links
    })
  } catch (error) {
    console.error("An error occurred while fetching user data: ", error)
    if (error.response) {
      console.error("Response data:", error.response.data)
      console.error("Response status:", error.response.status)
      console.error("Response headers:", error.response.headers)
    }
    error.value = "Failed to fetch user data. Please refresh the page."
  }
}

const createNewCollection = async () => {
  creatingCollection.value = true
  try {
    await makeAuthenticatedRequest(async (token) => {
      await axios.post(`${config.public.API_BASE_URL}/create_collection`, {
        name: newCollection.value.name,
        description: newCollection.value.description || null
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
    })
    showNewCollectionForm.value = false
    newCollection.value = { name: '', description: '' }
    await fetchUserData()
  } catch (error) {
    console.error("An error occurred while creating a new collection: ", error)
    error.value = "Failed to create a new collection. Please try again."
  } finally {
    creatingCollection.value = false
  }
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength
    ? text.slice(0, maxLength) + '...'
    : text
}



const openImageModal = (imageUrl) => {
  selectedImage.value = imageUrl
}

const toggleCollectionSelection = (collectionId) => {
  const index = selectedCollectionIds.value.indexOf(collectionId)
  if (index === -1) {
    selectedCollectionIds.value.push(collectionId)
  } else {
    selectedCollectionIds.value.splice(index, 1)
  }
}

const filteredLinks = computed(() => {
  if (selectedCollectionId.value === null) {
    return savedLinks.value
  }
  return savedLinks.value.filter(link => 
    link.collection_ids.includes(selectedCollectionId.value)
  )
})

const updateLink = async () => {
  saving.value = true
  try {
    await makeAuthenticatedRequest(async (token) => {
      const response = await axios.post(`${config.public.API_BASE_URL}/save_links`, {
        id: editingLink.value.id, // Include the id to indicate it's an update
        link: editingLink.value.link,
        collection_ids: selectedCollectionIds.value,
        notes: editingLink.value.notes,
        img: editingLink.value.img,
        title: editingLink.value.title,
        description: editingLink.value.description
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      
      // Update the local state with the response data
      const updatedLink = response.data
      const index = savedLinks.value.findIndex(link => link.id === updatedLink.id)
      if (index !== -1) {
        savedLinks.value[index] = updatedLink
      }
    })
    
    editingLink.value = null
    await fetchUserData() // Refresh all data
  } catch (error) {
    console.error("An error occurred while updating the link: ", error)
    this.error = "Failed to update the link. Please try again."
  } finally {
    saving.value = false
  }
}

const cancelEdit = () => {
  editingLink.value = null
  selectedCollectionIds.value = []
}

const onImageLoad = (event) => {
  const img = event.target
  imageWidth.value = img.naturalWidth
  imageHeight.value = img.naturalHeight
  imageLoaded.value = true
  imageAspectRatio.value = img.naturalWidth / img.naturalHeight
  isLogo.value = img.naturalWidth <= 200 && img.naturalHeight <= 200
}

const imageDisplayStyle = computed(() => {
  if (!imageLoaded.value) return {}

  const maxWidth = 600 // Maximum width for the image container
  const maxHeight = 400 // Maximum height for the image container

  if (isLogo.value) {
    return {
      width: '64px',
      height: '64px',
      objectFit: 'contain'
    }
  }

  if (imageWidth.value <= maxWidth && imageHeight.value <= maxHeight) {
    // Image is smaller than the container, display at original size
    return {
      width: `${imageWidth.value}px`,
      height: `${imageHeight.value}px`
    }
  }

  const aspectRatio = imageWidth.value / imageHeight.value

  if (aspectRatio > maxWidth / maxHeight) {
    // Image is wider than the container
    return {
      width: '100%',
      height: 'auto',
      maxHeight: `${maxHeight}px`,
      objectFit: 'contain'
    }
  } else {
    // Image is taller than the container
    return {
      width: 'auto',
      height: `${maxHeight}px`,
      maxWidth: '100%',
      objectFit: 'contain'
    }
  }
})

const onSavedLinkImageLoad = (event, link) => {
  const img = event.target
  savedLinkImages.value[link.id] = {
    width: img.naturalWidth,
    height: img.naturalHeight,
    isLogo: img.naturalWidth <= 200 && img.naturalHeight <= 200
  }
}

const getImageStyle = (link) => {
  const imgData = savedLinkImages.value[link.id]
  if (!imgData) return {}

  const maxWidth = 600
  const maxHeight = 200

  if (imgData.isLogo) {
    return {
      width: '64px',
      height: '64px',
      objectFit: 'contain'
    }
  }

  if (imgData.width <= maxWidth && imgData.height <= maxHeight) {
    return {
      width: `${imgData.width}px`,
      height: `${imgData.height}px`
    }
  }

  const aspectRatio = imgData.width / imgData.height

  if (aspectRatio > maxWidth / maxHeight) {
    return {
      width: '100%',
      height: 'auto',
      maxHeight: `${maxHeight}px`,
      objectFit: 'contain'
    }
  } else {
    return {
      width: 'auto',
      height: `${maxHeight}px`,
      maxWidth: '100%',
      objectFit: 'contain'
    }
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  })
}

const toggleLayoutModal = () => {
  showLayoutModal.value = !showLayoutModal.value
}

const closeLayoutModal = () => {
  showLayoutModal.value = false
}

const editLink = (link) => {
  editingLink.value = { 
    ...link, 
    id: link.id || null,  // Use null for new links
    collection_ids: selectedCollectionIds.value 
  }
}

const handlePaste = async () => {
  try {
    const text = await navigator.clipboard.readText()
    url.value = text
    await fetchMetadata()
  } catch (err) {
    console.error('Failed to read clipboard contents: ', err)
    error.value = 'Failed to paste URL'
  }
}

const clearUrl = () => {
  url.value = ''
  metadata.value = null
  error.value = null
}

const startEditingTitle = () => {
  editingTitle.value = true
  editedTitle.value = metadata.value.title
}

const updateTitle = () => {
  if (editedTitle.value.trim() !== '') {
    metadata.value.title = editedTitle.value.trim()
    editingTitle.value = false
  }
}

const cancelEditTitle = () => {
  editingTitle.value = false
  editedTitle.value = metadata.value.title
}

const setLayout = (layout) => {
  currentLayout.value = layout
  showLayoutModal.value = false
}

const getCollectionName = (collectionId) => {
  const collection = collections.value.find(c => c.id === collectionId)
  return collection ? collection.name : 'Unknown'
}

const getCollectionDescription = (collectionId) => {
  const collection = collections.value.find(c => c.id === collectionId)
  return collection ? collection.description : ''
}

const selectCollection = (collectionId) => {
  selectedCollectionId.value = collectionId
}

const filteredAndSearchedLinks = computed(() => {
  let links = savedLinks.value
  if (selectedCollectionId.value !== null) {
    links = links.filter(link => link.collection_ids.includes(selectedCollectionId.value))
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    links = links.filter(link => 
      (link.title && link.title.toLowerCase().includes(query)) ||
      link.link.toLowerCase().includes(query) ||
      (link.description && link.description.toLowerCase().includes(query)) ||
      (link.notes && link.notes.toLowerCase().includes(query))
    )
  }
  return links
})

const sortedAndFilteredLinks = computed(() => {
  let links = filteredAndSearchedLinks.value
  return links.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

definePageMeta({
  colorMode: "light", // or 'dark'
});


const accessToken = ref(null);

const fetchAccessToken = () => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('access_token'))
    ?.split('=')[1];

  if (token) {
    accessToken.value = token;
  } else {
    console.error('Access token not found in cookies');
  }
};

const urlInputRef = ref(null)

const simulatePasteClick = async () => {
  try {
    await handlePaste()
  } catch (err) {
    console.error('Failed to simulate paste:', err)
  }
}

const focusUrlInput = () => {
  if (urlInputRef.value) {
    urlInputRef.value.focus()
  }
}

onMounted(() => {
  fetchUserData()
  fetchAccessToken()
  simulatePasteClick()
  focusUrlInput()
})



const deleteLink = async (linkId) => {
  try {
    await makeAuthenticatedRequest(async (token) => {
      await axios.delete(`${config.public.API_BASE_URL}/delete_link`, {
        data: { link: linkId },
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
    });
    // Remove the deleted link from the local state
    savedLinks.value = savedLinks.value.filter(link => link.id !== linkId);
  } catch (error) {
    console.error("An error occurred while deleting the link: ", error);
    this.error = "Failed to delete the link. Please try again.";
  }
};



const showDeleteModal = ref(false);
const linkToDelete = ref(null);




const openDeleteModal = (link) => {
  linkToDelete.value = link;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  linkToDelete.value = null;
};

const confirmDelete = async () => {
  if (linkToDelete.value) {
    await deleteLink(linkToDelete.value.id);
    closeDeleteModal();
  }
};

</script>

<style scoped>
.image-container {
  position: relative;
  overflow: hidden;
}

.image-container img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 100%;
  max-height: 100%;
}

.masonry-grid {
  column-count: 1;
  column-gap: 1rem;
}



.masonry-item {
  break-inside: avoid;
  margin-bottom: 1rem;
}


.face {
  width: 60px; /* Reduced size of the profile picture */
  height: auto;
  border-radius: 50%;
  overflow: hidden;
  position: absolute;
}


.auth-container {
  position: relative;

}

.google-signup-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin-top:15px;
  margin-bottom:15px;
}



.face {

  top: -70px;
  right: 20px;
}


.grid-cols-auto-fit {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.max-w-sm {
  max-width: 24rem;
}

@media (min-width: 640px) {
  .masonry-grid {
    column-count: 2;
  }
}

@media (min-width: 1024px) {
  .masonry-grid {
    column-count: 3;
  }
}

</style>
