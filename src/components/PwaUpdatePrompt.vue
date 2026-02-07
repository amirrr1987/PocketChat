<template>
  <!-- Handles UI via composable callbacks; no visible markup needed -->
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useI18n } from "vue-i18n";
import { alertController, toastController } from "@ionic/vue";
import { usePwaUpdate } from "@/composables/usePwaUpdate";

const { t } = useI18n();

const { needRefresh, offlineReady, updateServiceWorker, close } = usePwaUpdate({
  checkIntervalMs: 60 * 60 * 1000,
  onNeedRefresh() {
    showUpdateAlert();
  },
  onOfflineReady() {
    showOfflineReadyToast();
  },
});

async function showUpdateAlert() {
  const alert = await alertController.create({
    message: t("pwa.updateAvailable"),
    backdropDismiss: false,
    buttons: [
      {
        text: t("pwa.later"),
        role: "cancel",
        handler: () => {
          close();
        },
      },
      {
        text: t("pwa.updateNow"),
        handler: () => {
          void updateServiceWorker(true);
        },
      },
    ],
  });
  await alert.present();
}

async function showOfflineReadyToast() {
  const toast = await toastController.create({
    message: t("pwa.offlineReady"),
    duration: 3000,
    color: "success",
  });
  await toast.present();
  close();
}
</script>
