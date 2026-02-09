<template>
  <div class="h-full flex flex-col">
    <!-- Chat Header -->
    <div class="p-4 border-b border-stone-200 flex items-center gap-3 bg-white">
      <RouterLink
        :to="{ name: 'chats' }"
        class="p-2 hover:bg-stone-100 rounded-lg transition"
        title="Back to conversations"
      >
        <Icon icon="mdi:arrow-left" class="w-5 h-5 text-stone-600" />
      </RouterLink>
      <div class="relative">
        <div
          class="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-semibold"
        >
          {{ getOtherParticipant()?.username?.charAt(0).toUpperCase() || "?" }}
        </div>
        <div
          v-if="conversation && isUserOnline(getOtherParticipant()?.id || '')"
          class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
          title="Online"
        ></div>
        <div
          v-else-if="conversation && getOtherParticipant()?.id"
          class="absolute bottom-0 right-0 w-3 h-3 bg-stone-400 border-2 border-white rounded-full"
          title="Offline"
        ></div>
      </div>
      <div class="flex-1">
        <div class="font-medium text-stone-800">
          {{
            getOtherParticipant()?.profile?.displayName ||
            getOtherParticipant()?.username ||
            "Unknown"
          }}
        </div>
        <div class="text-xs text-stone-500">
          <span v-if="conversation && isUserOnline(getOtherParticipant()?.id || '')"> Online </span>
          <span v-else-if="conversation && getOtherParticipant()?.id">
            Last seen {{ formatLastSeen(getUserLastSeen(getOtherParticipant()?.id || "")) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
      <div v-if="loadingMessages" class="text-center text-stone-500">Loading messages...</div>
      <div v-else-if="messages.length === 0" class="text-center text-stone-500">
        <div class="text-4xl mb-2">💬</div>
        <p>No messages yet. Start the conversation!</p>
      </div>
      <div
        v-else
        v-for="msg in messages"
        :key="msg.id"
        class="flex"
        :class="{ 'justify-end': msg.senderId === currentUserId }"
      >
        <div
          class="max-w-xs lg:max-w-md rounded-lg px-4 py-2"
          :class="
            msg.senderId === currentUserId ? 'bg-sky-600 text-white' : 'bg-stone-100 text-stone-800'
          "
        >
          <div class="text-sm">{{ msg.content }}</div>
          <div
            class="text-xs mt-1"
            :class="msg.senderId === currentUserId ? 'text-sky-100' : 'text-stone-500'"
          >
            {{ formatTime(msg.createdAt) }}
          </div>
        </div>
      </div>
      <!-- Typing Indicator -->
      <div
        v-if="conversation && getTypingUsers(conversation.id).length > 0"
        class="flex items-center gap-2 text-stone-500 text-sm italic"
      >
        <div class="flex gap-1">
          <div
            class="w-1 h-1 bg-stone-400 rounded-full animate-bounce"
            style="animation-delay: 0ms"
          ></div>
          <div
            class="w-1 h-1 bg-stone-400 rounded-full animate-bounce"
            style="animation-delay: 150ms"
          ></div>
          <div
            class="w-1 h-1 bg-stone-400 rounded-full animate-bounce"
            style="animation-delay: 300ms"
          ></div>
        </div>
        <span>
          {{
            getTypingUsers(conversation.id)
              .map((u: { userId: string; username: string }) => u.username)
              .join(", ")
          }}
          {{ getTypingUsers(conversation.id).length === 1 ? "is" : "are" }} typing...
        </span>
      </div>
    </div>

    <!-- Message Input -->
    <div class="p-4 border-t border-stone-200 bg-white">
      <form @submit.prevent="sendMessage" class="flex gap-2">
        <input
          ref="messageInputRef"
          v-model="newMessageText"
          @input="handleTypingInput"
          @blur="handleTypingStop"
          type="text"
          placeholder="Type a message..."
          class="flex-1 border border-stone-300 rounded-lg px-4 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          :dir="inputDirection"
          :disabled="sendingMessage || !conversation"
        />
        <button
          type="submit"
          class="rounded-lg bg-sky-600 text-white px-6 py-2 font-medium hover:bg-sky-700 disabled:opacity-50 transition"
          :disabled="!newMessageText.trim() || sendingMessage || !conversation"
        >
          Send
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRoute, RouterLink, useRouter } from "vue-router";
import { useConversationsApi, type ConversationResponse } from "@/services/conversations.api";
import { useMessagesApi, type MessageResponse } from "@/services/messages.api";
import { useAuthStore } from "@/stores/auth.store";
import { storeToRefs } from "pinia";
import { useSocket } from "@/composables/socket.composable";
import { useTypingIndicator } from "@/composables/useTypingIndicator";
import { Icon } from "@iconify/vue";

const route = useRoute();
const router = useRouter();
const conversationsApi = useConversationsApi();
const messagesApi = useMessagesApi();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const currentUserId = computed(() => user.value?.id ?? "");
const conversationId = computed(() => route.params.id as string);

const conversation = ref<ConversationResponse | null>(null);
const messages = ref<MessageResponse[]>([]);
const newMessageText = ref("");
const loadingMessages = ref(false);
const sendingMessage = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const messageInputRef = ref<HTMLInputElement | null>(null);

// Online status tracking
const onlineUsers = ref<Set<string>>(new Set());
const userLastSeen = ref<Map<string, string>>(new Map());

// Typing indicators
const { socket } = useSocket();
const { startTyping, stopTyping, getTypingUsers, setupTypingListeners, cleanupTypingListeners } =
  useTypingIndicator();
const typingTimeoutRef = ref<ReturnType<typeof setTimeout> | null>(null);

// Detect text direction based on content
function isRTL(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  
  // RTL character ranges: Arabic (0600-06FF), Hebrew (0590-05FF), and Persian digits
  const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return rtlRegex.test(text);
}

const inputDirection = computed(() => {
  return isRTL(newMessageText.value) ? "rtl" : "ltr";
});

function getOtherParticipant() {
  if (!conversation.value) return null;
  return conversation.value.participants.find((p) => p.userId !== currentUserId.value)?.user;
}

function isUserOnline(userId: string): boolean {
  return onlineUsers.value.has(userId);
}

function getUserLastSeen(userId: string): string | null {
  return userLastSeen.value.get(userId) || null;
}

function formatLastSeen(lastSeenAt: string | null): string {
  if (!lastSeenAt) return "";
  const date = new Date(lastSeenAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

async function loadConversation() {
  if (!conversationId.value) return;

  try {
    conversation.value = await conversationsApi.getOne(conversationId.value);

    // Load initial online status and lastSeenAt from API response
    const otherParticipant = getOtherParticipant();
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
  } catch (error) {
    console.error("Failed to load conversation:", error);
    router.push({ name: "chats" });
  }
}

async function loadMessages() {
  if (!conversationId.value) return;

  loadingMessages.value = true;
  try {
    messages.value = await messagesApi.getAll(conversationId.value);
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error("Failed to load messages:", error);
  } finally {
    loadingMessages.value = false;
  }
}

function handleTypingInput() {
  if (!conversation.value) return;

  // Clear existing timeout
  if (typingTimeoutRef.value) {
    clearTimeout(typingTimeoutRef.value);
  }

  // Start typing indicator
  startTyping(conversation.value.id);

  // Auto-stop after 2 seconds of no typing
  typingTimeoutRef.value = setTimeout(() => {
    stopTyping(conversation.value!.id);
  }, 2000);
}

function handleTypingStop() {
  if (!conversation.value) return;

  if (typingTimeoutRef.value) {
    clearTimeout(typingTimeoutRef.value);
    typingTimeoutRef.value = null;
  }

  stopTyping(conversation.value.id);
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

async function sendMessage() {
  if (!conversation.value || !newMessageText.value.trim() || sendingMessage.value) {
    return;
  }

  // Stop typing indicator
  handleTypingStop();

  const content = newMessageText.value.trim();
  newMessageText.value = "";
  sendingMessage.value = true;

  try {
    const newMessage = await messagesApi.create(conversation.value.id, { content });
    // Message will be added via WebSocket broadcast, but add it here too for immediate UI update
    if (!messages.value.find((m) => m.id === newMessage.id)) {
      messages.value.push(newMessage);
    }
    await nextTick();
    scrollToBottom();
    // Focus input after sending message
    await nextTick();
    messageInputRef.value?.focus();
  } catch (error) {
    console.error("Failed to send message:", error);
    newMessageText.value = content; // Restore message on error
  } finally {
    sendingMessage.value = false;
    // Focus input even if there was an error
    await nextTick();
    messageInputRef.value?.focus();
  }
}

// Setup WebSocket listeners
function setupSocketListeners() {
  setupTypingListeners();

  // Listen for new messages
  socket.on("message:new", (message: MessageResponse) => {
    if (conversationId.value === message.conversationId) {
      // Check if message already exists
      if (!messages.value.find((m) => m.id === message.id)) {
        messages.value.push(message);
        nextTick(() => scrollToBottom());
      }
    }
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
  cleanupTypingListeners();
  socket.off("message:new");
  socket.off("user:online");
  socket.off("user:offline");
}

// Watch for new messages and auto-scroll
watch(
  messages,
  () => {
    nextTick(() => scrollToBottom());
  },
  { deep: true },
);

// Watch for route changes
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await loadConversation();
      await loadMessages();
      // Focus input after loading conversation
      await nextTick();
      messageInputRef.value?.focus();
    }
  },
  { immediate: true },
);

onMounted(async () => {
  await loadConversation();
  await loadMessages();
  setupSocketListeners();
  // Focus input when component mounts
  await nextTick();
  messageInputRef.value?.focus();
});

onUnmounted(() => {
  cleanupSocketListeners();
  if (typingTimeoutRef.value) {
    clearTimeout(typingTimeoutRef.value);
  }
});
</script>
