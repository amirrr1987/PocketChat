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
          <div class="message-bubble message-bubble-incoming" @click="handleMessageClick(message)" @contextmenu.prevent="openMessageMenu(message)">
            <div
              v-if="isGroupChat && message.senderName"
              class="message-sender-name"
            >
              {{ message.senderName }}
            </div>
            <div v-if="message.replyTo" class="reply-indicator">
              <div class="reply-indicator-bar"></div>
              <div class="reply-indicator-content">
                <ion-text color="primary">
                  <strong>{{ message.replyTo.senderName }}</strong>
                </ion-text>
                <p>{{ message.replyTo.text }}</p>
              </div>
            </div>
            <div v-if="message.fileUrl" class="message-file">
              <img
                v-if="message.fileType === 'image'"
                :src="message.thumbnailUrl || message.fileUrl"
                :alt="message.text"
                class="message-image"
              />
              <div v-else class="message-file-info">
                <ion-icon :icon="document" class="file-icon"></ion-icon>
                <span>{{ message.text }}</span>
              </div>
            </div>
            <div v-else class="message-text">{{ message.text }}</div>
            <div
              v-if="message.reactions && message.reactions.size > 0"
              class="message-reactions"
            >
              <span
                v-for="[emoji, data] in message.reactions"
                :key="emoji"
                class="reaction-bubble"
                @click="toggleReaction(message, emoji)"
              >
                {{ emoji }} {{ data.count }}
              </span>
              <button class="reaction-add-button" @click="openReactionPicker($event, message)">
                +
              </button>
            </div>
            <div v-else class="message-reactions">
              <button class="reaction-add-button reaction-add-button-small" @click="openReactionPicker($event, message)">
                +
              </button>
            </div>
            <div class="message-time">
              <ion-note>{{ message.time }}</ion-note>
            </div>
          </div>
        </div>

        <!-- پیام‌های خروجی (راست) -->
        <div v-else class="message-wrapper message-outgoing">
          <div class="message-bubble message-bubble-outgoing" @click="handleMessageClick(message)" @contextmenu.prevent="openMessageMenu(message)">
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
            <div v-if="message.fileUrl" class="message-file">
              <img
                v-if="message.fileType === 'image'"
                :src="message.thumbnailUrl || message.fileUrl"
                :alt="message.text"
                class="message-image"
              />
              <div v-else class="message-file-info">
                <ion-icon :icon="document" class="file-icon"></ion-icon>
                <span>{{ message.text }}</span>
              </div>
            </div>
            <div v-else class="message-text message-text-outgoing">
              {{ message.text }}
            </div>
            <div
              v-if="message.reactions && message.reactions.size > 0"
              class="message-reactions"
            >
              <span
                v-for="[emoji, data] in message.reactions"
                :key="emoji"
                class="reaction-bubble reaction-bubble-outgoing"
                @click="toggleReaction(message, emoji)"
              >
                {{ emoji }} {{ data.count }}
              </span>
              <button class="reaction-add-button reaction-add-button-outgoing" @click="openReactionPicker($event, message)">
                +
              </button>
            </div>
            <div v-else class="message-reactions">
              <button class="reaction-add-button reaction-add-button-small reaction-add-button-outgoing" @click="openReactionPicker($event, message)">
                +
              </button>
            </div>
            <div class="message-footer">
              <ion-note color="light" class="message-time-outgoing">{{
                message.time
              }}</ion-note>
              <ion-icon
                v-if="
                  message.read || (message.readBy && message.readBy.length > 0)
                "
                :icon="checkmarkDone"
                class="read-status-icon read-status-read"
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
    <MessageReactionPicker
      :is-open="showReactionPicker"
      :trigger-event="reactionPickerEvent"
      @dismiss="showReactionPicker = false"
      @select="handleReactionSelect"
      @showMore="handleShowMoreEmojis"
    />
    <EmojiPicker
      :is-open="showFullEmojiPicker"
      @dismiss="showFullEmojiPicker = false"
      @select="handleFullEmojiSelect"
    />
    <MessageMenu
      :is-open="showMessageMenu"
      :header="selectedMessage?.senderName"
      :options="messageMenuOptions"
      @dismiss="showMessageMenu = false"
      @reply="handleReply"
      @edit="handleEdit"
      @delete="handleDelete"
      @copy="handleCopy"
      @forward="handleForward"
      @react="handleReactFromMenu"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  inject,
  nextTick,
  type Ref,
} from "vue";
import { useRoute } from "vue-router";
import {
  IonAvatar,
  IonText,
  IonNote,
  IonIcon,
  IonSpinner,
  IonButton,
} from "@ionic/vue";
import {
  checkmark,
  checkmarkDone,
  warningOutline,
  chatbubbleOutline,
  document,
} from "ionicons/icons";
import { useI18n } from "vue-i18n";
import { fetchChatById, type GroupChat, type SingleChat } from "@/api/chats";
import {
  fetchMessagesBySingleChat,
  fetchMessagesByGroup,
  uploadFile,
  type Message,
} from "@/api/messages";
import { getAuthUser, type ApiError } from "@/api/client";
import { useChatSocket } from "@/composables/useChatSocket";
import MessageReactionPicker from "@/components/MessageReactionPicker.vue";
import EmojiPicker from "@/components/EmojiPicker.vue";
import MessageMenu from "@/components/MessageMenu.vue";
import type { MessageMenuOptions } from "@/components/MessageMenu.vue";

