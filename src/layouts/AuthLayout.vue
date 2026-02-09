<template>
  <div class="min-h-svh flex items-center justify-center p-4 bg-stone-50">
    <div class="w-full max-w-md">
      <!-- Logo/Brand Section -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-stone-800 mb-2">Chat App</h1>
        <p class="text-stone-600">Connect and communicate</p>
      </div>

      <!-- Auth Card -->
      <div class="rounded-xl border border-stone-200 bg-white shadow-lg p-8">
        <RouterView />
      </div>

      <!-- Footer Links -->
      <div class="mt-6 text-center text-sm text-stone-500">
        <RouterLink
          v-if="$route.name === 'login'"
          :to="{ name: 'register' }"
          class="text-sky-600 hover:text-sky-700 hover:underline"
        >
          Don't have an account? Register
        </RouterLink>
        <RouterLink
          v-else-if="$route.name === 'register'"
          :to="{ name: 'login' }"
          class="text-sky-600 hover:text-sky-700 hover:underline"
        >
          Already have an account? Login
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView, RouterLink } from "vue-router";
</script>
