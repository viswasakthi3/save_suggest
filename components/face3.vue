<template>
  <div class="container">
    <div class="avatar-container" @mouseover="showLogoutButton = true" @mouseleave="showLogoutButton = false">
      <img
        :src="profilePicture"
        alt="profile picture"
        class="avatar"
      />
      <!-- Logout button that appears on hover -->
      <button v-if="showLogoutButton" class="logout-button" @click="logout">Logout</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const config = useRuntimeConfig();
// Reactive state for profile picture
const profilePicture = ref("");
const showLogoutButton = ref(false);

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

// Function to clear the cookie and handle logout
const logout = () => {
  document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  alert("You have been logged out.");
  // Optionally, redirect to a login page or home page
  window.location.href = "/savesuggest.com";
};

// Call fetchProfilePicture on component mount
onMounted(fetchProfilePicture);
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  margin: 15px 0;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar {
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 65px;
  height: auto;
}

/* Styles for the logout button */
.logout-button {
  display: inline-block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 5px 10px;
  background-color: #f00;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* Show the logout button on hover */
.avatar-container:hover .logout-button {
  opacity: 1;
}
</style>