interface DisplayMessage {
  id: string;
  isOutgoing: boolean;
  text: string;
  time: string;
  read: boolean;
  senderName: string;
  avatar: string;
  replyTo?: { senderName: string; text: string };
  reactions?: Map<string, { count: number; userIds: string[] }>;
  readBy?: string[];
  fileUrl?: string | null;
  fileType?: string | null;
  thumbnailUrl?: string | null;
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

const chatSocket = useChatSocket();
const joinedRoom = ref<{ singleChatId?: string; groupId?: string } | null>(null);
const typingUsers = ref<Set<string>>(new Set());

// Reaction UI
const showReactionPicker = ref(false);
const reactionPickerEvent = ref<Event | undefined>();
const selectedMessageForReaction = ref<DisplayMessage | null>(null);
const showFullEmojiPicker = ref(false);

// Message Menu
const showMessageMenu = ref(false);
const selectedMessage = ref<DisplayMessage | null>(null);
const messageMenuOptions = computed<MessageMenuOptions>(() => ({
  canEdit: selectedMessage.value?.isOutgoing ?? false,
  canDelete: selectedMessage.value?.isOutgoing ?? false,
  canReply: true,
  canForward: true,
  canCopy: !!selectedMessage.value?.text,
  canReact: true,
}));

const isGroupChat = computed(() => !!chatMeta.value?.groupId);
const typingText = computed(() => {
  if (typingUsers.value.size === 0) return "";
  const users = Array.from(typingUsers.value);
  if (users.length === 1) {
    return `${users[0]} ${t("chat.isTyping")}`;
  }
  if (users.length === 2) {
    return `${users[0]} ${t("chat.and")} ${users[1]} ${t("chat.areTyping")}`;
  }
  return `${users.length} ${t("chat.peopleAreTyping")}`;
});

// Message handlers (defined early for template usage)
function openReactionPicker(event: Event, message: DisplayMessage) {
  event.stopPropagation();
  selectedMessageForReaction.value = message;
  reactionPickerEvent.value = event;
  showReactionPicker.value = true;
}

function toggleReaction(message: DisplayMessage, emoji: string) {
  if (!chatMeta.value || !currentUser) return;
  const reactionData = message.reactions?.get(emoji);
  const hasReacted = reactionData?.userIds.includes(currentUser.id);
  if (hasReacted) {
    chatSocket.unreactToMessage(message.id, emoji, chatMeta.value);
  } else {
    chatSocket.reactToMessage(message.id, emoji, chatMeta.value);
  }
}

function handleMessageClick() {
  // For now, do nothing on single click
}

function openMessageMenu(message: DisplayMessage) {
  selectedMessage.value = message;
  showMessageMenu.value = true;
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    read: false,
    senderName,
    avatar: `https://placehold.co/40x40/ea4335/ffffff?text=${encodeURIComponent(initial)}`,
    reactions: new Map(),
    readBy: [],
    fileUrl: m.fileUrl,
    fileType: m.fileType,
    thumbnailUrl: m.thumbnailUrl,
  };
}

