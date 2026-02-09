<template>
  <RouterView />
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { RouterView } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { useNotification } from "@/composables/useNotification";

const { setupMessageNotifications, cleanupMessageNotifications } = useNotification();

onMounted(async () => {
  const authStore = useAuthStore();
  
  // Load user data if token exists
  if (authStore.token) {
    await authStore.loadUserData();
  }

  // Setup message notifications
  setupMessageNotifications();
});

onUnmounted(() => {
  cleanupMessageNotifications();
});
</script>
