<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button menu="main-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ t("nav.contacts") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button>
            <ion-icon :icon="search"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content
          :pulling-icon="chevronDownCircleOutline"
          :pulling-text="t('common.pullToRefresh')"
          refreshing-spinner="circular"
          :refreshing-text="t('common.refreshing')"
        ></ion-refresher-content>
      </ion-refresher>

      <ion-list>
        <template v-for="contact in contacts" :key="contact.id">
          <ion-item-sliding>
            <ion-item :button="true">
              <ion-avatar aria-hidden="true" slot="start">
                <img alt="" :src="contact.avatar" />
              </ion-avatar>
              <ion-label>{{ contact.name }}</ion-label>
              <ion-note
                slot="end"
                :color="contact.isOnline ? 'success' : 'danger'"
              >
                <ion-icon :icon="ellipse"></ion-icon>
              </ion-note>
            </ion-item>
          </ion-item-sliding>
        </template>
      </ion-list>
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button size="small">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonNote,
  IonAvatar,
  IonItemSliding,
  IonButton,
  IonFab,
  IonFabButton,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/vue";
import { ellipse, search, add, chevronDownCircleOutline } from "ionicons/icons";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const contacts = ref([
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "1234567890",
    isOnline: true,
    lastSeen: "2 hours ago",
    avatar: "https://placehold.co/40x40/4285f4/ffffff?text=JD",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.doe@example.com",
    phone: "1234567890",
    isOnline: false,
    lastSeen: "1 day ago",
    avatar: "https://placehold.co/40x40/ea4335/ffffff?text=JS",
  },
  {
    id: 3,
    name: "Jim Johnson",
    email: "jim.johnson@example.com",
    phone: "1234567890",
    isOnline: true,
    lastSeen: "3 hours ago",
    avatar: "https://placehold.co/40x40/34a853/ffffff?text=JJ",
  },
  {
    id: 4,
    name: "Jill Williams",
    email: "jill.williams@example.com",
    phone: "1234567890",
    isOnline: false,
    lastSeen: "2 days ago",
    avatar: "https://placehold.co/40x40/fbbc04/ffffff?text=JW",
  },
  {
    id: 5,
    name: "Jack Brown",
    email: "jack.brown@example.com",
    phone: "1234567890",
    isOnline: true,
    lastSeen: "1 hour ago",
    avatar: "https://placehold.co/40x40/ff6d01/ffffff?text=JB",
  },
  {
    id: 6,
    name: "Alex Davis",
    email: "alex.davis@example.com",
    phone: "1234567890",
    isOnline: false,
    lastSeen: "3 days ago",
    avatar: "https://placehold.co/40x40/9c27b0/ffffff?text=AD",
  },
]);

const handleRefresh = async (event: CustomEvent) => {
  // Simulate async operation (e.g., fetching new contacts from API)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Here you would typically fetch new data from your API
  // For now, we'll just refresh the existing data
  // Example: await fetchContacts();

  // Complete the refresh
  (event.target as HTMLIonRefresherElement).complete();
};
</script>
