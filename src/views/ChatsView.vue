<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-stone-200">
      <h1 class="text-xl font-semibold text-stone-800">Conversations</h1>
    </div>

    <!-- Conversations List -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="loadingConversations" class="p-4 text-center text-stone-500">Loading...</div>
      <div v-else-if="conversations.length === 0" class="p-4 text-center text-stone-500">
        <div class="text-6xl mb-4">💬</div>
        <p>No conversations yet</p>
        <RouterLink
          :to="{ name: 'contacts' }"
          class="mt-4 inline-block rounded-lg bg-sky-600 text-white px-4 py-2 font-medium hover:bg-sky-700 transition"
        >
          Start a new chat
        </RouterLink>
      </div>
      <div v-else>
        <RouterLink
          v-for="conv in conversations"
          :key="conv.id"
          :to="{ name: 'chat', params: { id: conv.id } }"
          class="block p-4 border-b border-stone-100 hover:bg-stone-50 transition"
          :class="{ 'bg-sky-50': route.name === 'chat' && route.params.id === conv.id }"
        >
          <div class="flex items-center gap-3">
            <div class="relative">
              <img
                v-if="getOtherParticipant(conv)?.profile?.avatarUrl!"
                class="w-12 h-12 rounded-full"
                :src="getOtherParticipant(conv)?.profile?.avatarUrl!"
                alt=""
              />
              <div
                v-else
                class="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-semibold text-lg"
              >
                {{ getOtherParticipant(conv)?.username?.charAt(0).toUpperCase() || "?" }}
              </div>
              <div
                v-if="isUserOnline(getOtherParticipant(conv)?.id || '')"
                class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                title="Online"
              ></div>
              <div
                v-else-if="getOtherParticipant(conv)?.id"
                class="absolute bottom-0 right-0 w-3 h-3 bg-stone-400 border-2 border-white rounded-full"
                title="Offline"
              ></div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-stone-800 truncate">
                {{
                  getOtherParticipant(conv)?.profile?.displayName ||
                  getOtherParticipant(conv)?.username ||
                  "Unknown"
                }}
              </div>
              <div class="text-sm text-stone-500 truncate">
                {{ getLastMessage(conv) }}
              </div>
            </div>
            <div v-if="conv.lastMessage" class="text-xs text-stone-400">
              {{ formatTime(conv.lastMessage.createdAt) }}
            </div>
          </div>
        </RouterLink>
      </div>
    </div>

    <!-- New Chat Button -->
    <div class="p-4 border-t border-stone-200">
      <RouterLink
        :to="{ name: 'contacts' }"
        class="block w-full text-center rounded-lg bg-sky-600 text-white px-4 py-2 font-medium hover:bg-sky-700 transition"
      >
        New Chat
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useConversationsApi, type ConversationResponse } from "@/services/conversations.api";
import { useAuthStore } from "@/stores/auth.store";
import { storeToRefs } from "pinia";
import { useSocket } from "@/composables/socket.composable";

const conversationsApi = useConversationsApi();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const route = useRoute();

const currentUserId = computed(() => user.value?.id ?? "");

const conversations = ref<ConversationResponse[]>([]);
const loadingConversations = ref(false);

// Online status tracking
const onlineUsers = ref<Set<string>>(new Set());
const userLastSeen = ref<Map<string, string>>(new Map());

const { socket } = useSocket();

function getOtherParticipant(conv: ConversationResponse) {
  return conv.participants.find((p) => p.userId !== currentUserId.value)?.user;
}

function isUserOnline(userId: string): boolean {
  return onlineUsers.value.has(userId);
}

function getLastMessage(conv: ConversationResponse) {
  if (conv.lastMessage) {
    const isFromMe = conv.lastMessage.senderId === currentUserId.value;
    const senderName = isFromMe
      ? "You"
      : conv.lastMessage.sender.profile?.displayName || conv.lastMessage.sender.username;
    return `${senderName}: ${conv.lastMessage.content.substring(0, 50)}${conv.lastMessage.content.length > 50 ? "..." : ""}`;
  }
  return "No messages yet";
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMs < 60000) return "now";
  if (diffHours < 24) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

async function loadConversations() {
  loadingConversations.value = true;
  try {
    conversations.value = await conversationsApi.getAll();

    // Load initial online status and lastSeenAt from API response
    conversations.value.forEach((conv) => {
      const otherParticipant = getOtherParticipant(conv);
      if (otherParticipant?.id) {
        if (otherParticipant.status === "online") {
          onlineUsers.value.add(otherParticipant.id);
          userLastSeen.value.delete(otherParticipant.id);
        } else {
          onlineUsers.value.delete(otherParticipant.id);
          if (otherParticipant.lastSeenAt) {
            userLastSeen.value.set(otherParticipant.id, otherParticipant.lastSeenAt);
          }
        }
      }
    });
  } catch (error) {
    console.error("Failed to load conversations:", error);
  } finally {
    loadingConversations.value = false;
  }
}

// Setup WebSocket listeners for real-time updates
function setupSocketListeners() {
  // Listen for new messages to update conversation list
  socket.on("message:new", () => {
    loadConversations();
  });

  // Listen for user online status
  socket.on("user:online", (data: { userId: string; username: string }) => {
    onlineUsers.value.add(data.userId);
    userLastSeen.value.delete(data.userId);
  });

  // Listen for user offline status
  socket.on("user:offline", (data: { userId: string; lastSeenAt: string }) => {
    onlineUsers.value.delete(data.userId);
    if (data.lastSeenAt) {
      userLastSeen.value.set(data.userId, data.lastSeenAt);
    }
  });
}

function cleanupSocketListeners() {
  socket.off("message:new");
  socket.off("user:online");
  socket.off("user:offline");
}

onMounted(() => {
  loadConversations();
  setupSocketListeners();
});

onUnmounted(() => {
  cleanupSocketListeners();
});
</script>
