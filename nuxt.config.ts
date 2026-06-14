// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },


  devServer: {
    port: 2052
  },
  runtimeConfig: {
    public: {
      API_BASE_URL: process.env.API_BASE_URL ,
      baseURL: process.env.API_BASE_URL 
    },
  },
  css: ["~/assets/css/tailwind.css", ],
  modules: ['@nuxtjs/tailwindcss', 'nuxt-gtag', '@nuxt/ui'],
  fonts: {
    provider: 'none',
  },
  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },
  vite: {
    resolve: {
      alias: {
        'form-data': 'form-data/lib/form_data.js',
      },
    },
  },
  
  
  
  gtag: {
    id: 'G-G51LBZHS9C', // Replace with your Google Analytics ID
   
  },

  plugins: [
    // ... other plugins
    { src: '~/plugins/gtm.client.js', mode: 'client' }
  ],
})
