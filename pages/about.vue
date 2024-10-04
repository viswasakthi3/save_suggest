<template>
    <div class="flex flex-col min-h-screen bg-gradient-to-r from-pink-50 via-blue-50 to-purple-50 dark:bg-gray-900 dark:text-white">
      <!-- Header -->
      <header class="container mx-auto p-4">
        <!-- Centered Logo and Title -->
        <div class="flex flex-col items-center justify-center mb-8">
          <img src="/img/save.png" class="w-20 h-auto mb-4" alt="Logo">
          <h1 class="text-5xl font-extrabold text-purple-700 dark:text-white mb-2">Your Link-Saving Companion</h1>
          <p class="text-center text-gray-700 dark:text-gray-300">
            Collect, Organize, Share – It's all here.
          </p>
        </div>
      </header>
  
      <!-- Main Content -->
      <main class="container mx-auto flex-grow text-center">
        <!-- Introduction Section -->
        <section class="mb-12">
          <h2 class="text-4xl font-bold mb-6 text-purple-800 dark:text-white">Discover, Save, Share</h2>
          <p class="text-gray-700 dark:text-gray-300 text-lg max-w-3xl mx-auto">
            Tired of losing track of valuable links? We've got you covered. With our platform, save and organize your favorite online discoveries, and share them with friends effortlessly.
          </p>
        </section>
  
        <!-- Purpose Section -->
        <section class="grid md:grid-cols-2 gap-8 mb-12">
          <!-- Purpose Card -->
          <div class="p-8 bg-gradient-to-r from-green-200 to-green-300 dark:bg-green-700 rounded-lg shadow-md">
            <h3 class="text-3xl font-semibold mb-4 text-white">Our Goal</h3>
            <p class="text-gray-800 dark:text-gray-100">
              We aim to make link management a breeze. Save links, revisit them whenever you want, and share your collections with just a few clicks.
            </p>
          </div>
  
          <!-- Mission Card -->
          <div class="p-8 bg-gradient-to-r from-pink-200 to-pink-300 dark:bg-pink-700 rounded-lg shadow-md">
            <h3 class="text-3xl font-semibold mb-4 text-white">Our Mission</h3>
            <p class="text-gray-800 dark:text-gray-100">
              Simplify your digital life. Organize and explore content that matters to you with an intuitive, vibrant, and seamless platform.
            </p>
          </div>
        </section>
  
        <!-- Features Section -->
        <section class="mb-12">
          <h2 class="text-4xl font-bold mb-6 text-purple-800 dark:text-white">Why You'll Love Us</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <!-- Feature Card -->
            <div class="p-6 bg-gradient-to-r from-blue-200 to-blue-300 dark:bg-blue-700 rounded-lg shadow-md">
              <h4 class="text-2xl font-semibold mb-3 text-white">Save Links with Ease</h4>
              <p class="text-gray-800 dark:text-gray-100">
                Bookmark your favorite articles, videos, and resources effortlessly. Your collection is just a click away!
              </p>
            </div>
  
            <!-- Feature Card -->
            <div class="p-6 bg-gradient-to-r from-yellow-200 to-yellow-300 dark:bg-yellow-700 rounded-lg shadow-md">
              <h4 class="text-2xl font-semibold mb-3 text-white">Organize & Share</h4>
              <p class="text-gray-800 dark:text-gray-100">
                Create collections, keep them neat, and share them with friends. Your favorite content, now available for others to explore!
              </p>
            </div>
  
            <!-- Feature Card -->
            <div class="p-6 bg-gradient-to-r from-purple-200 to-purple-300 dark:bg-purple-700 rounded-lg shadow-md">
              <h4 class="text-2xl font-semibold mb-3 text-white">Suggest & Discover</h4>
              <p class="text-gray-800 dark:text-gray-100">
                Coming soon: Suggest links using our feed and discover new content through shared collections. Your inspiration, amplified!
              </p>
            </div>
          </div>
        </section>
  
        <!-- Call to Action Section -->
        <section class="my-16">
          <h2 class="text-4xl font-bold mb-4 text-purple-800 dark:text-white">Ready to Start?</h2>
          <p class="text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join us today and experience a new way to keep track of the content that matters. Save, organize, share – all in one place.
          </p>
          <a href="/savesuggest.com" class="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:opacity-90 transition-all duration-300">
            Get Started Now
          </a>
        </section>
      </main>
  
      <!-- Footer -->
      <footer class="py-6 bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 dark:bg-gray-800">
        <div class="container mx-auto text-center">
          <p class="text-gray-800 dark:text-gray-300 text-sm md:text-base">
            © 2024 | Empowering your digital journey, one link at a time.
          </p>
        </div>
      </footer>
    </div>
  </template>
  
  <script setup>

  
  // Set the page meta information
  useHead({
    title: 'About Us - Discover, Save, Share',
    meta: [
      { name: 'description', content: 'Learn about our vibrant platform that allows you to save, organize, and share your favorite online content effortlessly.' },
      { property: 'og:title', content: 'About Us - Discover, Save, Share' },
      { property: 'og:description', content: 'Learn about our vibrant platform that allows you to save, organize, and share your favorite online content effortlessly.' },
      { property: 'og:image', content: '/img/save_preview_1.png' },
      { name: 'twitter:title', content: 'About Us - Discover, Save, Share' },
      { name: 'twitter:description', content: 'Learn about our vibrant platform that allows you to save, organize, and share your favorite online content effortlessly.' },
      { name: 'twitter:image', content: '/img/save_preview_1.png' },
      { name: 'twitter:card', content: 'summary_large_image' }
    ]
  });
  </script>
  
  <style scoped>
  /* Additional styles for better presentation */
  a {
    transition: all 0.3s ease-in-out;
  }
  a:hover {
    text-decoration: underline;
  }
  </style>
  