async function loadChatAndMessages() {
  const id = chatId.value;
  if (!id) return;
  isLoading.value = true;
  loadError.value = "";
  messages.value = [];
  chatMeta.value = null;
  if (joinedRoom.value) {
    chatSocket.leaveChat(joinedRoom.value);
    joinedRoom.value = null;
  }
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
    setTimeout(() => scrollToBottom?.(), 150);

    if (chatMeta.value && currentUser) {
      // Mark chat as read when opened
      chatSocket.markChatAsRead(chatMeta.value);
      
      chatSocket.connect({
        onMessageNew(msg: Message) {
          messages.value = [...messages.value, toDisplayMessage(msg)];
          nextTick().then(() => {
            setTimeout(() => scrollToBottom?.(), 100);
          });
          // Auto mark as read if we're in the chat
          if (chatMeta.value && msg.senderId !== currentUser?.id) {
            setTimeout(() => {
              chatSocket.markMessageAsRead(msg.id, chatMeta.value!);
            }, 1000);
          }
        },
        onMessageEdited(msg: Message) {
          const idx = messages.value.findIndex((m) => m.id === msg.id);
          if (idx !== -1) {
            const next = [...messages.value];
            next[idx] = toDisplayMessage(msg);
            messages.value = next;
          }
        },
        onMessageDeleted(payload: { messageId: string }) {
          messages.value = messages.value.filter(
            (m) => m.id !== payload.messageId
          );
        },
        onMessageReadBy(payload) {
          const msg = messages.value.find((m) => m.id === payload.messageId);
          if (msg && !msg.readBy?.includes(payload.userId)) {
            msg.readBy = [...(msg.readBy || []), payload.userId];
            if (msg.isOutgoing) {
              msg.read = true;
            }
          }
        },
        onMessageReactionAdded(payload) {
          const msg = messages.value.find((m) => m.id === payload.messageId);
          if (msg) {
            if (!msg.reactions) msg.reactions = new Map();
            const existing = msg.reactions.get(payload.emoji);
            if (existing) {
              existing.userIds.push(payload.userId);
              existing.count = existing.userIds.length;
            } else {
              msg.reactions.set(payload.emoji, {
                count: 1,
                userIds: [payload.userId],
              });
            }
          }
        },
        onMessageReactionRemoved(payload) {
          const msg = messages.value.find((m) => m.id === payload.messageId);
          if (msg?.reactions) {
            const existing = msg.reactions.get(payload.emoji);
            if (existing) {
              existing.userIds = existing.userIds.filter(
                (id) => id !== payload.userId
              );
              existing.count = existing.userIds.length;
              if (existing.count === 0) {
                msg.reactions.delete(payload.emoji);
              }
            }
          }
        },
        onTypingStart(payload: { userId: string; username: string }) {
          if (payload.userId !== currentUser?.id) {
            typingUsers.value.add(payload.username);
          }
        },
        onTypingStop() {
          typingUsers.value.clear();
        },
        onError(payload: { message: string }) {
          loadError.value = payload.message;
        },
      });
      chatSocket.joinChat(chatMeta.value);
      joinedRoom.value = { ...chatMeta.value };
    }
  } catch (e) {
    console.error("ChatPage: load chat/messages failed", e);
    const msg =
      e &&
      typeof e === "object" &&
      "message" in e &&
      typeof (e as ApiError).message === "string"
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

const sendHandlerRef = inject<Ref<((text: string) => void) | null> | null>(
  "chatSendHandler",
  null
);

const fileHandlerRef = inject<Ref<((file: File) => void) | null> | null>(
  "chatFileHandler",
  null
);

const typingSenderRef = inject<Ref<((isTypingNow: boolean) => void) | null> | null>(
  "chatTypingSender",
  null
);

const replyToRef = inject<Ref<{ id: string; text: string; senderName: string } | null>>(
  "chatReplyTo",
  ref<{ id: string; text: string; senderName: string } | null>(null)
);

const editingRef = inject<Ref<{ id: string; text: string } | null>>(
  "chatEditing",
  ref<{ id: string; text: string } | null>(null)
);

onMounted(() => {
  if (sendHandlerRef) {
    sendHandlerRef.value = (text: string) => {
      if (!currentUser || !chatMeta.value) return;
      
      // Check if editing
      const editing = editingRef.value;
      if (editing) {
        chatSocket.editMessage(editing.id, text, chatMeta.value);
        editingRef.value = null;
        return;
      }
      
      // Send new message
      const parentId = replyToRef.value?.id;
      chatSocket.sendMessage(text, {
        singleChatId: chatMeta.value.singleChatId,
        groupId: chatMeta.value.groupId,
        parentMessageId: parentId,
      });
      replyToRef.value = null;
    };
  }
  if (fileHandlerRef) {
    fileHandlerRef.value = async (file: File) => {
      if (!currentUser || !chatMeta.value) return;
      try {
        await uploadFile(file, {
          singleChatId: chatMeta.value.singleChatId,
          groupId: chatMeta.value.groupId,
        });
      } catch (e) {
        console.error("File upload failed:", e);
        loadError.value = e instanceof Error ? e.message : "Upload failed";
      }
    };
  }
});

onBeforeUnmount(() => {
  if (joinedRoom.value) {
    chatSocket.leaveChat(joinedRoom.value);
    joinedRoom.value = null;
  }
});

function handleReactionSelect(emoji: string) {
  if (!selectedMessageForReaction.value || !chatMeta.value) return;
  const message = selectedMessageForReaction.value;
  chatSocket.reactToMessage(message.id, emoji, chatMeta.value);
}

function handleShowMoreEmojis() {
  showFullEmojiPicker.value = true;
}

function handleFullEmojiSelect(emoji: string) {
  if (!selectedMessageForReaction.value || !chatMeta.value) return;
  const message = selectedMessageForReaction.value;
  chatSocket.reactToMessage(message.id, emoji, chatMeta.value);
}

function handleReply() {
  const msg = selectedMessage.value;
  if (!msg) return;
  replyToRef.value = {
    id: msg.id,
    text: msg.text,
    senderName: msg.senderName,
  };
}

function handleEdit() {
  const msg = selectedMessage.value;
  if (!msg) return;
  editingRef.value = {
    id: msg.id,
    text: msg.text,
  };
}

function handleDelete() {
  if (!selectedMessage.value || !chatMeta.value) return;
  chatSocket.deleteMessage(selectedMessage.value.id, chatMeta.value);
}

function handleCopy() {
  if (!selectedMessage.value) return;
  navigator.clipboard.writeText(selectedMessage.value.text);
}

function handleForward() {
  console.log("Forward message:", selectedMessage.value);
  // Future implementation
}

function handleReactFromMenu() {
  if (!selectedMessage.value) return;
  selectedMessageForReaction.value = selectedMessage.value;
  showFullEmojiPicker.value = true;
}
</script>

<style scoped>
.chat-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.messages-container {
  min-height: 100vh;
  padding: 16px 12px 120px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: flex-end;
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
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
  transition:
    transform 0.1s ease-out,
    box-shadow 0.1s ease-out;
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

.read-status-read {
  color: #4fc3f7;
}

.message-reactions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.reaction-bubble {
  background: rgba(0, 0, 0, 0.08);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.reaction-bubble:hover {
  background: rgba(0, 0, 0, 0.12);
}

.reaction-bubble-outgoing {
  background: rgba(255, 255, 255, 0.2);
}

.reaction-bubble-outgoing:hover {
  background: rgba(255, 255, 255, 0.3);
}

.message-file {
  margin-bottom: 4px;
}

.message-image {
  max-width: 250px;
  max-height: 300px;
  border-radius: 8px;
  cursor: pointer;
}

.message-file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.file-icon {
  font-size: 24px;
  color: var(--ion-color-primary);
}

.reaction-add-button {
  background: rgba(0, 0, 0, 0.05);
  border: 1px dashed rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  cursor: pointer;
  transition: all 0.2s;
}

.reaction-add-button:hover {
  background: rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.3);
}

.reaction-add-button-small {
  opacity: 0.5;
  padding: 2px 8px;
  font-size: 0.75rem;
}

.reaction-add-button-outgoing {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  color: var(--ion-color-primary-contrast);
}

.reaction-add-button-outgoing:hover {
  background: rgba(255, 255, 255, 0.25);
}

.typing-indicator {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ion-color-medium);
  font-size: 0.875rem;
  font-style: italic;
}

.typing-text {
  flex-shrink: 0;
}

.typing-dots {
  display: flex;
  gap: 3px;
}

.typing-dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--ion-color-medium);
  animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
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
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.06);
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
