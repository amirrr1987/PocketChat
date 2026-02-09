<template>
  <div class="flex h-full">
    <!-- Conversations List -->
    <div class="w-80 border-r border-stone-200 flex flex-col">
      <div class="p-4 border-b border-stone-200">
        <h1 class="text-xl font-semibold text-stone-800">Conversations</h1>
      </div>
      <div class="flex-1 overflow-y-auto">
        <div v-if="loadingConversations" class="p-4 text-center text-stone-500">
          Loading...
        </div>
        <div v-else-if="conversations.length === 0" class="p-4 text-center text-stone-500">
          No conversations yet
        </div>
        <div
          v-else
          v-for="conv in conversations"
          :key="conv.id"
          class="p-4 border-b border-stone-100 hover:bg-stone-50 cursor-pointer"
          :class="{ 'bg-sky-50': selectedConversationId === conv.id }"
          @click="selectConversation(conv)"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-semibold">
              {{ getOtherParticipant(conv)?.username?.charAt(0).toUpperCase() || '?' }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-stone-800 truncate">
                {{ getOtherParticipant(conv)?.profile?.displayName || getOtherParticipant(conv)?.username || 'Unknown' }}
              </div>
              <div class="text-sm text-stone-500 truncate">
                {{ getLastMessage(conv) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="p-4 border-t border-stone-200">
        <RouterLink
          :to="{ name: 'contacts' }"
          class="block w-full text-center rounded-lg bg-sky-600 text-white px-4 py-2 font-medium hover:bg-sky-700 transition"
        >
          New Chat
        </RouterLink>
      </div>
    </div>

    <!-- Chat Area -->
    <div class="flex-1 flex flex-col" v-if="selectedConversation">
      <!-- Chat Header -->
      <div class="p-4 border-b border-stone-200 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-semibold">
          {{ getOtherParticipant(selectedConversation)?.username?.charAt(0).toUpperCase() || '?' }}
        </div>
        <div>
          <div class="font-medium text-stone-800">
            {{ getOtherParticipant(selectedConversation)?.profile?.displayName || getOtherParticipant(selectedConversation)?.username || 'Unknown' }}
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
        <div v-if="loadingMessages" class="text-center text-stone-500">
          Loading messages...
        </div>
        <div v-else-if="messages.length === 0" class="text-center text-stone-500">
          No messages yet. Start the conversation!
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
            :class="msg.senderId === currentUserId ? 'bg-sky-600 text-white' : 'bg-stone-100 text-stone-800'"
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
      </div>

      <!-- Message Input -->
      <div class="p-4 border-t border-stone-200">
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <input
            v-model="newMessageText"
            type="text"
            placeholder="Type a message..."
            class="flex-1 border border-stone-300 rounded-lg px-4 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            :disabled="sendingMessage"
          />
          <button
            type="submit"
            class="rounded-lg bg-sky-600 text-white px-6 py-2 font-medium hover:bg-sky-700 disabled:opacity-50"
            :disabled="!newMessageText.trim() || sendingMessage"
          >
            Send
          </button>
        </form>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="text-center space-y-4">
        <div class="text-6xl">💬</div>
        <h2 class="text-2xl font-semibold text-stone-800">Select a conversation</h2>
        <p class="text-stone-600">Choose a conversation from the list or start a new chat</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { RouterLink } from "vue-router";
import { useConversationsApi, type ConversationResponse } from "@/services/conversations.api";
import { useMessagesApi, type MessageResponse } from "@/services/messages.api";
import { useAuthStore } from "@/stores/auth.store";
import { storeToRefs } from "pinia";

const conversationsApi = useConversationsApi();
const messagesApi = useMessagesApi();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const currentUserId = computed(() => user.value?.id ?? "");

const conversations = ref<ConversationResponse[]>([]);
const selectedConversation = ref<ConversationResponse | null>(null);
const selectedConversationId = computed(() => selectedConversation.value?.id ?? null);
const messages = ref<MessageResponse[]>([]);
const newMessageText = ref("");
const loadingConversations = ref(false);
const loadingMessages = ref(false);
const sendingMessage = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

function getOtherParticipant(conv: ConversationResponse) {
  return conv.participants.find(p => p.userId !== currentUserId.value)?.user;
}

function getLastMessage(conv: ConversationResponse) {
  if (conv.lastMessage) {
    const isFromMe = conv.lastMessage.senderId === currentUserId.value;
    const senderName = isFromMe ? "You" : (conv.lastMessage.sender.profile?.displayName || conv.lastMessage.sender.username);
    return `${senderName}: ${conv.lastMessage.content.substring(0, 50)}${conv.lastMessage.content.length > 50 ? '...' : ''}`;
  }
  return "No messages yet";
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

async function loadConversations() {
  loadingConversations.value = true;
  try {
    conversations.value = await conversationsApi.getAll();
  } catch (error) {
    console.error("Failed to load conversations:", error);
  } finally {
    loadingConversations.value = false;
  }
}

async function selectConversation(conv: ConversationResponse) {
  selectedConversation.value = conv;
  await loadMessages(conv.id);
}

async function loadMessages(conversationId: string) {
  loadingMessages.value = true;
  try {
    messages.value = await messagesApi.getAll(conversationId);
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error("Failed to load messages:", error);
  } finally {
    loadingMessages.value = false;
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

async function sendMessage() {
  if (!selectedConversation.value || !newMessageText.value.trim() || sendingMessage.value) {
    return;
  }

  const content = newMessageText.value.trim();
  newMessageText.value = "";
  sendingMessage.value = true;

  try {
    const newMessage = await messagesApi.create(selectedConversation.value.id, { content });
    messages.value.push(newMessage);
    // Reload conversations to update last message
    await loadConversations();
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error("Failed to send message:", error);
    newMessageText.value = content; // Restore message on error
  } finally {
    sendingMessage.value = false;
  }
}

onMounted(() => {
  loadConversations();
  
  // Check if there's a conversationId in query params
  const urlParams = new URLSearchParams(window.location.search);
  const conversationId = urlParams.get('conversationId');
  if (conversationId) {
    // Find and select the conversation
    const conv = conversations.value.find(c => c.id === conversationId);
    if (conv) {
      selectConversation(conv);
    } else {
      // If not loaded yet, wait for conversations to load
      const checkInterval = setInterval(() => {
        const conv = conversations.value.find(c => c.id === conversationId);
        if (conv) {
          selectConversation(conv);
          clearInterval(checkInterval);
        }
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 5000);
    }
  }
});
</script>
