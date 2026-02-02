<template>
  <ion-page>
    <ion-menu side="start" menu-id="main-menu" content-id="main-content">
      <ion-header>
        <ion-toolbar>
          <ion-title>Menu</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-img src="https://placehold.co/600x400" />

        <ion-list>
          <!-- add divider -->
          <ion-item button @click="navigateTo('/chats')">
            <ion-icon :icon="chatbox" slot="start"></ion-icon>
            <ion-label>Chats</ion-label>
          </ion-item>
          <ion-item button @click="navigateTo('/contacts')">
            <ion-icon :icon="people" slot="start"></ion-icon>
            <ion-label>Contacts</ion-label>
          </ion-item>
          <ion-item button @click="navigateTo('/settings')">
            <ion-icon :icon="settings" slot="start"></ion-icon>
            <ion-label>Settings</ion-label>
          </ion-item>

          <ion-item button @click="logout">
            <ion-icon :icon="logOut" slot="start"></ion-icon>
            <ion-label>Logout</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>

    <ion-tabs id="main-content">
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="chats" href="/chats">
          <ion-icon aria-hidden="true" :icon="chatbox" />
          <ion-label>Chats</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="contacts" href="/contacts">
          <ion-icon aria-hidden="true" :icon="people" />
          <ion-label>Contacts</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonLabel,
  IonIcon,
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
  IonImg,
} from "@ionic/vue";
import { people, chatbox, settings, logOut } from "ionicons/icons";
import { useRouter } from "vue-router";

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
