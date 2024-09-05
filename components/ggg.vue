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
        const apiResponse = await axios.post(`${config.public.API_BASE_URL}/login-with-idtoken-save`, { idtoken: idToken });

        if (apiResponse.status === 200) {
          Cookies.set("access_token", apiResponse.data.access_token, {
            sameSite: "lax",
            secure: true,
            path: "/",
            domain: ".savesugggest.com",
          });
          localStorage.setItem("access_token", apiResponse.data.access_token);

          // Directly redirect to the home page without preference checks
          router.push("/");
        } else {
          console.error(apiResponse.data.error);
        }
      } catch (error) {
        console.error(error.message);
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
