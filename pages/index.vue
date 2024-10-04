<template>
  <div class="flex flex-col min-h-screen dark:bg-gray-900 dark:text-white">
    <!-- Main content wrapper -->
    <div class="container mx-auto p-4 max-w-full dark:bg-gray-800">
      <!-- Header Section -->
      <div 
        class="flex items-center justify-center space-x-4 mb-5" 
        :class="{ 'logoandname': !!accessToken }"
      >
        <img src="/img/save.png" class="w-12 h-auto">

        <a href="https://savesuggest.com" >
        <h1 class="text-4xl font-extrabold text-[#1A2421] dark:text-white">Save Suggest</h1> </a>
      </div>

      <!-- Mild Paragraph Explaining the App with Dark Mode Toggle -->
      <div class="flex items-center justify-center space-x-4">
        <p class="text-center text-gray-600 dark:text-gray-300">
          Save your links and revisit them anytime.
        </p>
        <!-- Dark Mode Toggle with Tooltip -->
        <button 
          @click="toggleDarkMode" 
          class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          title="Toggle Dark Mode"
        >
          <Sun v-if="isDarkMode" class="w-5 h-5 text-yellow-500" />
          <Moon v-else class="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <div class="auth-container">
        <div class="google-signup-wrapper">
          <google_signup v-if="!accessToken" class="google-signup" />
        </div>
        <face3 v-if="accessToken" class="face" />
      </div>

      <!-- Paste URL Bar -->
      <div class="mb-6 flex justify-center">
        <div class="relative w-full max-w-lg">
          <input 
            ref="urlInputRef"
            v-model="url"
            type="text" 
            placeholder="Paste URL" 
            class="w-full p-3 pr-24 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            @keydown="handleKeydown"
          />
          <button 
            @click="url ? clearUrl() : handlePaste()"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {{ url ? 'Clear' : '📋 Paste' }}
          </button>
        </div>
      </div>

      <!-- Loading, Error, and Success Messages -->
      <div v-if="loading" class="mb-4 text-center text-gray-600">Loading preview, please wait...</div>
      <!-- Error Message with Close Icon -->
      <div v-if="error" class="mb-4 text-red-500 text-center flex justify-center items-center">
        <span>{{ error }}</span>
        <button @click="error = null" class="ml-2" title="Dismiss">
          <X class="w-4 h-4" />
        </button>
      </div>
      <div v-if="linkSaved" class="mb-4 text-green-500 text-center">Link saved successfully!</div>

      <!-- Preview Section -->
      <div v-if="url" class="mb-6 flex justify-center">
        <div class="w-full max-w-lg border rounded-lg p-4 shadow-md dark:bg-gray-800 dark:border-gray-700">
          <div v-if="!metadata && !loading" class="mb-4 text-yellow-500 text-center dark:text-yellow-400">
            You can still save this link.
          </div>
          <div class="mb-3 flex items-center justify-between">
            <h2 v-if="!editingTitle" class="font-bold text-xl dark:text-white">
              {{ metadata?.title || url }}
            </h2>
            <button @click="startEditingTitle" v-if="!editingTitle" class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300" title="Edit Title">
              <Pencil class="w-5 h-5" />
            </button>
          </div>
          <div v-if="editingTitle" class="mb-3">
            <input 
              v-model="editedTitle" 
              type="text" 
              class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              @keyup.enter="updateTitle"
            />
            <div class="mt-2">
              <button @click="updateTitle" class="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 mr-2 dark:bg-green-600 dark:hover:bg-green-700">
                OK
              </button>
              <button @click="cancelEditTitle" class="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">
                Cancel
              </button>
            </div>
          </div>
          <p v-if="metadata && metadata.description" class="text-gray-600 mb-3 dark:text-gray-300">{{ truncateText(metadata.description, 150) }}</p>

          <!-- Add the link display here -->
          <a :href="url" target="_blank" rel="noopener noreferrer" class="block mb-3 text-blue-500 hover:underline break-all dark:text-blue-400">
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
            <h3 class="font-bold mb-2 dark:text-white">Add to Collections:</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="collection in collections"
                :key="collection.id"
                @click="toggleCollectionSelection(collection.id)"
                class="px-3 py-1 rounded-full transition duration-200 flex items-center"
                :class="[
                  selectedCollectionIds.includes(collection.id) 
                    ? 'bg-blue-500 text-white dark:bg-blue-600' 
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                ]"
              >
                {{ collection.name }}
                <span v-if="selectedCollectionIds.includes(collection.id)" class="ml-1">✓</span>
                <span v-else class="ml-1">+</span>
              </button>
              <button 
                @click="showNewCollectionForm = true" 
                class="px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition duration-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                title="Create New Collection"
              >
                + New
              </button>
            </div>
          </div>
          <textarea 
            v-model="notes" 
            placeholder="Add notes (optional)" 
            class="w-full p-2 mb-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows="1"
          ></textarea>
          <button 
            @click="saveLink"
            :disabled="saving"
            class="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-200 disabled:bg-gray-400 dark:bg-green-600 dark:hover:bg-green-700"
          >
            {{ saving ? 'Saving...' : 'Save Link' }}
          </button>
        </div>
      </div>

      <!-- Collections Filter -->
      <div class="mb-6 text-center">
        <div class="flex flex-wrap justify-center gap-2 mb-3">
          <button
            @click="selectCollection(null)"
            :class="['px-4 py-2 rounded-full transition duration-200 font-medium', 
                     selectedCollectionId === null 
                     ? 'bg-blue-500 text-white dark:bg-blue-600' 
                     : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white']"
          >
            All Links
          </button>
          
          <button
            v-for="collection in collections"
            :key="collection.id"
            @click="selectCollection(collection.id)"
            :class="['px-4 py-2 rounded-full transition duration-200 font-medium', 
                     selectedCollectionId === collection.id 
                     ? 'bg-blue-500 text-white dark:bg-blue-600' 
                     : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white']"
          >
            {{ collection.name }}
          </button>
          <button 
            @click="showNewCollectionForm = true" 
            class="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition duration-200 font-medium dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            title="Create New Collection"
          >
            + New Collection
          </button>
        </div>

        <p v-if="selectedCollectionId" class="text-gray-600 dark:text-gray-300 mb-3">{{ getCollectionDescription(selectedCollectionId) }}</p>
      </div>

      <!-- New Collection Modal -->
      <div v-if="showNewCollectionForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showNewCollectionForm = false">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full relative">
          <button @click="showNewCollectionForm = false" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" title="Close">
            <X class="w-6 h-6" />
          </button>
          <h3 class="text-lg font-bold mb-3 dark:text-white">Create New Collection</h3>
          <input v-model="newCollection.name" type="text" placeholder="Collection Name" class="w-full p-2 mb-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          <input v-model="newCollection.description" type="text" placeholder="Description (optional)" class="w-full p-2 mb-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          <div class="flex justify-end">
            <button @click="createNewCollection" :disabled="creatingCollection" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 disabled:bg-gray-400 dark:bg-blue-600 dark:hover:bg-blue-700">
              {{ creatingCollection ? 'Creating...' : 'Create' }}
            </button>
            <button @click="showNewCollectionForm = false" class="px-4 py-2 ml-2 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Saved Links Section -->
      <div class="max-w-5xl mx-auto w-full">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-4">
            <h2 class="text-2xl font-bold dark:text-white savedlink">{{ 'Saved Links' }}</h2>
   
    <!-- Search Input and Icons -->
