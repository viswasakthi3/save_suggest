<template>
    <div>

    </div>
</template>
  
<script>
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'vue-router';
definePageMeta({
  colorMode: "light", // or 'dark'
});

export default {
  mounted() {
    const router = useRouter();
    const config = useRuntimeConfig();

    const GOOGLE_CLIENT_ID = '229962853029-1v482pes5t150mt63jb7v75k3ssr0bnf.apps.googleusercontent.com';

    const handleCredentialResponse = async (response) => {
  const idToken = response.credential;

  try {
    // Send the ID token to the backend to get the access token
    const apiResponse = await axios.post(`${config.public.API_BASE_URL}/login-with-idtoken-save`, { idtoken: idToken });

    if (apiResponse.status === 200) {
      const accessToken = apiResponse.data.access_token;

      // Store the access token in localStorage
      localStorage.setItem("access_token", accessToken);

      // Store the access token in cookies with security flags
      Cookies.set("access_token", accessToken, {
        sameSite: "lax",  // Prevent CSRF attacks
        secure: true,     // Ensure the cookie is only sent over HTTPS
        path: "/",        // Make the cookie available across the entire site
        domain: ".savesugggest.com",  // Set the domain for the cookie
      });

      // Redirect to the home page
      router.push("/");
    } else {
      console.error(apiResponse.data.error);
    }
  } catch (error) {
    console.error("Error during login:", error.message);
  }
};


    const initGoogleSignIn = () => {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        context: 'signin',
      });

      google.accounts.id.prompt();
    };

    if (typeof google === 'undefined') {
      window.onload = initGoogleSignIn;
    } else {
      initGoogleSignIn();
    }
  }
}

function getCookie(name) {
    let matches = document.cookie.match(
      new RegExp(
        "(?:^|; )" +
          name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
          "=([^;]*)"
      )
    );
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }

</script>

<style scoped>
h1 {
  color: black;
}
</style>
