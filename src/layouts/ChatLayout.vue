<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" :text="''"></ion-back-button>
          <ion-avatar class="header-avatar">
            <img v-if="contactAvatar" :src="contactAvatar" :alt="contactName" />
            <ion-spinner v-else-if="headerLoading" name="crescent"></ion-spinner>
          </ion-avatar>
        </ion-buttons>

        <ion-title class="ion-text-start header-title">
          <span class="header-name">{{ contactName || t('chat.loading') }}</span>
          <span v-if="contactName" class="header-status-row">
            <span
              class="status-dot"
              :class="isContactOnline ? 'status-dot-online' : 'status-dot-offline'"
              :title="isContactOnline ? t('chat.online') : t('chat.offline')"
              aria-hidden="true"
            ></span>
          </span>
        </ion-title>

        <ion-buttons slot="end">
          <ion-button fill="clear" size="small" aria-label="Call">
            <ion-icon :icon="call" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button fill="clear" size="small" aria-label="More">
            <ion-icon :icon="ellipsisVertical" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content ref="contentRef" :fullscreen="true" class="chat-content">
      <ion-router-outlet />
    </ion-content>

    <ion-footer class="ion-no-border footer-toolbar">
      <ion-toolbar>
        <div class="message-input-wrapper">
          <ion-item lines="none" class="message-input-item">
            <ion-button fill="clear" slot="start" class="input-action-btn" aria-label="Emoji">
              <ion-icon :icon="happy"></ion-icon>
            </ion-button>
            <ion-input
              v-model="messageText"
              :placeholder="t('chat.typeMessage')"
              class="message-input"
              enterkeyhint="send"
              @keyup.enter.exact.prevent="sendMessage"
            ></ion-input>
            <ion-button
              v-if="messageText.trim()"
              fill="clear"
              slot="end"
              class="input-action-btn send-btn"
              @click="sendMessage"
              aria-label="Send"
            >
              <ion-icon :icon="send" color="primary"></ion-icon>
            </ion-button>
            <ion-button v-else fill="clear" slot="end" class="input-action-btn" aria-label="Attach">
              <ion-icon :icon="attach"></ion-icon>
            </ion-button>
          </ion-item>
        </div>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonButtons,
  IonButton,
  IonBackButton,
  IonAvatar,
  IonIcon,
  IonItem,
  IonInput,
  IonRouterOutlet,
  IonSpinner,
} from "@ionic/vue";
import {
  call,
  ellipsisVertical,
  happy,
  attach,
  send,
} from "ionicons/icons";
import { ref, computed, watch, provide } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { fetchChatById, type GroupChat, type SingleChat } from "@/api/chats";
import { getAuthUser } from "@/api/client";

const { t } = useI18n();
const route = useRoute();

const contactName = ref("");
const headerLoading = ref(true);
/** When true show green dot, else gray. Can be wired to presence API later. */
const isContactOnline = ref(false);
const contactAvatar = ref("");

const chatId = computed(() => route.params.id as string);

async function loadChat() {
  const id = chatId.value;
  if (!id) return;
  headerLoading.value = true;
  contactName.value = "";
  contactAvatar.value = "";
  try {
    const chat = await fetchChatById(id);
    if ("title" in chat) {
      const g = chat as GroupChat;
      contactName.value = g.title;
      const initial = (g.owner?.username ?? g.title).slice(0, 2).toUpperCase();
      contactAvatar.value = `https://placehold.co/40x40/4285f4/ffffff?text=${encodeURIComponent(initial)}`;
    } else {
      const s = chat as SingleChat;
      const me = getAuthUser();
      const other = me?.id === s.user1Id ? s.user2 : s.user1;
      contactName.value = other?.username ?? "";
      const initial = (other?.username ?? "?").slice(0, 2).toUpperCase();
      contactAvatar.value = `https://placehold.co/40x40/ea4335/ffffff?text=${encodeURIComponent(initial)}`;
    }
  } catch {
    contactName.value = t("chat.loadError");
  } finally {
    headerLoading.value = false;
  }
}

watch(chatId, loadChat, { immediate: true });

const messageText = ref("");

const sendHandlerRef = ref<((text: string) => void) | null>(null);
provide("chatSendHandler", sendHandlerRef);

const contentRef = ref<HTMLElement | { $el?: HTMLElement } | null>(null);
function scrollToBottom() {
  const raw = contentRef.value;
  const el = (raw && typeof raw === "object" && "$el" in raw ? (raw as { $el?: HTMLElement }).$el : raw) as (HTMLElement & { getScrollElement?(): Promise<HTMLElement> }) | null | undefined;
  const getScroll = el && typeof el?.getScrollElement === "function" ? el.getScrollElement : null;
  if (getScroll) {
    getScroll().then((scrollEl) => {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    });
  }
}
provide("chatScrollToBottom", scrollToBottom);

const sendMessage = () => {
  const text = messageText.value.trim();
  if (!text) return;
  sendHandlerRef.value?.(text);
  messageText.value = "";
};
</script>

<style scoped>
.chat-content {
  --background: var(--ion-background-color);
}

.header-avatar {
  width: 36px;
  height: 36px;
  margin-inline-start: 8px;
}

.header-avatar ion-spinner {
  width: 24px;
  height: 24px;
}

.header-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-inline-start: 0;
  padding-inline-end: 0;
  min-width: 0;
}

.header-name {
  font-size: 1rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.header-status-row {
  display: flex;
  align-items: center;
  margin-top: 2px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot-online {
  background-color: var(--ion-color-success);
}

.status-dot-offline {
  background-color: var(--ion-color-medium);
}

.footer-toolbar {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.message-input-wrapper {
  padding: 8px 0;
  padding-inline: 8px;
}

.message-input-item {
  --background: var(--ion-color-light);
  --border-radius: 24px;
  --padding-start: 4px;
  --padding-end: 4px;
  --inner-padding-end: 4px;
  --min-height: 48px;
  border-radius: 24px;
  margin: 0;
}

.message-input {
  --padding-top: 12px;
  --padding-bottom: 12px;
  --padding-start: 12px;
  --padding-end: 12px;
  font-size: 1rem;
}

.input-action-btn {
  --padding-start: 8px;
  --padding-end: 8px;
  margin: 0;
  min-width: 44px;
  min-height: 44px;
}

.send-btn ion-icon {
  font-size: 1.5rem;
}

[dir="rtl"] .header-title {
  align-items: flex-end;
}
</style>
