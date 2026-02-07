<template>
  <ion-popover
    :is-open="isOpen"
    :event="triggerEvent"
    @didDismiss="handleDismiss"
    alignment="center"
  >
    <div class="reaction-picker">
      <button
        v-for="emoji in quickEmojis"
        :key="emoji"
        class="reaction-emoji-button"
        @click="selectEmoji(emoji)"
      >
        {{ emoji }}
      </button>
      <button class="reaction-emoji-button more-button" @click="showMoreEmojis">
        <ion-icon :icon="add"></ion-icon>
      </button>
    </div>
  </ion-popover>
</template>

<script setup lang="ts">
import { IonPopover, IonIcon } from "@ionic/vue";
import { add } from "ionicons/icons";

const props = defineProps<{
  isOpen: boolean;
  triggerEvent?: Event;
}>();

const emit = defineEmits<{
  (e: "dismiss"): void;
  (e: "select", emoji: string): void;
  (e: "showMore"): void;
}>();

const quickEmojis = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "👏"];

function selectEmoji(emoji: string) {
  emit("select", emoji);
  handleDismiss();
}

function handleDismiss() {
  emit("dismiss");
}

function showMoreEmojis() {
  emit("showMore");
  handleDismiss();
}
</script>

<style scoped>
.reaction-picker {
  display: flex;
  gap: 4px;
  padding: 8px;
  background: var(--ion-background-color);
}

.reaction-emoji-button {
  font-size: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.1s;
}

.reaction-emoji-button:hover {
  background: var(--ion-color-light);
}

.reaction-emoji-button:active {
  transform: scale(0.9);
}

.more-button {
  background: var(--ion-color-light);
}

.more-button ion-icon {
  font-size: 24px;
}
</style>
