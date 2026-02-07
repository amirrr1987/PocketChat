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
          :placeholder="t('contacts.searchUsersPlaceholder')"
          show-clear-button="focus"
          :debounce="400"
          @ionInput="onSearchInput"
          @ionClear="searchQuery = ''; searchResults = []"
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

      <!-- Not logged in -->
      <div v-if="!currentUser" class="empty-state-container">
        <ion-icon :icon="peopleOutline" class="empty-state-icon"></ion-icon>
        <h2 class="empty-state-title">{{ t("contacts.loginRequired") }}</h2>
        <p class="empty-state-description">
          {{ t("contacts.emptyStateDescription") }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-else-if="isLoading && !isSearching" class="loading-container">
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

      <!-- Search results (when search open and query length >= 2) -->
      <template v-else-if="isSearchOpen && searchQuery.trim().length >= 2">
        <div v-if="isSearching" class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
        </div>
        <div v-else-if="searchResults.length === 0" class="empty-state-container search-empty">
          <p class="empty-state-description">{{ t("contacts.noSearchResults") }}</p>
        </div>
        <ion-list v-else class="contacts-list">
          <ion-item
            v-for="user in searchResults"
            :key="user.id"
            class="contact-item"
            :button="!isContactUserId(user.id)"
            @click="isContactUserId(user.id) ? undefined : handleAddContact(user)"
          >
            <ion-avatar slot="start" class="contact-avatar">
              <img :src="avatarForUser(user.username)" :alt="user.username" />
            </ion-avatar>
            <ion-label>
              <h3 class="contact-name">{{ user.username }}</h3>
              <p v-if="isContactUserId(user.id)" class="contact-online">
                {{ t("contacts.alreadyInContacts") }}
              </p>
            </ion-label>
            <ion-button
              v-if="!isContactUserId(user.id)"
              fill="clear"
              size="small"
              :disabled="addingUserId === user.id"
              @click.stop="handleAddContact(user)"
            >
              <ion-spinner v-if="addingUserId === user.id" name="crescent"></ion-spinner>
              <ion-icon v-else :icon="add"></ion-icon>
              {{ t("contacts.addToContacts") }}
            </ion-button>
          </ion-item>
        </ion-list>
      </template>

      <!-- My contacts list -->
      <template v-else>
        <!-- Empty State -->
        <div
          v-if="contacts.length === 0"
          class="empty-state-container"
        >
          <ion-icon :icon="peopleOutline" class="empty-state-icon"></ion-icon>
          <h2 class="empty-state-title">{{ t("contacts.noContacts") }}</h2>
          <p class="empty-state-description">
            {{ t("contacts.emptyStateDescription") }}
          </p>
        </div>

        <!-- Contacts List -->
        <ion-list v-else class="contacts-list">
          <ion-item-sliding v-for="contact in filteredContacts" :key="contact.id">
            <ion-item
              :button="true"
              class="contact-item"
              @click="handleContactClick(contact)"
              @contextmenu.prevent="onContactContextMenu(contact)"
              @touchstart.passive="onContactTouchStart($event, contact)"
              @touchend.passive="onContactTouchEnd"
              @touchmove.passive="onContactTouchEnd"
              @touchcancel.passive="onContactTouchEnd"
            >
              <ion-avatar slot="start" class="contact-avatar">
                <img :src="contact.avatar" :alt="contact.name" />
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
                <div class="contact-info"></div>
              </ion-label>
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option color="danger" @click="handleRemoveContact(contact)">
                {{ t("contacts.removeFromContacts") }}
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
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
  IonItemOptions,
  IonItemOption,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonBadge,
  IonSkeletonText,
  IonSpinner,
  toastController,
  alertController,
  actionSheetController,
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
import { getAuthUser } from "@/api/client";
import {
  fetchContacts,
  addContactByUsername,
  removeContact,
  type Contact,
} from "@/api/contacts";
import { searchUsersByUsername, type User } from "@/api/users";
import { createSingleChat } from "@/api/chats";

const { t } = useI18n();
const router = useRouter();

const currentUser = ref(getAuthUser());
const isSearchOpen = ref(false);
const searchQuery = ref("");
const searchResults = ref<User[]>([]);
const isSearching = ref(false);
const isLoading = ref(false);
const loadError = ref("");
const contacts = ref<Contact[]>([]);
const addingUserId = ref<string | null>(null);

const LONG_PRESS_MS = 500;
let longPressTimer: ReturnType<typeof setTimeout> | null = null;
const justDidLongPress = ref(false);

interface ContactItem {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
}

function avatarForUsername(username: string): string {
  const initial = username.slice(0, 2).toUpperCase();
  return `https://placehold.co/40x40/4285f4/ffffff?text=${encodeURIComponent(initial)}`;
}

function avatarForUser(username: string): string {
  return avatarForUsername(username);
}

function toContactItem(c: Contact): ContactItem {
  const name = c.contactUser?.username ?? "";
  return {
    id: c.contactUserId,
    name,
    avatar: avatarForUsername(name),
    isOnline: false,
    lastSeen: "",
  };
}

const contactIds = computed(() => new Set(contacts.value.map((c) => c.contactUserId)));

function isContactUserId(userId: string): boolean {
  return contactIds.value.has(userId);
}

async function loadContacts() {
  if (!currentUser.value) {
    contacts.value = [];
    return;
  }
  isLoading.value = true;
  loadError.value = "";
  try {
    contacts.value = await fetchContacts();
  } catch (e: unknown) {
    loadError.value = e instanceof Error ? e.message : String(e);
    contacts.value = [];
  } finally {
    isLoading.value = false;
  }
}

function onSearchInput(ev: Event) {
  const target = ev.target as HTMLIonSearchbarElement;
  const q = (target.value ?? searchQuery.value ?? "").trim();
  searchQuery.value = q;
  if (q.length < 2) {
    searchResults.value = [];
    return;
  }
  isSearching.value = true;
  searchUsersByUsername(q)
    .then((list) => {
      const me = currentUser.value?.id;
      searchResults.value = me ? list.filter((u) => u.id !== me) : list;
    })
    .catch(() => {
      searchResults.value = [];
    })
    .finally(() => {
      isSearching.value = false;
    });
}

onMounted(() => {
  currentUser.value = getAuthUser();
  loadContacts();
});

watch(currentUser, () => {
  currentUser.value = getAuthUser();
});

const filteredContacts = computed(() => {
  const list = contacts.value.map(toContactItem);
  if (!searchQuery.value.trim() || !isSearchOpen.value) return list;
  const query = searchQuery.value.toLowerCase();
  return list.filter((c) => c.name.toLowerCase().includes(query));
});

const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value;
  if (!isSearchOpen.value) {
    searchQuery.value = "";
    searchResults.value = [];
  }
};

