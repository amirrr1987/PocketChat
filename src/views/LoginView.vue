<template>
  <div>
    <h2 class="text-2xl font-semibold text-stone-800 mb-6 text-center">Login</h2>

    <form class="space-y-5" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-2">Username</label>
        <input
          v-model="username"
          type="text"
          required
          autocomplete="username"
          class="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
          placeholder="Enter your username"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-stone-700 mb-2">Password</label>
        <input
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
          placeholder="Enter your password"
        />
      </div>

      <div v-if="error" class="p-3 rounded-lg bg-red-50 border border-red-200">
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>

      <button
        type="submit"
        class="w-full rounded-lg bg-sky-600 text-white py-2.5 font-medium hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm hover:shadow"
        :disabled="loading || !username || !password"
      >
        <span v-if="loading" class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Logging in...
        </span>
        <span v-else>Login</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

const router = useRouter();
const authStore = useAuthStore();

const username = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function submit() {
  if (!username.value.trim() || !password.value) {
    return;
  }

  error.value = "";
  loading.value = true;
  try {
    await authStore.login({
      username: username.value.trim(),
      password: password.value,
    });
    // Navigate to chats page after successful login
    await router.push({ name: "chats" });
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string | string[] } }; message?: string };
    const msg = err.response?.data?.message
      ? Array.isArray(err.response.data.message)
        ? err.response.data.message[0]
        : err.response.data.message
      : err.message ?? "Invalid credentials";
    error.value = String(msg);
  } finally {
    loading.value = false;
  }
}
</script>
