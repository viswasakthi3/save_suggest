<template>
    <div class="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">Latest Film Industry News</h1>
        <div v-for="news in newsData" :key="news.id" class="bg-white rounded-lg shadow-lg overflow-hidden mb-8 transition-all duration-300 hover:shadow-xl">
          <!-- Image and Content Wrapper -->
          <div class="flex flex-col md:flex-row">
            <!-- Image Section -->
            <div class="md:w-1/4 h-40 md:h-auto relative overflow-hidden rounded-lg">
  <!-- Image Section -->
  <img :src="news.imageurl" :alt="news.title" class="w-full h-full object-cover transition-transform duration-300 hover:scale-110 rounded-lg" />
  
  <!-- Full-width Dark Gradient at the Bottom -->
  <div class="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/70 to-transparent"></div>
  
  <!-- Industry Label on the Image at the Bottom-Right Corner -->
  <div class="absolute bottom-2 right-2 bg-black/75 text-white text-sm px-2 py-1 rounded-lg">
    <!-- <p class="font-semibold">{{ news.film_industry }}</p> -->
  </div>
</div>



  
            <!-- Content Section -->
            <div class="md:w-3/4 p-4 flex flex-col justify-between">
              <div>
                <h2 class="text-xl font-bold mb-2 text-gray-800 line-clamp-2">{{ news.title }}</h2>
                <p class="text-gray-600 mb-4 line-clamp-3">{{ news.summary }}</p>
              </div>
              <!-- Publication Info and Tags -->
              <div class="flex items-center justify-between text-base text-gray-700 mb-4">
                <div class="flex items-center">
                  <Clock class="w-5 h-5 mr-2" />
                  <span>{{ formatDate(news.publication_timestamp) }} | {{ news.source_name }} |</span>
                  <!-- Badge for Tags (Person Name, Movie, or TV Show) -->
                  <span class="ml-2 px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs">{{ news.tag }}</span>
                </div>
              </div>
              <!-- Action Buttons -->
              <div class="flex justify-between items-center">
                <div class="flex space-x-4">
                  <button class="flex items-center text-gray-600 hover:text-red-500 transition-colors duration-200">
                    <Heart class="w-5 h-5 mr-2" />
                    <span>Like</span>
                  </button>
                  <button class="flex items-center text-gray-600 hover:text-blue-500 transition-colors duration-200">
                    <MessageCircle class="w-5 h-5 mr-2" />
                    <span>{{ news.comments_count }} Comments</span>
                  </button>
                  <button class="flex items-center text-gray-600 hover:text-green-500 transition-colors duration-200">
                    <Share2 class="w-5 h-5 mr-2" />
                    <span>Share</span>
                  </button>
                </div>
                <div class="flex items-center text-gray-600">
                  <Eye class="w-5 h-5 mr-2" />
                  <span>1.2K views</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // Imports
  import { ref } from 'vue';
  import { Heart, MessageCircle, Share2, Eye, Clock } from 'lucide-vue-next';
  
  // Dummy data stored within the component
  const newsData = ref([
    {
      article_link: 'https://www.filmibeat.com/tamil/news/2024/bigg-boss-tamil-8-contestant-will-cooku-with-comali-star-participate-in-vijay-sethupathi-show-417721.html',
      film_industry: 'Kollywood',
      id: 27632,
      imageurl: 'https://images.filmibeat.com/webp/img/2024/09/featurebiggbosstamil81-1726239527.jpg',
      publication_timestamp: 'Fri, 13 Sep 2024 15:00:16 GMT',
      source_name: 'filmibeat.com',
      summary: "Bigg Boss Tamil 8 Contestant List: As per latest buzz, this popular Tamil cooking show Cooku With Comali 5 has been approached to participate in Vijay Sethupathi's show.",
      title: "Bigg Boss Tamil 8 Contestant: THIS Cooku With Comali Star To Participate In Vijay Sethupathi's Show?",
      comments_count: 42,
      tag: "Cooku With Comali",
    },
    {
      article_link: 'https://www.filmibeat.com/tamil/news/2024/thangalaan-hindi-chiyaan-vikrams-film-to-become-a-hit-in-hindi-markets-after-increase-in-screens-011-417703.html',
      film_industry: 'Kollywood',
      id: 27633,
      imageurl: 'https://images.filmibeat.com/webp/img/2024/09/thangalaanf-min-1726238327.jpg',
      publication_timestamp: 'Fri, 13 Sep 2024 14:39:22 GMT',
      source_name: 'filmibeat.com',
      summary: "Thangalaan captivates audiences with its Hindi release, seeing a surge in demand and screen count, showcasing the film's cross-regional success.",
      title: "Thangalaan Hindi: Chiyaan Vikram's Film To Become A Hit In Hindi Markets After IncreaseSampl In Screens",
      comments_count: 0,
      tag: "Thangalaan",
    },
  ]);
  
  // Date formatting function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).replace(/ /g, ' ');
  };
  </script>
  
  <style scoped>
  /* Additional styles if needed */
  </style>