const handleRefresh = async (event: CustomEvent) => {
  currentUser.value = getAuthUser();
  await loadContacts();
  (event.target as HTMLIonRefresherElement).complete();
};

const handleAddContact = async (user: User) => {
  if (isContactUserId(user.id)) return;
  addingUserId.value = user.id;
  try {
    await addContactByUsername(user.username);
    await loadContacts();
    const toast = await toastController.create({
      message: t("contacts.addToContacts") + " ✓",
      duration: 2000,
      color: "success",
    });
    toast.present();
    searchResults.value = searchResults.value.filter((u) => u.id !== user.id);
  } catch (e: unknown) {
    const toast = await toastController.create({
      message: e instanceof Error ? e.message : String(e),
      duration: 3000,
      color: "danger",
    });
    toast.present();
  } finally {
    addingUserId.value = null;
  }
};

const handleRemoveContact = async (contact: ContactItem) => {
  const alert = await alertController.create({
    header: t("contacts.removeFromContacts"),
    message: `${t("contacts.removeFromContacts")} "${contact.name}"?`,
    buttons: [
      { text: t("common.cancel"), role: "cancel" },
      {
        text: t("common.delete"),
        role: "destructive",
        handler: async () => {
          try {
            await removeContact(contact.id);
            await loadContacts();
            const toast = await toastController.create({
              message: t("contacts.removeFromContacts") + " ✓",
              duration: 2000,
              color: "success",
            });
            toast.present();
          } catch (e: unknown) {
            const toast = await toastController.create({
              message: e instanceof Error ? e.message : String(e),
              duration: 3000,
              color: "danger",
            });
            toast.present();
          }
        },
      },
    ],
  });
  await alert.present();
};

async function onContactContextMenu(contact: ContactItem) {
  const sheet = await actionSheetController.create({
    header: contact.name,
    buttons: [
      { text: t("common.cancel"), role: "cancel" },
      {
        text: t("common.delete"),
        role: "destructive",
        handler: () => {
          void handleRemoveContact(contact);
        },
      },
    ],
  });
  await sheet.present();
}

function onContactTouchStart(_ev: TouchEvent, contact: ContactItem) {
  longPressTimer = setTimeout(async () => {
    longPressTimer = null;
    justDidLongPress.value = true;
    const sheet = await actionSheetController.create({
      header: contact.name,
      buttons: [
        { text: t("common.cancel"), role: "cancel" },
        {
          text: t("common.delete"),
          role: "destructive",
          handler: () => {
            void handleRemoveContact(contact);
          },
        },
      ],
    });
    await sheet.present();
  }, LONG_PRESS_MS);
}

function onContactTouchEnd() {
  if (longPressTimer != null) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

const handleContactClick = async (contact: ContactItem) => {
  if (justDidLongPress.value) {
    justDidLongPress.value = false;
    return;
  }
  const me = currentUser.value;
  if (!me) {
    const toast = await toastController.create({
      message: t("contacts.loginRequired"),
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

.contact-online {
  font-size: 0.75rem;
  color: var(--ion-color-medium);
  margin: 0;
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

.empty-state-container.search-empty {
  min-height: 120px;
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

.loading-container {
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
