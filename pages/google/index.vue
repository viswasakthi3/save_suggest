<template>
  <!-- <div> <Nav_learnit2></Nav_learnit2> </div> -->
  <div>
    <h1>Please wait, we are signing you in...</h1>  
    <button @click="goToLearn">Go to home page</button>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie'; // Ensure Cookies library is imported
import { useRouter, useRoute } from 'vue-router';

definePageMeta({
  colorMode: "light", // or 'dark'
});

const code = ref('');
const message = ref('');

const config = useRuntimeConfig();
const router = useRouter(); // Define the router here

// Function to handle Google sign-in
const signInWithGoogle = async () => {
  const route = useRoute();
  code.value = route.query.code || '';
  try {
    const response = await axios.post(`${config.public.API_BASE_URL}/get-token-save`, { idtoken: code.value });

    if (response.status === 200) {
      // Store the JWT token in localStorage
      localStorage.setItem("access_token", response.data.access_token);
      message.value = "User logged in successfully!";

      // Set the JWT token in cookies
      Cookies.set("access_token", response.data.access_token, {
        expires: 15, // The cookie will expire in 15 days
        sameSite: "lax", // or 'strict' or 'none'
        secure: true, // set to true if you are using https
        path: "/", // the path the cookie is valid for
        domain: ".savesuggest.com", // the domain the cookie is valid for
      });

      // Redirect to home page
      router.push('/');
    } else {
      message.value = response.data.error;
    }
  } catch (error) {
    message.value = error.message;
  }
};

// Watch for the presence of the access_token and redirect if found
watchEffect(() => {
  const accessToken = localStorage.getItem('access_token') || Cookies.get('access_token');
  if (accessToken) {
    router.push('/');
  }
});

// On component mount, trigger the sign-in process
onMounted(() => {
  code.value = useRouter().currentRoute.value.query.code || '';
  signInWithGoogle();
});

// Function to manually navigate to the home page
const goToLearn = () => {
  router.push('/');
};
</script>

<style scoped>
h1 {
  color: black;
}

button {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  padding: 5px 9px;
  font-size: 14px;
  color: #262626;
  background-color: #fafafa;
  cursor: pointer;
  margin-left: 20px;
}

button:hover {
  background-color: #fafafaa9;
}
</style>
