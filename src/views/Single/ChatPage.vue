<template>
  <div class="chat-page">
    <!-- Loading -->
    <div v-if="isLoading" class="loading-container">
      <ion-spinner name="crescent"></ion-spinner>
    </div>
    <!-- Messages Container -->
    <div v-else class="messages-container">
      <template v-for="message in messages" :key="message.id">
        <!-- پیام‌های ورودی (چپ) -->
        <div
          v-if="!message.isOutgoing"
          class="message-wrapper message-incoming"
        >
          <ion-avatar class="message-avatar">
            <img :src="message.avatar" :alt="message.senderName" />
          </ion-avatar>
          <div class="message-bubble message-bubble-incoming">
            <div class="message-sender-name">{{ message.senderName }}</div>
            <div v-if="message.replyTo" class="reply-indicator">
              <div class="reply-indicator-bar"></div>
              <div class="reply-indicator-content">
                <ion-text color="primary">
                  <strong>{{ message.replyTo.senderName }}</strong>
                </ion-text>
                <p>{{ message.replyTo.text }}</p>
              </div>
            </div>
            <div class="message-text">{{ message.text }}</div>
            <div class="message-time">
              <ion-note>{{ message.time }}</ion-note>
            </div>
          </div>
        </div>

        <!-- پیام‌های خروجی (راست) -->
        <div v-else class="message-wrapper message-outgoing">
          <div class="message-bubble message-bubble-outgoing">
            <div
              v-if="message.replyTo"
              class="reply-indicator reply-indicator-outgoing"
            >
              <div class="reply-indicator-bar"></div>
              <div class="reply-indicator-content">
                <ion-text color="light">
                  <strong>{{ message.replyTo.senderName }}</strong>
                </ion-text>
                <p>{{ message.replyTo.text }}</p>
              </div>
            </div>
            <div class="message-text message-text-outgoing">
              {{ message.text }}
            </div>
            <div class="message-footer">
              <ion-note color="light" class="message-time-outgoing">{{
                message.time
              }}</ion-note>
              <ion-icon
                v-if="message.read"
                :icon="checkmarkDone"
                class="read-status-icon"
              ></ion-icon>
              <ion-icon
                v-else
                :icon="checkmark"
                class="read-status-icon"
              ></ion-icon>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject, type Ref } from "vue";
import { useRoute } from "vue-router";
import {
  IonAvatar,
  IonText,
  IonNote,
  IonIcon,
  IonSpinner,
} from "@ionic/vue";
import { checkmark, checkmarkDone } from "ionicons/icons";
import { fetchChatById, type GroupChat, type SingleChat } from "@/api/chats";
import {
  fetchMessagesBySingleChat,
  fetchMessagesByGroup,
  createMessage,
  type Message,
} from "@/api/messages";
import { getAuthUser } from "@/api/client";

interface DisplayMessage {
  id: string;
  isOutgoing: boolean;
  text: string;
  time: string;
  read: boolean;
  senderName: string;
  avatar: string;
  replyTo?: { senderName: string; text: string };
}

const route = useRoute();
const chatId = computed(() => route.params.id as string);

const currentUser = getAuthUser();
const messages = ref<DisplayMessage[]>([]);
const isLoading = ref(true);
const chatMeta = ref<{ singleChatId?: string; groupId?: string } | null>(null);

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function toDisplayMessage(m: Message): DisplayMessage {
  const senderName = m.sender?.username ?? "";
  const initial = senderName.slice(0, 2).toUpperCase() || "?";
  return {
    id: m.id,
    isOutgoing: m.senderId === currentUser?.id,
    text: m.content,
    time: formatTime(m.createdAt),
    read: true,
    senderName,
    avatar: `https://placehold.co/40x40/ea4335/ffffff?text=${encodeURIComponent(initial)}`,
  };
}

