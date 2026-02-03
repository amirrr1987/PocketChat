<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button menu="main-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ t("nav.contacts") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleSearch">
            <ion-icon :icon="isSearchOpen ? close : search"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar v-if="isSearchOpen">
        <ion-searchbar
          v-model="searchQuery"
          :placeholder="t('contacts.searchPlaceholder')"
          show-clear-button="focus"
          @ionClear="searchQuery = ''"
        ></ion-searchbar>
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

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <ion-skeleton-text
          animated
          style="width: 100%; height: 60px; margin-bottom: 8px"
        ></ion-skeleton-text>
        <ion-skeleton-text
          animated
          style="width: 100%; height: 60px; margin-bottom: 8px"
        ></ion-skeleton-text>
        <ion-skeleton-text
          animated
          style="width: 100%; height: 60px; margin-bottom: 8px"
        ></ion-skeleton-text>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredContacts.length === 0"
        class="empty-state-container"
      >
        <ion-icon :icon="peopleOutline" class="empty-state-icon"></ion-icon>
        <h2 class="empty-state-title">{{ t("contacts.noContacts") }}</h2>
        <p class="empty-state-description">
          {{ t("contacts.emptyStateDescription") }}
        </p>
        <ion-button
          v-if="!searchQuery"
          color="primary"
          class="empty-state-button"
        >
          <ion-icon :icon="add" slot="start"></ion-icon>
          {{ t("contacts.addContact") }}
        </ion-button>
      </div>

      <!-- Contacts List -->
      <ion-list v-else class="contacts-list">
        <template v-for="contact in filteredContacts" :key="contact.id">
          <ion-item-sliding>
            <ion-item :button="true" class="contact-item">
              <ion-avatar
                aria-hidden="true"
                slot="start"
                class="contact-avatar"
              >
                <img alt="" :src="contact.avatar" />
                <ion-badge
                  :color="contact.isOnline ? 'success' : 'medium'"
                  class="online-status-badge"
                >
                  <ion-icon :icon="ellipse"></ion-icon>
                </ion-badge>
              </ion-avatar>
              <ion-label class="contact-label">
                <div class="contact-header">
                  <h3 class="contact-name">{{ contact.name }}</h3>
                </div>
                <div class="contact-info">
                  <p
                    v-if="!contact.isOnline && contact.lastSeen"
                    class="contact-last-seen"
                  >
                    {{ t("contacts.lastSeen") }}: {{ contact.lastSeen }}
                  </p>
                  <p v-else-if="contact.isOnline" class="contact-online">
                    {{ t("chat.online") }}
                  </p>
                </div>
              </ion-label>
            </ion-item>
          </ion-item-sliding>
        </template>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
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
  IonAvatar,
  IonItemSliding,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonBadge,
  IonSkeletonText,
} from "@ionic/vue";
import {
  ellipse,
  search,
  add,
  close,
  chevronDownCircleOutline,
  peopleOutline,
} from "ionicons/icons";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const isSearchOpen = ref(false);
const searchQuery = ref("");
const isLoading = ref(false);

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
    email: "jane.smith@example.com",
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

const filteredContacts = computed(() => {
  if (!searchQuery.value.trim()) {
    return contacts.value;
  }
  const query = searchQuery.value.toLowerCase();
  return contacts.value.filter(
    (contact) =>
      contact.name.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query)
  );
});

const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value;
  if (!isSearchOpen.value) {
    searchQuery.value = "";
  }
};

const handleRefresh = async (event: CustomEvent) => {
  isLoading.value = true;
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 1500));
  isLoading.value = false;
  (event.target as HTMLIonRefresherElement).complete();
};
</script>

<style scoped>
.contacts-list {
  padding: 0;
}

.contact-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --inner-padding-end: 0;
  --inner-padding-top: 12px;
  --inner-padding-bottom: 12px;
  margin-bottom: 1px;
}

.contact-avatar {
  width: 50px;
  height: 50px;
  margin-inline-end: 12px;
  position: relative;
}

.online-status-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--ion-background-color);
}

.online-status-badge ion-icon {
  font-size: 10px;
}

.contact-label {
  margin: 0;
  flex: 1;
}

.contact-header {
  margin-bottom: 4px;
}

.contact-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--ion-text-color);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-detail {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-icon {
  font-size: 0.875rem;
}

.contact-last-seen,
.contact-online {
  font-size: 0.75rem;
  color: var(--ion-color-medium);
  margin: 0;
}

.contact-online {
  color: var(--ion-color-success);
  font-weight: 500;
}

.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  height: 100%;
  min-height: 400px;
}

.empty-state-icon {
  font-size: 80px;
  color: var(--ion-color-medium);
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-state-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ion-text-color);
  margin: 0 0 8px 0;
}

.empty-state-description {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  margin: 0 0 24px 0;
  max-width: 280px;
}

.empty-state-button {
  margin-top: 16px;
}

.loading-container {
  padding: 16px;
}
</style>
