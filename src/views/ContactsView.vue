<template>
  <div class="p-4 space-y-4">
    <h1 class="text-xl font-semibold text-stone-800">Start a Conversation</h1>
    <p class="text-sm text-stone-500">
      Select a user to start a direct conversation
    </p>

    <div v-if="loading" class="text-center text-stone-500 py-8">
      Loading users...
    </div>
    <div v-else-if="error" class="text-center text-red-500 py-8">
      {{ error }}
    </div>
    <ul v-else-if="users.length > 0" class="space-y-2">
      <li
        v-for="u in users"
        :key="u.id"
        class="flex items-center justify-between gap-4 rounded-lg border border-stone-200 p-4 hover:bg-stone-50"
      >
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-semibold shrink-0">
            {{ u.username.charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-medium text-stone-800 truncate">
              {{ u.profile?.displayName || u.username }}
            </div>
            <div class="text-sm text-stone-500 truncate">
              @{{ u.username }}
            </div>
          </div>
        </div>
        <button
          type="button"
          class="rounded-lg bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:bg-sky-700 disabled:opacity-50 shrink-0"
          :disabled="startingChat"
          @click="startChat(u.id)"
        >
          {{ startingChat ? "Starting..." : "Chat" }}
        </button>
      </li>
    </ul>
    <div v-else class="text-center text-stone-500 py-8">
      No other users found
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUsersApi } from "@/services/users.api";
import { useConversationsApi } from "@/services/conversations.api";
import { useAuthStore } from "@/stores/auth.store";
import { storeToRefs } from "pinia";

const router = useRouter();
const usersApi = useUsersApi();
const conversationsApi = useConversationsApi();
const authStore = useAuthStore();
const { user: currentUser } = storeToRefs(authStore);

const users = ref<Array<{ id: string; username: string; email: string; profile: { displayName: string | null; avatarUrl: string | null } | null }>>([]);
const loading = ref(true);
const error = ref("");
const startingChat = ref(false);

async function loadUsers() {
  loading.value = true;
  error.value = "";
  try {
    const allUsers = await usersApi.getAll();
    // Filter out current user
    users.value = allUsers.filter(u => u.id !== currentUser.value?.id);
  } catch (err) {
    error.value = "Failed to load users";
    console.error("Failed to load users:", err);
  } finally {
    loading.value = false;
  }
}

async function startChat(userId: string) {
  if (startingChat.value) return;
  
  startingChat.value = true;
  try {
    const conversation = await conversationsApi.createDirect({ userId });
    // Navigate directly to chat page
    router.push({ name: "chat", params: { id: conversation.id } });
  } catch (err) {
    console.error("Failed to start chat:", err);
    error.value = "Failed to start conversation";
  } finally {
    startingChat.value = false;
  }
}

onMounted(() => {
  loadUsers();
});
</script>
