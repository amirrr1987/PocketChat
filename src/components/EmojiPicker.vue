<template>
  <ion-modal
    :is-open="isOpen"
    @didDismiss="handleDismiss"
    :initial-breakpoint="0.5"
    :breakpoints="[0, 0.5, 0.75]"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ t('chat.selectEmoji') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleDismiss">
            <ion-icon :icon="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          v-model="searchQuery"
          :placeholder="t('chat.searchEmoji')"
          @ionInput="handleSearch"
        ></ion-searchbar>
      </ion-toolbar>
    </ion-header>
    <ion-content class="emoji-content">
      <div class="emoji-grid">
        <button
          v-for="emoji in filteredEmojis"
          :key="emoji"
          class="emoji-button"
          @click="selectEmoji(emoji)"
        >
          {{ emoji }}
        </button>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonContent,
} from "@ionic/vue";
import { close } from "ionicons/icons";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "dismiss"): void;
  (e: "select", emoji: string): void;
}>();

const searchQuery = ref("");

const allEmojis = [
  // Smileys
  "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊",
  "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪",
  "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏",
  "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕",
  "🤢", "🤮", "🤧", "🥵", "🥶", "😶‍🌫️", "😵", "🤯", "🤠", "🥳", "😎", "🤓",
  // Gestures & hands
  "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇",
  "☝️", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💪", "🦾", "🦿", "🦵",
  // Hearts
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "💕",
  "💞", "💓", "💗", "💖", "💘", "💝", "💟",
  // Objects
  "💬", "💭", "🗨️", "🗯️", "💤", "💢", "💥", "💫", "💦", "💨", "🕳️", "💣",
  "💬", "👁️‍🗨️", "🗨️", "🗯️", "💬",
  // Symbols
  "✅", "❌", "⭕", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤",
  "🔺", "🔻", "🔸", "🔹", "🔶", "🔷", "🔘", "⏸️", "⏯️", "⏹️", "⏺️", "⏏️",
  // Flags
  "🏁", "🚩", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏴‍☠️",
];

const filteredEmojis = computed(() => {
  if (!searchQuery.value.trim()) return allEmojis;
  return allEmojis;
});

function selectEmoji(emoji: string) {
  emit("select", emoji);
  handleDismiss();
}

function handleDismiss() {
  emit("dismiss");
  searchQuery.value = "";
}

function handleSearch() {
  // Simple implementation - in production use emoji names/keywords
}
</script>

<style scoped>
.emoji-content {
  --padding-top: 16px;
  --padding-bottom: 16px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
  gap: 8px;
  padding: 16px;
}

.emoji-button {
  font-size: 32px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-button:hover {
  background: var(--ion-color-light);
}

.emoji-button:active {
  transform: scale(0.95);
}
</style>
