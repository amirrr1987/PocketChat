<template>
  <ion-page>
    <ion-menu side="start" menu-id="main-menu" content-id="main-content">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>{{ t("nav.menu") }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <!-- User Profile Section -->
        <div class="menu-profile">
          <ion-avatar class="menu-avatar" @click="navigateTo('/app/profile')">
            <img :src="userProfile.avatar" :alt="userProfile.name" />
          </ion-avatar>
          <div class="menu-user-info" @click="navigateTo('/app/profile')">
            <h3 class="menu-user-name">{{ userProfile.name }}</h3>
            <p class="menu-user-status">{{ userProfile.status }}</p>
          </div>
        </div>

        <ion-list class="menu-list">
          <ion-item button @click="navigateTo('/chats')" class="menu-item">
            <ion-icon :icon="chatbox" slot="start" color="primary"></ion-icon>
            <ion-label>{{ t("nav.chats") }}</ion-label>
          </ion-item>
          <ion-item button @click="navigateTo('/contacts')" class="menu-item">
            <ion-icon :icon="people" slot="start" color="primary"></ion-icon>
            <ion-label>{{ t("nav.contacts") }}</ion-label>
          </ion-item>
          <ion-item
            button
            @click="navigateTo('/app/settings')"
            class="menu-item"
          >
            <ion-icon :icon="settings" slot="start" color="primary"></ion-icon>
            <ion-label>{{ t("nav.settings") }}</ion-label>
          </ion-item>

          <ion-item-divider>
            <ion-label>{{ t("nav.account") }}</ion-label>
          </ion-item-divider>

          <ion-item
            button
            @click="navigateTo('/app/profile')"
            class="menu-item"
          >
            <ion-icon :icon="person" slot="start" color="primary"></ion-icon>
            <ion-label>{{ t("nav.profile") }}</ion-label>
          </ion-item>

          <ion-item button @click="logout" class="menu-item menu-item-logout">
            <ion-icon :icon="logOut" slot="start" color="danger"></ion-icon>
            <ion-label>{{ t("nav.logout") }}</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>

    <ion-router-outlet id="main-content"></ion-router-outlet>
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
  IonItemDivider,
  IonAvatar,
  IonIcon,
  IonLabel,
  menuController,
} from "@ionic/vue";
import { people, chatbox, settings, logOut, person } from "ionicons/icons";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ref } from "vue";

const { t } = useI18n();
const router = useRouter();

const userProfile = ref({
  name: "John Doe",
  status: "Available",
  avatar: "https://placehold.co/80x80/4285f4/ffffff?text=JD",
});

const navigateTo = async (path: string) => {
  await menuController.close("main-menu");
  router.push(path);
};

const logout = async () => {
  await menuController.close("main-menu");
  router.push("/auth/login");
};
</script>

<style scoped>
.menu-profile {
  display: flex;
  align-items: center;
  padding: 20px 16px;
  background: linear-gradient(
    135deg,
    var(--ion-color-primary) 0%,
    var(--ion-color-primary-shade) 100%
  );
  color: white;
  cursor: pointer;
  transition: opacity 0.2s;
}

.menu-profile:active {
  opacity: 0.8;
}

.menu-avatar {
  width: 60px;
  height: 60px;
  margin-inline-end: 12px;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.menu-user-info {
  flex: 1;
  min-width: 0;
}

.menu-user-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-user-status {
  font-size: 0.875rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-list {
  padding: 8px 0;
}

.menu-item {
  --padding-start: 20px;
  --padding-end: 20px;
  --inner-padding-end: 0;
  --min-height: 48px;
  margin-bottom: 4px;
}

.menu-item ion-icon {
  margin-inline-end: 16px;
  font-size: 1.5rem;
}

.menu-item-logout {
  margin-top: 8px;
  border-top: 1px solid var(--ion-color-light);
  padding-top: 8px;
}

ion-item-divider {
  margin-top: 8px;
  margin-bottom: 4px;
}

ion-item-divider ion-label {
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--ion-color-medium);
}
</style>
