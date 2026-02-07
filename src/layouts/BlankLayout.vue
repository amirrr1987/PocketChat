<template>
  <ion-page>
    <ion-menu side="start" menu-id="main-menu" content-id="main-content">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>{{ t("nav.menu") }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="menu-profile" @click="navigateTo('/app/profile')">
          <ion-avatar class="menu-avatar">
            <img :src="userProfile.avatar" :alt="userProfile.name" />
          </ion-avatar>
          <div class="menu-user-info">
            <h3 class="menu-user-name">{{ userProfile.name }}</h3>
            <p class="menu-user-status">{{ userProfile.status }}</p>
          </div>
        </div>

        <ion-list class="menu-list">
          <template v-for="(item, idx) in appMenuItems" :key="idx">
            <ion-item-divider v-if="item.type === 'divider'">
              <ion-label>{{ item.labelKey ? t(item.labelKey) : '' }}</ion-label>
            </ion-item-divider>
            <ion-item
              v-else-if="item.type === 'logout'"
              button
              @click="logout"
              class="menu-item menu-item-logout"
            >
              <ion-icon
                v-if="item.icon"
                :icon="item.icon"
                slot="start"
                color="danger"
              />
              <ion-label>{{ item.labelKey ? t(item.labelKey) : '' }}</ion-label>
            </ion-item>
            <ion-item
              v-else-if="item.type === 'link' && item.path"
              button
              @click="navigateTo(item.path!)"
              class="menu-item"
            >
              <ion-icon
                v-if="item.icon"
                :icon="item.icon"
                slot="start"
                color="primary"
              />
              <ion-label>{{ item.labelKey ? t(item.labelKey) : '' }}</ion-label>
            </ion-item>
          </template>
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
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import { appMenuItems } from "@/config/appNav";
import { getAuthUser } from "@/api/client";

const { t } = useI18n();
const router = useRouter();

const userProfile = computed(() => {
  const user = getAuthUser();
  const name = user?.username ?? "";
  const initial = name.slice(0, 2).toUpperCase() || "?";
  return {
    name: name || "—",
    status: user ? t("nav.available") : "—",
    avatar: `https://placehold.co/80x80/4285f4/ffffff?text=${encodeURIComponent(initial)}`,
  };
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