<div class="relative flex items-center">
  <input 
    v-model="searchQuery"
    type="text" 
    placeholder="Search links"
    class="pl-8 pr-4 py-2 text-sm bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-0 focus:border-gray-300 transition-all duration-300 ease-in-out dark:bg-gray-700 dark:border-gray-600 dark:text-white"
  />
  <span class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </span>
  
  <!-- Icons displayed when a collection is selected -->
  <div v-if="selectedCollectionId" class="flex items-center ml-2">
    <!-- Edit Icon -->
    <button @click="openEditCollectionModal" class="text-gray-500 hover:text-gray-700 mr-2" title="Edit Collection">
      <Pencil class="w-5 h-5" />
    </button>
    <!-- Share Icon -->
    <button @click="copyShareLink" class="text-gray-500 hover:text-gray-700" title="Share Collection">
      <Share2 class="w-5 h-5" />
    </button>
  </div>
</div>

          </div>
          <!-- Layout Toggle Button -->
          <div class="relative">
            <button @click="toggleLayoutModal" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200" title="Change Layout">
              <LayoutGrid class="w-5 h-5 dark:text-white" />
            </button>
            <div v-if="showLayoutModal" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div class="p-2">
                <button @click="setLayout('list')" class="w-full p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md dark:text-white">
                  <List class="w-5 h-5 inline-block mr-2" /> List View
                </button>
                <button @click="setLayout('grid')" class="w-full p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md dark:text-white">
                  <Grid class="w-5 h-5 inline-block mr-2" /> Grid View
                </button>
                <button @click="setLayout('masonry')" class="w-full p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md dark:text-white">
                  <LayoutGrid class="w-5 h-5 inline-block mr-2" /> Masonry View
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Saved Links List -->
        <div :class="{
        'grid gap-4': currentLayout === 'grid' || (currentLayout === 'masonry' && filteredAndSearchedLinks.length === 1),
        'grid-cols-auto-fit': currentLayout === 'grid' || (currentLayout === 'masonry' && filteredAndSearchedLinks.length === 1),
        'space-y-4': currentLayout === 'list',
        'masonry-grid': currentLayout === 'masonry' && filteredAndSearchedLinks.length > 1
      }">
    <div v-for="link in sortedAndFilteredLinks" :key="link.id" 
         :class="{
           'mb-4 p-4 border rounded-lg shadow-md dark:bg-gray-700 dark:border-gray-600': true, 
           'masonry-item': currentLayout === 'masonry' && filteredAndSearchedLinks.length > 1,
           'max-w-sm mx-auto': filteredAndSearchedLinks.length === 1
         }">
            <!-- Image -->
            <img 
        v-if="link.img && currentLayout !== 'list'" 
        :src="link.img" 
        :alt="link.title"
        class="w-full h-48 object-cover mb-4 rounded-md cursor-pointer"
        @click="openImageModal(link.img)"
      />

            <!-- Link Title with Arrow and Hover Tooltip -->
            <div class="flex justify-between items-start mb-2">
       <!-- Link Title with Link Icon and Clickable -->
