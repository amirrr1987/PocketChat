<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleDismiss">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ t('chat.sendFile') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleDismiss">
            <ion-icon :icon="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="file-preview-content">
      <div class="preview-container">
        <div v-if="isImage" class="image-preview">
          <img :src="fileUrl" :alt="fileName" />
        </div>
        <div v-else class="file-info-preview">
          <ion-icon :icon="document" class="large-file-icon"></ion-icon>
          <p class="file-name">{{ fileName }}</p>
          <p class="file-size">{{ formatFileSize(fileSize) }}</p>
        </div>
      </div>
      <div class="caption-input-wrapper">
        <ion-item lines="none">
          <ion-input
            v-model="caption"
            :placeholder="t('chat.addCaption')"
            class="caption-input"
          ></ion-input>
        </ion-item>
      </div>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <div class="footer-buttons">
          <ion-button expand="block" color="primary" @click="handleSend" :disabled="isSending">
            <ion-spinner v-if="isSending" name="crescent"></ion-spinner>
            <span v-else>{{ t('chat.send') }}</span>
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonFooter,
  IonItem,
  IonInput,
  IonSpinner,
} from "@ionic/vue";
import { close, document } from "ionicons/icons";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  isOpen: boolean;
  file: File | null;
}>();

const emit = defineEmits<{
  (e: "dismiss"): void;
  (e: "send", caption: string): void;
}>();

const caption = ref("");
const fileUrl = ref("");
const isSending = ref(false);

const fileName = computed(() => props.file?.name ?? "");
const fileSize = computed(() => props.file?.size ?? 0);
const isImage = computed(() => props.file?.type.startsWith("image/") ?? false);

watch(() => props.file, (newFile) => {
  if (newFile && isImage.value) {
    const reader = new FileReader();
    reader.onload = (e) => {
      fileUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(newFile);
  }
}, { immediate: true });

function handleDismiss() {
  caption.value = "";
  fileUrl.value = "";
  isSending.value = false;
  emit("dismiss");
}

function handleSend() {
  isSending.value = true;
  emit("send", caption.value);
  setTimeout(() => {
    handleDismiss();
  }, 500);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
</script>

<style scoped>
.file-preview-content {
  --padding-top: 16px;
  --padding-bottom: 16px;
}

.preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  min-height: 300px;
}

.image-preview {
  width: 100%;
  max-width: 400px;
}

.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.file-info-preview {
  text-align: center;
}

.large-file-icon {
  font-size: 80px;
  color: var(--ion-color-primary);
  margin-bottom: 16px;
}

.file-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ion-text-color);
  margin: 0 0 8px 0;
  word-break: break-word;
}

.file-size {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  margin: 0;
}

.caption-input-wrapper {
  padding: 16px;
}

.caption-input {
  --background: var(--ion-color-light);
  --padding-start: 16px;
  --padding-end: 16px;
  border-radius: 24px;
}

.footer-buttons {
  padding: 12px 16px;
}

.footer-buttons ion-button {
  margin: 0;
}
</style>