async function loadChatAndMessages() {
  const id = chatId.value;
  if (!id) return;
  isLoading.value = true;
  messages.value = [];
  chatMeta.value = null;
  try {
    const chat = await fetchChatById(id);
    if ("title" in chat) {
      const g = chat as GroupChat;
      chatMeta.value = { groupId: g.id };
      const list = await fetchMessagesByGroup(g.id);
      messages.value = list.map(toDisplayMessage);
    } else {
      const s = chat as SingleChat;
      chatMeta.value = { singleChatId: s.id };
      const list = await fetchMessagesBySingleChat(s.id);
      messages.value = list.map(toDisplayMessage);
    }
  } catch {
    messages.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadChatAndMessages);
watch(() => route.params.id, loadChatAndMessages);

const sendHandlerRef = inject<Ref<((text: string) => void) | null> | null>("chatSendHandler", null);

onMounted(() => {
  if (!sendHandlerRef) return;
  sendHandlerRef.value = async (text: string) => {
    if (!currentUser || !chatMeta.value) return;
    try {
      const payload = {
        senderId: currentUser.id,
        content: text,
        ...(chatMeta.value.singleChatId
          ? { singleChatId: chatMeta.value.singleChatId }
          : { groupId: chatMeta.value.groupId }),
      };
      const created = await createMessage(payload);
      messages.value = [...messages.value, toDisplayMessage(created)];
    } catch (e) {
      console.error("Send message failed:", e);
    }
  };
});
</script>

<style scoped>
.chat-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.messages-container {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.message-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 75%;
  animation: messageSlideIn 0.2s ease-out;
}

.message-incoming {
  align-self: flex-start;
}

.message-outgoing {
  align-self: flex-end;
  flex-direction: row-reverse;
  margin-left: auto;
}

.message-avatar {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.message-bubble {
  padding: 10px 12px;
  border-radius: 18px;
  position: relative;
  word-wrap: break-word;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
}

.message-bubble-incoming {
  background: var(--ion-color-light);
  color: var(--ion-color-dark);
  border-bottom-left-radius: 4px;
}

.message-bubble-outgoing {
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  border-bottom-right-radius: 4px;
}

.message-sender-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ion-color-primary);
  margin-bottom: 4px;
}

.message-text {
  font-size: 0.9375rem;
  line-height: 1.4;
  margin-bottom: 4px;
}

.message-text-outgoing {
  color: var(--ion-color-primary-contrast);
}

.message-time {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 4px;
}

.message-time-outgoing {
  font-size: 0.6875rem;
  opacity: 0.9;
}

.message-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
}

.read-status-icon {
  font-size: 16px;
  color: var(--ion-color-primary-contrast);
  opacity: 0.9;
}

/* Reply Indicator */
.reply-indicator {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.reply-indicator-outgoing {
  border-bottom-color: rgba(255, 255, 255, 0.2);
}

.reply-indicator-bar {
  width: 3px;
  background: var(--ion-color-primary);
  border-radius: 2px;
  flex-shrink: 0;
}

.reply-indicator-content {
  flex: 1;
  min-width: 0;
}

.reply-indicator-content strong {
  font-size: 0.8125rem;
  display: block;
  margin-bottom: 2px;
}

.reply-indicator-content p {
  font-size: 0.75rem;
  margin: 0;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Link Preview */
.link-preview-card {
  margin: 8px 0;
  border-radius: 12px;
  overflow: hidden;
  max-width: 100%;
}

.link-preview-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.link-preview-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.link-preview-subtitle {
  font-size: 0.75rem;
  opacity: 0.8;
}

.link-preview-content {
  padding-top: 0;
}

.link-preview-url {
  font-size: 0.75rem;
  word-break: break-all;
}

/* Animations */
@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.message-bubble:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

/* RTL Support */
[dir="rtl"] .message-incoming {
  align-self: flex-end;
}

[dir="rtl"] .message-outgoing {
  align-self: flex-start;
}

[dir="rtl"] .message-bubble-incoming {
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 4px;
}

[dir="rtl"] .message-bubble-outgoing {
  border-bottom-right-radius: 18px;
  border-bottom-left-radius: 4px;
}
</style>