<!-- Link Title -->
<h3 v-if="link.title" class="font-bold text-lg cursor-pointer hover:text-blue-500" @click="openLink(link.link)">
  {{ link.title }}
</h3>

              <div>
                <button @click="editLink(link)" class="text-blue-500 hover:text-blue-600 mr-2" title="Edit Link">
                  <Pencil class="w-5 h-5" />
                </button>
                <button @click="openDeleteModal(link)" class="text-red-500 hover:text-red-600" title="Delete Link">
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Description -->
            <p v-if="link.description" class="text-gray-600 dark:text-gray-300 mb-2">{{ truncateText(link.description, 100) }}</p>

            <!-- Notes -->
            <p v-if="link.notes" class="text-gray-700 dark:text-gray-300 font-medium mb-2 border border-gray-300 dark:border-gray-600 rounded-md p-1 flex items-center">
              <FileText class="w-4 h-4 mr-2" /> {{ truncateText(link.notes, 100) }}
            </p>

            <!-- Image for List View -->
            <img 
              v-if="link.img && currentLayout === 'list'" 
              :src="link.img" 
              :alt="link.title"
              :style="getImageStyle(link)"
              class="rounded-md mb-2 cursor-pointer" 
              @click="openImageModal(link.img)"
              @load="(event) => onSavedLinkImageLoad(event, link)"
            />


<!-- Date, Collection Badges, Link Icon with Popover, and Copy Link Button -->
<div class="flex items-center justify-between mb-2">
  <div class="flex items-center gap-2">
    <p class="text-sm text-gray-500">{{ formatDate(link.created_at) }}</p>
    <div class="flex flex-wrap gap-1">
      <span 
        v-for="collectionId in link.collection_ids" 
        :key="collectionId" 
        class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200 border border-gray-300 dark:border-gray-600"
        @click="selectCollection(collectionId)"
      >
        {{ getCollectionName(collectionId) }}
      </span>
    </div>
  </div>

  <div class="flex items-center">
    <!-- Link Icon with Popover -->
    <div class="relative mr-2">
      <button 
        class="text-gray-500 hover:text-gray-700" 
        title="View Link"
        @mouseenter="showPopover = link.id"
        @mouseleave="showPopover = null"
      >
        <Link class="w-5 h-5" />
      </button>
      <!-- Popover with URL -->
      <div 
        v-if="showPopover === link.id"
        class="absolute right-0 top-full mt-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-md shadow-lg z-10 text-sm max-w-xs break-words"
        @mouseenter="showPopover = link.id"
        @mouseleave="showPopover = null"
      >
        {{ link.link }}
      </div>
    </div>
    <!-- Copy Link Button -->
    <button @click="copyLink(link.link)" class="text-gray-500 hover:text-gray-700" title="Copy Link">
      <Copy class="w-4 h-4" />
    </button>
  </div>
