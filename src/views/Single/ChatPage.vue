<template>
  <div class="chat-page">
    <!-- Loading -->
    <div v-if="isLoading" class="state-container">
      <ion-spinner name="crescent"></ion-spinner>
      <p class="state-text">{{ t("chat.loading") }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="state-container">
      <ion-icon :icon="warningOutline" class="state-icon"></ion-icon>
      <p class="state-text">{{ loadError }}</p>
      <ion-button fill="outline" size="small" @click="loadChatAndMessages">
        {{ t("chat.retry") }}
      </ion-button>
    </div>

    <!-- Empty -->
    <div v-else-if="messages.length === 0" class="state-container state-empty">
      <ion-icon :icon="chatbubbleOutline" class="state-icon"></ion-icon>
      <p class="state-text">{{ t("chat.noMessages") }}</p>
      <p class="state-hint">{{ t("chat.noMessagesHint") }}</p>
    </div>

    <!-- Messages -->
    <div v-else class="messages-container">
      <template v-for="message in messages" :key="message.id">
        <!-- Incoming -->
        <div
          v-if="!message.isOutgoing"
          class="message-wrapper message-incoming"
        >
          <ion-avatar class="message-avatar">
            <img :src="message.avatar" :alt="message.senderName" />
          </ion-avatar>
          <div class="message-bubble message-bubble-incoming">
            <div v-if="isGroupChat && message.senderName" class="message-sender-name">{{ message.senderName }}</div>
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
import { ref, computed, onMounted, watch, inject, nextTick, type Ref } from "vue";
import { useRoute } from "vue-router";
import {
  IonAvatar,
  IonText,
  IonNote,
  IonIcon,
  IonSpinner,
  IonButton,
} from "@ionic/vue";
import { checkmark, checkmarkDone, warningOutline, chatbubbleOutline } from "ionicons/icons";
import { useI18n } from "vue-i18n";
import { fetchChatById, type GroupChat, type SingleChat } from "@/api/chats";
import {
  fetchMessagesBySingleChat,
  fetchMessagesByGroup,
  createMessage,
  type Message,
} from "@/api/messages";
import { getAuthUser, type ApiError } from "@/api/client";

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

const { t } = useI18n();
const route = useRoute();
const chatId = computed(() => route.params.id as string);

const currentUser = getAuthUser();
const messages = ref<DisplayMessage[]>([]);
const isLoading = ref(true);
const loadError = ref("");
const chatMeta = ref<{ singleChatId?: string; groupId?: string } | null>(null);
const scrollToBottom = inject<(() => void) | null>("chatScrollToBottom", null);

const isGroupChat = computed(() => !!chatMeta.value?.groupId);

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
  loadError.value = "";
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
    await nextTick();
    scrollToBottom?.();
  } catch (e) {
    console.error("ChatPage: load chat/messages failed", e);
    const msg =
      e && typeof e === "object" && "message" in e && typeof (e as ApiError).message === "string"
        ? (e as ApiError).message
        : t("chat.loadError");
    loadError.value = msg;
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
      await nextTick();
      scrollToBottom?.();
    } catch (e) {
      console.error("Send message failed:", e);
    }
  };
});
</script>

<style scoped>
.chat-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.messages-container {
  padding: 16px 12px 80px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.state-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}

.state-container.state-empty {
  justify-content: center;
}

.state-icon {
  font-size: 64px;
  color: var(--ion-color-medium);
  opacity: 0.6;
  margin-bottom: 16px;
}

.state-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ion-text-color);
  margin: 0 0 8px 0;
}

.state-hint {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  margin: 0;
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
