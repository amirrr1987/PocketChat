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

      <!-- Error State -->
      <div v-else-if="loadError" class="empty-state-container">
        <ion-icon :icon="peopleOutline" class="empty-state-icon"></ion-icon>
        <h2 class="empty-state-title">{{ t("contacts.errorLoading") }}</h2>
        <p class="empty-state-description">{{ loadError }}</p>
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
            <ion-item
              :button="true"
              class="contact-item"
              @click="handleContactClick(contact)"
            >
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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
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
  toastController,
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
import { fetchUsers, type User } from "@/api/users";
import { getAuthUser } from "@/api/client";
import { createSingleChat } from "@/api/chats";

const { t } = useI18n();
const router = useRouter();

const isSearchOpen = ref(false);
const searchQuery = ref("");
const isLoading = ref(false);
const loadError = ref("");

interface ContactItem {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
}

const contacts = ref<ContactItem[]>([]);

function toContactItem(u: User): ContactItem {
  const initial = u.username.slice(0, 2).toUpperCase();
  return {
    id: u.id,
    name: u.username,
    avatar: `https://placehold.co/40x40/4285f4/ffffff?text=${encodeURIComponent(initial)}`,
    isOnline: false,
    lastSeen: "",
  };
}

async function loadContacts() {
  isLoading.value = true;
  loadError.value = "";
  try {
    const list = await fetchUsers();
    const me = getAuthUser();
    const others = me ? list.filter((u) => u.id !== me.id) : list;
    contacts.value = others.map(toContactItem);
  } catch (e: unknown) {
    loadError.value = e instanceof Error ? e.message : String(e);
    contacts.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadContacts);

const filteredContacts = computed(() => {
  if (!searchQuery.value.trim()) return contacts.value;
  const query = searchQuery.value.toLowerCase();
  return contacts.value.filter((contact) =>
    contact.name.toLowerCase().includes(query)
  );
});

const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value;
  if (!isSearchOpen.value) searchQuery.value = "";
};

const handleRefresh = async (event: CustomEvent) => {
  await loadContacts();
  (event.target as HTMLIonRefresherElement).complete();
};

const handleContactClick = async (contact: ContactItem) => {
  const me = getAuthUser();
  if (!me) {
    const toast = await toastController.create({
      message: t("auth.login"),
      duration: 2000,
      color: "warning",
    });
    toast.present();
    return;
  }
  try {
    const singleChat = await createSingleChat(me.id, contact.id);
    router.push(`/chat/${singleChat.id}`);
  } catch (e: unknown) {
    const toast = await toastController.create({
      message: e instanceof Error ? e.message : String(e),
      duration: 3000,
      color: "danger",
    });
    toast.present();
  }
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