</div>



          </div>
        </div>
      </div>

      <!-- Edit Link Modal -->
      <div v-if="editingLink" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="cancelEdit">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full">
          <h2 class="text-2xl font-bold mb-4 dark:text-white">Edit Link</h2>
          <input v-model="editingLink.title" class="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="Title" />
          <input v-model="editingLink.link" class="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="URL" />
          <textarea v-model="editingLink.description" class="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="Description" rows="3"></textarea>
          <textarea v-model="editingLink.notes" class="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="Notes" rows="3"></textarea>
          
          <!-- Collection Selection -->
          <div class="mb-3">
            <h3 class="font-bold mb-2 dark:text-white">Collections:</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="collection in collections"
                :key="collection.id"
                @click="toggleCollectionSelection(collection.id)"
                class="px-3 py-1 rounded-full transition duration-200 flex items-center"
                :class="[
                  selectedCollectionIds.includes(collection.id) 
                    ? 'bg-blue-500 text-white dark:bg-blue-600' 
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                ]"
              >
                {{ collection.name }}
                <span v-if="selectedCollectionIds.includes(collection.id)" class="ml-1">✓</span>
                <span v-else class="ml-1">+</span>
              </button>
            </div>
          </div>

          <div class="flex justify-end">
            <button @click="updateLink" :disabled="saving" class="px-4 py-2 bg-blue-500 text-white rounded mr-2 disabled:bg-gray-400 dark:bg-blue-600 dark:disabled:bg-gray-600">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
            <button @click="cancelEdit" class="px-4 py-2 bg-gray-300 rounded dark:bg-gray-600 dark:text-white">Cancel</button>
          </div>
        </div>
      </div>

  <!-- Image Modal -->
  <div v-if="selectedImage" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" @click.self="selectedImage = null">
    <img :src="selectedImage" alt="Full size image" class="max-w-full max-h-full object-contain rounded-md shadow-lg" />
    <button @click="selectedImage = null" class="absolute top-4 right-4 text-white hover:text-gray-300">
      <X class="w-6 h-6" />
    </button>
  </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full relative">
        <h2 class="text-2xl font-bold mb-4 dark:text-white">Delete Link</h2>
        <p class="mb-4 dark:text-gray-300">Are you sure you want to delete this link?</p>
        <div class="flex justify-end">
          <button @click="confirmDelete" class="px-4 py-2 bg-red-500 text-white rounded mr-2 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700">
            Yes, Delete
          </button>
          <button @click="closeDeleteModal" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">
            Cancel
          </button>
        </div>
        <button @click="closeDeleteModal" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" title="Close">
          <X class="w-6 h-6" />
        </button>
      </div>
    </div>

    <footer class="mt-auto py-6 bg-gray-100 dark:bg-gray-800">
      <div class="container mx-auto px-4">
        <div class="text-center text-gray-600 dark:text-gray-300 text-sm md:text-base">
          <p class="mb-2">For feedback and other inquiries, please contact:</p>
          <a href="mailto:yethuku13@gmail.com" class="text-blue-500 hover:underline dark:text-blue-400">yethuku13@gmail.com</a>
        </div>
      </div>
    </footer>
  </div>

  <!-- Notification -->
  <div v-if="notification.show" class="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg">
    {{ notification.message }}
  </div>




  <!-- Edit Collection Modal -->
