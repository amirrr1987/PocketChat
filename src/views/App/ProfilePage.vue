<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button menu="main-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ t("profile.title") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleEdit">
            <ion-icon :icon="create"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ t("profile.title") }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Profile Header -->
      <div class="profile-header">
        <ion-avatar class="profile-avatar">
          <img :src="userProfile.avatar" :alt="userProfile.name" />
        </ion-avatar>
        <h2 class="profile-name">{{ userProfile.name }}</h2>
        <p class="profile-username">@{{ userProfile.username }}</p>
        <p v-if="userProfile.status" class="profile-status">
          {{ userProfile.status }}
        </p>
      </div>

      <!-- Profile Info -->
      <ion-list class="profile-info-list">
        <ion-item>
          <ion-icon :icon="mail" slot="start" color="primary"></ion-icon>
          <ion-label>
            <h3>{{ t("profile.email") }}</h3>
            <p>{{ userProfile.email }}</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-icon :icon="call" slot="start" color="primary"></ion-icon>
          <ion-label>
            <h3>{{ t("profile.phone") }}</h3>
            <p>{{ userProfile.phone }}</p>
          </ion-label>
        </ion-item>

        <ion-item v-if="userProfile.bio">
          <ion-icon
            :icon="informationCircle"
            slot="start"
            color="primary"
          ></ion-icon>
          <ion-label>
            <h3>{{ t("profile.bio") }}</h3>
            <p>{{ userProfile.bio }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <!-- Profile Actions -->
      <ion-list class="profile-actions-list">
        <ion-item button @click="handleEditProfile">
          <ion-icon :icon="create" slot="start" color="primary"></ion-icon>
          <ion-label>{{ t("profile.editProfile") }}</ion-label>
          <ion-icon :icon="chevronForward" slot="end"></ion-icon>
        </ion-item>

        <ion-item button @click="handleChangeAvatar">
          <ion-icon :icon="camera" slot="start" color="primary"></ion-icon>
          <ion-label>{{ t("profile.changeAvatar") }}</ion-label>
          <ion-icon :icon="chevronForward" slot="end"></ion-icon>
        </ion-item>

        <ion-item button @click="handlePrivacySettings">
          <ion-icon :icon="lockClosed" slot="start" color="primary"></ion-icon>
          <ion-label>{{ t("profile.privacySettings") }}</ion-label>
          <ion-icon :icon="chevronForward" slot="end"></ion-icon>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
} from "@ionic/vue";
import {
  create,
  mail,
  call,
  informationCircle,
  chevronForward,
  camera,
  lockClosed,
} from "ionicons/icons";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();

const userProfile = ref({
  name: "John Doe",
  username: "johndoe",
  email: "john.doe@example.com",
  phone: "+1 234 567 8900",
  avatar: "https://placehold.co/120x120/4285f4/ffffff?text=JD",
  status: "Available",
  bio: "Software developer and tech enthusiast",
});

const handleEdit = () => {
  handleEditProfile();
};

const handleEditProfile = () => {
  // TODO: Navigate to edit profile page
  console.log("Edit profile");
};

const handleChangeAvatar = () => {
  // TODO: Open avatar picker
  console.log("Change avatar");
};

const handlePrivacySettings = () => {
  router.push("/app/settings");
};
</script>

<style scoped>
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px;
  text-align: center;
  background: var(--ion-background-color);
}

.profile-avatar {
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
  border: 4px solid var(--ion-color-primary);
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--ion-text-color);
}

.profile-username {
  font-size: 1rem;
  color: var(--ion-color-medium);
  margin: 0 0 8px 0;
}

.profile-status {
  font-size: 0.875rem;
  color: var(--ion-color-success);
  margin: 0;
  font-weight: 500;
}

.profile-info-list {
  margin-top: 16px;
}

.profile-info-list ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --inner-padding-end: 0;
}

.profile-info-list ion-item h3 {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--ion-color-medium);
}

.profile-info-list ion-item p {
  font-size: 1rem;
  margin: 0;
  color: var(--ion-text-color);
}

.profile-actions-list {
  margin-top: 16px;
}

.profile-actions-list ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
}
</style>
