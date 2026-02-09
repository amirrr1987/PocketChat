<template>
  <RouterView />
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

onMounted(async () => {
  const authStore = useAuthStore();
  
  // Load user data if token exists
  if (authStore.token) {
    await authStore.loadUserData();
  }
});
</script>