<div v-if="isEditCollectionModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeEditCollectionModal">
  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full relative">
    <button @click="closeEditCollectionModal" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" title="Close">
      <X class="w-6 h-6" />
    </button>
    <h3 class="text-lg font-bold mb-3 dark:text-white">Edit Collection</h3>
    <input v-model="editCollectionData.name" type="text" placeholder="Collection Name" class="w-full p-2 mb-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
    <input v-model="editCollectionData.description" type="text" placeholder="Description" class="w-full p-2 mb-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
    <!-- Optional Image URL Field -->
    <input v-model="editCollectionData.img_url" type="text" placeholder="Image URL (optional)" class="w-full p-2 mb-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
    <div class="flex justify-between items-center">
      <button @click="deleteCollection" class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200 dark:bg-red-600 dark:hover:bg-red-700">
        Delete Collection
      </button>
      <div>
        <button @click="updateCollection" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 dark:bg-blue-600 dark:hover:bg-blue-700 mr-2">
          Update
        </button>
        <button @click="closeEditCollectionModal" class="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition duration-200 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>

</div>




</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { 
  LayoutGrid, List, Grid, Pencil, Trash2, X, Copy, FileText, Sun, Moon, ArrowRight ,Link, Share2
} from 'lucide-vue-next';


const loading = ref(false);
const error = ref(null);
const collections = ref([]);
const selectedCollectionIds = ref([]);
const showNewCollectionForm = ref(false);
const newCollection = ref({ name: '', description: '' });
const savedLinks = ref([]);
const notes = ref('');
const saving = ref(false);
const creatingCollection = ref(false);
const editingTitle = ref(false);
const editedTitle = ref('');
const searchQuery = ref('');

const linkSaved = ref(false);
const editingLink = ref(null);
const imageAspectRatio = ref(1);
const isLogo = ref(false);
const imageWidth = ref(0);
const imageHeight = ref(0);
const imageLoaded = ref(false);
const savedLinkImages = ref({});
const currentLayout = ref('masonry');
const selectedCollectionId = ref(null);
const showLayoutModal = ref(false);
const notification = ref({ show: false, message: '' });
const accessToken = ref(null);
const urlInputRef = ref(null);
const isDarkMode = ref(false);
const showDeleteModal = ref(false);
const linkToDelete = ref(null);

const config = useRuntimeConfig();




const openLink = (url) => {
  window.open(url, '_blank');
};

const showPopover = ref({});

const handleMouseEnter = (linkId) => {
  showPopover.value[linkId] = true;
};

const handleMouseLeave = (linkId) => {
  showPopover.value[linkId] = false;
};

// Import and use the font
useHead({
  htmlAttrs: {
    lang: 'en'
  },
  title: 'SaveSuggest - Save your links and revisit them anytime.',
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
  ],
  meta: [
    { name: 'description', content: 'Discover a smarter way to save, organize, and share your links with SaveSuggest. Create personalized collections, preview content, and share with friends. Start organizing today!' },
    { property: 'og:title', content: 'SaveSuggest - Save your links and revisit them anytime.' },
    { property: 'og:description', content: 'Easily save and manage links, create collections, and share previews with others. Join SaveSuggest and take control of your online content today!' },
    { property: 'og:image', content: '/img/save_preview_1.png' },
    { property: 'og:url', content: 'https://savesuggest.com' },
    { name: 'twitter:title', content: 'SaveSuggest - Save your links and revisit them anytime.' },
    { name: 'twitter:description', content: 'Organize, and share links effortlessly. Create collections and see link previews with SaveSuggest. Start organizing your digital life today!' },
    { name: 'twitter:image', content: '/img/save_preview_1.png' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ]
});

// Rest of your script remains the same

// Fetch Access Token
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

// Function to get Token
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
};

// Make Authenticated Request
const makeAuthenticatedRequest = async (requestFunction) => {
  const token = getToken()
  if (!token) {
    throw new Error("No authentication token available")
  }
  return requestFunction(token)
};

// Fetch Metadata
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
};

// Handle Keydown
const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    fetchMetadata();
  }
};




const url = ref('');
const metadata = ref(null);
// ... existing code ...

const selectedImage = ref(null);

const openImageModal = (imageUrl) => {
  selectedImage.value = imageUrl;
};


// Save Link
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
  } catch (err) {
    console.error("An error occurred while saving the link: ", err)
    error.value = "Failed to save the link. Please try again."
  } finally {
    saving.value = false
  }
};

