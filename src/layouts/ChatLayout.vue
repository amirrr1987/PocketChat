<template>
  <ion-page>
    <!-- Header با اطلاعات تماس -->
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/chats"></ion-back-button>
          <ion-avatar class="ion-margin-start">
            <img :src="contactAvatar" :alt="contactName" />
          </ion-avatar>
        </ion-buttons>

        <ion-title>
          <div class="ion-text-left">
            <h2 class="ion-no-margin ion-text-wrap">{{ contactName }}</h2>
            <ion-note color="medium">{{ contactStatus }}</ion-note>
          </div>
        </ion-title>

        <ion-buttons slot="end">
          <ion-button fill="clear" size="default">
            <ion-icon :icon="call" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button fill="clear" size="default">
            <ion-icon :icon="ellipsisVertical" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <!-- محتوای چت -->
    <ion-content :fullscreen="true" class="chat-content">
      <ion-router-outlet />
    </ion-content>

    <!-- Footer با نوار ورودی پیام -->
    <ion-footer>
      <ion-toolbar>
        <!-- Pinned Message Banner -->
        <ion-item
          v-if="pinnedMessage"
          color="light"
          lines="none"
          class="pinned-message"
        >
          <ion-icon :icon="pin" slot="start" color="primary"></ion-icon>
          <ion-label>
            <h3>{{ t("chat.pinnedMessage") }}</h3>
            <p>{{ pinnedMessage.link }}</p>
          </ion-label>
          <ion-button fill="clear" slot="end" @click="dismissPinned">
            <ion-icon :icon="close" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-item>

        <!-- Message Input Area -->
        <div class="message-input-container">
          <ion-button fill="clear" class="emoji-button">
            <ion-icon :icon="happy" slot="icon-only"></ion-icon>
          </ion-button>

          <ion-input
            v-model="messageText"
            :placeholder="t('chat.typeMessage')"
            class="message-input"
            @keyup.enter="sendMessage"
          ></ion-input>

          <ion-button
            v-if="messageText.trim()"
            fill="clear"
            @click="sendMessage"
            class="send-button"
          >
            <ion-icon :icon="send" slot="icon-only" color="primary"></ion-icon>
          </ion-button>
          <ion-button v-else fill="clear" class="attach-button">
            <ion-icon :icon="attach" slot="icon-only"></ion-icon>
          </ion-button>

          <ion-button fill="clear" class="mic-button">
            <ion-icon :icon="mic" slot="icon-only"></ion-icon>
          </ion-button>
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
  IonLabel,
  IonNote,
  IonIcon,
  IonItem,
  IonInput,
  IonRouterOutlet,
} from "@ionic/vue";
import {
  call,
  ellipsisVertical,
  pin,
  close,
  happy,
  attach,
  mic,
  send,
} from "ionicons/icons";
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// Props برای اطلاعات تماس
const contactName = ref("+98 939 195 9469");
const contactStatus = computed(() => t("chat.connecting"));
const contactAvatar = ref("https://placehold.co/40x40/4285f4/ffffff?text=AM");

// Pinned Message
const pinnedMessage = ref<{ link: string } | null>({
  link: "https://meet.google.com/hxi-kcct-kks",
});

const dismissPinned = () => {
  pinnedMessage.value = null;
};

const messageText = ref("");

const sendMessage = () => {
  if (messageText.value.trim()) {
    // Emit event or handle message sending
    messageText.value = "";
  }
};
</script>

<style scoped>
.chat-content {
  --background: var(--ion-background-color);
}

.pinned-message {
  --padding-start: 0;
  --padding-end: 0;
  --inner-padding-end: 0;
  margin-bottom: 4px;
}

.pinned-message ion-label h3 {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 2px;
}

.pinned-message ion-label p {
  font-size: 0.75rem;
  color: var(--ion-color-medium);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-input-container {
  display: flex;
  align-items: center;
  padding: 8px 4px;
  gap: 4px;
}

.message-input {
  flex: 1;
  --padding-start: 12px;
  --padding-end: 12px;
  --background: var(--ion-color-light);
  --border-radius: 24px;
  --min-height: 40px;
  margin: 0 4px;
  transition: all 0.2s ease-in-out;
}

.message-input:focus-within {
  --background: var(--ion-background-color);
  box-shadow: 0 0 0 2px var(--ion-color-primary-tint);
}

.emoji-button,
.attach-button,
.mic-button,
.send-button {
  --padding-start: 8px;
  --padding-end: 8px;
  margin: 0;
  transition: transform 0.1s ease-out, opacity 0.1s ease-out;
}

.emoji-button:active,
.attach-button:active,
.mic-button:active,
.send-button:active {
  transform: scale(0.95);
  opacity: 0.8;
}

ion-title {
  padding-inline-start: 0;
  padding-inline-end: 0;
}

ion-title h2 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 2px;
}

ion-title ion-note {
  font-size: 0.75rem;
}

ion-avatar {
  width: 36px;
  height: 36px;
}
</style>
