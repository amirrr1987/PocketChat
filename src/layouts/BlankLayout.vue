<template>
  <ion-page>
    <ion-menu side="start" menu-id="main-menu" content-id="main-content">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ t("nav.menu") }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-img src="https://placehold.co/600x400" />

        <ion-list>
          <!-- add divider -->
          <ion-item button @click="navigateTo('/chats')">
            <ion-icon :icon="chatbox" slot="start"></ion-icon>
            <ion-label>{{ t("nav.chats") }}</ion-label>
          </ion-item>
          <ion-item button @click="navigateTo('/contacts')">
            <ion-icon :icon="people" slot="start"></ion-icon>
            <ion-label>{{ t("nav.contacts") }}</ion-label>
          </ion-item>
          <ion-item button @click="navigateTo('/app/settings')">
            <ion-icon :icon="settings" slot="start"></ion-icon>
            <ion-label>{{ t("nav.settings") }}</ion-label>
          </ion-item>

          <ion-item button @click="logout">
            <ion-icon :icon="logOut" slot="start"></ion-icon>
            <ion-label>{{ t("nav.logout") }}</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>

    <ion-router-outlet></ion-router-outlet>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonRouterOutlet,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  menuController,
} from "@ionic/vue";
import { people, chatbox, settings, logOut } from "ionicons/icons";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();

const navigateTo = async (path: string) => {
  await menuController.close("main-menu");
  router.push(path);
};

const logout = async () => {
  await menuController.close("main-menu");
  router.push("/auth/login");
};
</script>