// Fetch User Data
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
  } catch (err) {
    console.error("An error occurred while fetching user data: ", err)
    if (err.response) {
      console.error("Response data:", err.response.data)
      console.error("Response status:", err.response.status)
      console.error("Response headers:", err.response.headers)
    }
    error.value = "Failed to fetch user data. Please refresh the page."
  }
};

// Create New Collection
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
  } catch (err) {
    console.error("An error occurred while creating a new collection: ", err)
    error.value = "Failed to create a new collection. Please try again."
  } finally {
    creatingCollection.value = false
  }
};

// Truncate Text
const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength
    ? text.slice(0, maxLength) + '...'
    : text
};


// Toggle Collection Selection
const toggleCollectionSelection = (collectionId) => {
  const index = selectedCollectionIds.value.indexOf(collectionId)
  if (index === -1) {
    selectedCollectionIds.value.push(collectionId)
  } else {
    selectedCollectionIds.value.splice(index, 1)
  }
};

// Filtered Links
const filteredLinks = computed(() => {
  if (selectedCollectionId.value === null) {
    return savedLinks.value
  }
  return savedLinks.value.filter(link => 
    link.collection_ids.includes(selectedCollectionId.value)
  )
});

// Update Link
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
  } catch (err) {
    console.error("An error occurred while updating the link: ", err)
    error.value = "Failed to update the link. Please try again."
  } finally {
    saving.value = false
  }
};

// Cancel Edit
const cancelEdit = () => {
  editingLink.value = null
  selectedCollectionIds.value = []
};

// On Image Load
const onImageLoad = (event) => {
  const img = event.target
  imageWidth.value = img.naturalWidth
  imageHeight.value = img.naturalHeight
  imageLoaded.value = true
  imageAspectRatio.value = img.naturalWidth / img.naturalHeight
  isLogo.value = img.naturalWidth <= 200 && img.naturalHeight <= 200
};

// Image Display Style
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
});

// On Saved Link Image Load
const onSavedLinkImageLoad = (event, link) => {
  const img = event.target
  savedLinkImages.value[link.id] = {
    width: img.naturalWidth,
    height: img.naturalHeight,
    isLogo: img.naturalWidth <= 200 && img.naturalHeight <= 200
  }
};

// Get Image Style
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
};

// Format Date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  })
};

// Toggle Layout Modal
const toggleLayoutModal = () => {
  showLayoutModal.value = !showLayoutModal.value
};

// Close Layout Modal
const closeLayoutModal = () => {
  showLayoutModal.value = false
};

// Edit Link
const editLink = (link) => {
  editingLink.value = { 
    ...link, 
    id: link.id || null,  // Use null for new links
    collection_ids: selectedCollectionIds.value 
  }
};

// Handle Paste
const handlePaste = async () => {
  try {
    const text = await navigator.clipboard.readText()
    url.value = text
    await fetchMetadata()
  } catch (err) {
    console.error('Failed to read clipboard contents: ', err)
    error.value = 'Failed to paste URL'
  }
};

// Clear URL
const clearUrl = () => {
  url.value = ''
  metadata.value = null
  error.value = null
};

// Start Editing Title
const startEditingTitle = () => {
  editingTitle.value = true;
  editedTitle.value = metadata.value?.title || url.value;
};

// Update Title
const updateTitle = () => {
  if (editedTitle.value.trim() !== '') {
    if (metadata.value) {
      metadata.value.title = editedTitle.value.trim();
    } else {
      metadata.value = { title: editedTitle.value.trim() };
    }
    editingTitle.value = false;
  }
};

// Cancel Edit Title
const cancelEditTitle = () => {
  editingTitle.value = false;
  editedTitle.value = metadata.value?.title || url.value;
};

// Set Layout
const setLayout = (layout) => {
  currentLayout.value = layout
  showLayoutModal.value = false
};

// Get Collection Name
const getCollectionName = (collectionId) => {
  const collection = collections.value.find(c => c.id === collectionId)
  return collection ? collection.name : 'Unknown'
};

// Get Collection Description
const getCollectionDescription = (collectionId) => {
  const collection = collections.value.find(c => c.id === collectionId)
  return collection ? collection.description : ''
};

