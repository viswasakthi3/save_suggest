<template>
    <div class="container">
      <a href="/pp">
        <UAvatar
          :src="profilePicture"
          alt="Avatar"
          size="lg"
          class="avatar"
          chip-position="top-right"
      /></a>
  
      <!-- <img  alt="Profile Picture" /> -->
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import axios from "axios";
  
  const config = useRuntimeConfig();
  // Reactive state for profile picture
  const profilePicture = ref("");
  
  // Function to fetch only the profile picture
  const fetchProfilePicture = async () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token"))
      .split("=")[1];
  
    try {
      const userResponse = await axios.get(
        `${config.public.API_BASE_URL}/user_details_save`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      profilePicture.value = userResponse.data.poster_path;
    } catch (error) {
      console.error(
        "An error occurred while fetching the profile picture: ",
        error
      );
    }
  };
  
  // Call fetchProfilePicture on component mount
  onMounted(fetchProfilePicture);
  </script>
  
  <style scoped>
  .avatar {
    border: 1px solid #ddd; /* Change the color to a mild one */
    border-radius: 50%; /* Optional: to make the avatar circular */
  }
  .container {
    display: flex;
    flex-direction: column;
    /* Align items to the top */
    margin: 15px 0px;
  
    /* Ensure there's no background color */
  }
  
  .avatar {
    border: 1px solid black;
  }
  </style>
  