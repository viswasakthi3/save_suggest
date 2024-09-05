<template>
    <!-- <div> <Nav_learnit2></Nav_learnit2> </div> -->
    <div>
      <h1>Please wait, we are signing you in...</h1>  
      <button @click="goToLearn">Go to home page</button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import Cookies from 'js-cookie';
  import { useRouter, useRoute } from 'vue-router';

  
  definePageMeta({
    colorMode: "light", // or 'dark'
  });
  
  const code = ref('');
  const message = ref('');
  
  const config = useRuntimeConfig();
  const router = useRouter(); // Define the router here
  
  const signInWithGoogle = async () => {
    const route = useRoute();
    code.value = route.query.code || '';
    try {
      const response = await axios.post(`${config.public.API_BASE_URL}/get-token-save`, { idtoken: code.value });
  
      if (response.status === 200) {
        localStorage.setItem("access_token", response.data.access_token); // Store the JWT token in localStorage
        message.value = "User logged in successfully!";
        Cookies.set("access_token", response.data.access_token, {
          expires: 15, // The cookie will expire in 15 days
          sameSite: "lax", // or 'strict' or 'none'
          secure: true, // set to true if you are using https
          path: "/", // the path the cookie is valid for
          domain: ".savesuggest.com", // the domain the cookie is valid for
        });
  
        // Redirect to /learn
        router.push('/home'); // Use router instance here
      } else {
        message.value = response.data.error;
      }
    } catch (error) {
      message.value = error.message;
    }
  };
  

//   watchEffect(() => {
//     const route = useRoute();
//     const accessToken = Cookies.get('access_token');
//     if (accessToken) {
//       router.push('/home');
//     }
//   });

  onMounted(() => {
    code.value = useRouter().currentRoute.value.query.code || '';
    signInWithGoogle();
  });
  
  const goToLearn = () => {
    router.push('/home');
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
  