// Select Collection
const selectCollection = (collectionId) => {
  selectedCollectionId.value = collectionId
};

// Filtered and Searched Links
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
});

// Sorted and Filtered Links
const sortedAndFilteredLinks = computed(() => {
  let links = filteredAndSearchedLinks.value
  return links.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
});

// Copy Link
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
};

// Simulate Paste Click
const simulatePasteClick = async () => {
  try {
    await handlePaste()
  } catch (err) {
    console.error('Failed to simulate paste:', err)
  }
};

// Focus URL Input
const focusUrlInput = () => {
  if (urlInputRef.value) {
    urlInputRef.value.focus()
  }
};

// Delete Link
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
  } catch (err) {
    console.error("An error occurred while deleting the link: ", err);
    error.value = "Failed to delete the link. Please try again.";
  }
};

// Open Delete Modal
const openDeleteModal = (link) => {
  linkToDelete.value = link;
  showDeleteModal.value = true;
};

// Close Delete Modal
const closeDeleteModal = () => {
  showDeleteModal.value = false;
  linkToDelete.value = null;
};

// Confirm Delete
const confirmDelete = async () => {
  if (linkToDelete.value) {
    await deleteLink(linkToDelete.value.id);
    closeDeleteModal();
  }
};

// Toggle Dark Mode
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
};






const isEditCollectionModalOpen = ref(false);
const editCollectionData = ref({
  id: null,
  name: '',
  description: '',
  img_url: '',
});

// Open the edit collection modal
const openEditCollectionModal = () => {
  const collection = collections.value.find(c => c.id === selectedCollectionId.value);
  if (collection) {
    editCollectionData.value = { ...collection };
    isEditCollectionModalOpen.value = true;
  }
};

// Close the edit collection modal
const closeEditCollectionModal = () => {
  isEditCollectionModalOpen.value = false;
  editCollectionData.value = {
    id: null,
    name: '',
    description: '',
    img_url: '',
  };
};

// Update the collection using the API
const updateCollection = async () => {
  try {
    await makeAuthenticatedRequest(async (token) => {
      await axios.post(`${config.public.API_BASE_URL}/update_collection`, {
        collection_id: editCollectionData.value.id,
        name: editCollectionData.value.name,
        description: editCollectionData.value.description,
        img_url: editCollectionData.value.img_url,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
    });
    // Refresh the collections list
    await fetchUserData();
    closeEditCollectionModal();
  } catch (error) {
    console.error("An error occurred while updating the collection: ", error);
    error.value = "Failed to update the collection. Please try again.";
  }
};

// Delete the collection using the API
const deleteCollection = async () => {
  try {
    await makeAuthenticatedRequest(async (token) => {
      await axios.delete(`${config.public.API_BASE_URL}/delete_collection`, {
        data: { collection_id: editCollectionData.value.id },
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
    });
    // Refresh the collections list and reset the selected collection
    selectedCollectionId.value = null;
    await fetchUserData();
    closeEditCollectionModal();
  } catch (error) {
    console.error("An error occurred while deleting the collection: ", error);
    error.value = "Failed to delete the collection. Please try again.";
  }
};

// Copy the share link to the clipboard
const copyShareLink = async () => {
  const shareUrl = `${window.location.origin}/collection/${selectedCollectionId.value}`;
  try {
    await navigator.clipboard.writeText(shareUrl);
    notification.value = { show: true, message: 'Share link copied to clipboard' };
    setTimeout(() => {
      notification.value.show = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy share link: ', err);
    notification.value = { show: true, message: 'Failed to copy share link' };
    setTimeout(() => {
      notification.value.show = false;
    }, 2000);
  }
};




















// On Mounted
onMounted(() => {
  fetchUserData()
  fetchAccessToken()
  simulatePasteClick()
  focusUrlInput()
});
</script>

<style>
body {
  font-family: 'Poppins', sans-serif;
}

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
  width: 60px;
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
  margin-top: 15px;
  margin-bottom: 15px;
}

.face {
  top: -70px;
  right: 20px;
}

@media (max-width: 600px) {
  .face {
    top: -140px;
    right: -15px;
    transform: scale(0.8);
    width: 70px;
  }

  .savedlink {
    font-size: 20px;
  }

  .logoandname {
    margin-left: -45px;
  }
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
