<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button menu="main-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ t("nav.chats") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleSearch">
            <ion-icon :icon="isSearchOpen ? close : search"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar v-if="isSearchOpen">
        <ion-searchbar
          v-model="searchQuery"
          :placeholder="t('chats.searchPlaceholder')"
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
        <ion-icon :icon="chatbubblesOutline" class="empty-state-icon"></ion-icon>
        <h2 class="empty-state-title">{{ t("chats.errorLoading") }}</h2>
        <p class="empty-state-description">{{ loadError }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredChats.length === 0" class="empty-state-container">
        <ion-icon
          :icon="chatbubblesOutline"
          class="empty-state-icon"
        ></ion-icon>
        <h2 class="empty-state-title">{{ t("chats.emptyStateMessage") }}</h2>
        <p class="empty-state-description">
          {{ t("chats.emptyStateDescription") }}
        </p>
      </div>

      <!-- Chats List -->
      <ion-list v-else class="chats-list">
        <template v-for="chat in filteredChats" :key="chat.id">
          <ion-item-sliding>
            <ion-item
              :button="true"
              @click="navigateTo(`/chat/${chat.id}`)"
              class="chat-item"
            >
              <ion-avatar aria-hidden="true" slot="start" class="chat-avatar">
                <img alt="" :src="chat.avatar" />
              </ion-avatar>
              <ion-label class="chat-label">
                <div class="chat-header">
                  <h3 class="chat-name">{{ chat.name }}</h3>
                  <ion-note class="chat-time">{{
                    formatTime(chat.sender?.lastMessageTime)
                  }}</ion-note>
                </div>
                <div class="chat-preview">
                  <p class="chat-message">
                    <span v-if="chat.sender?.name" class="sender-name">{{
                      chat.sender.name
                    }}</span
                    >: {{ chat.sender?.lastMessage }}
                  </p>
                  <ion-badge
                    v-if="chat.unreadCount && chat.unreadCount > 0"
                    color="primary"
                    class="unread-badge"
                  >
                    {{ chat.unreadCount > 99 ? "99+" : chat.unreadCount }}
                  </ion-badge>
                </div>
              </ion-label>
            </ion-item>
          </ion-item-sliding>
        </template>
      </ion-list>

      <!-- FAB with Menu -->
      <ion-fab slot="fixed" vertical="bottom" horizontal="end" >
        <ion-fab-button @click="toggleFabMenu" size="small">
          <ion-icon :icon="isFabOpen ? close : add"></ion-icon>
        </ion-fab-button>
        <ion-fab-list v-if="isFabOpen" side="top">
          <ion-fab-button @click="handleNewGroup">
            <ion-icon :icon="people"></ion-icon>
          </ion-fab-button>
          <ion-label class="fab-label">{{ t("chats.newGroup") }}</ion-label>
          <ion-fab-button @click="handleNewChat">
            <ion-icon :icon="chatbubble"></ion-icon>
          </ion-fab-button>
          <ion-label class="fab-label">{{ t("chats.newChat") }}</ion-label>
        </ion-fab-list>
      </ion-fab>
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
  IonAvatar,
  IonItemSliding,
  IonNote,
  IonIcon,
  IonFab,
  IonFabButton,
  IonFabList,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonBadge,
  IonSkeletonText,
  toastController,
} from "@ionic/vue";
import {
  search,
  add,
  close,
  chevronDownCircleOutline,
  chatbubblesOutline,
  chatbubble,
  people,
} from "ionicons/icons";
import { useI18n } from "vue-i18n";
import { fetchChats, type GroupChat, type SingleChat, type ChatsResponse } from "@/api/chats";
import { getAuthUser } from "@/api/client";

const { t } = useI18n();
const router = useRouter();

interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  sender?: { name: string; lastMessage: string; lastMessageTime: string };
  unreadCount: number;
}

const isSearchOpen = ref(false);
const searchQuery = ref("");
const isFabOpen = ref(false);
const isLoading = ref(false);
const chats = ref<ChatItem[]>([]);
const loadError = ref("");

function toChatItem(g: GroupChat): ChatItem {
  const name = g.title;
  const initial = name.slice(0, 2).toUpperCase();
  return {
    id: g.id,
    name,
    avatar: `https://placehold.co/40x40/4285f4/ffffff?text=${encodeURIComponent(initial)}`,
    sender: { name: "", lastMessage: "", lastMessageTime: "" },
    unreadCount: 0,
  };
}

function toChatItemSingle(s: SingleChat): ChatItem {
  const me = getAuthUser();
  const other = me?.id === s.user1Id ? s.user2 : s.user1;
  const name = other?.username ?? "";
  const initial = name.slice(0, 2).toUpperCase() || "?";
  return {
    id: s.id,
    name,
    avatar: `https://placehold.co/40x40/ea4335/ffffff?text=${encodeURIComponent(initial)}`,
    sender: { name: "", lastMessage: "", lastMessageTime: "" },
    unreadCount: 0,
  };
}

async function loadChats() {
  isLoading.value = true;
  loadError.value = "";
  try {
    const res: ChatsResponse = await fetchChats();
    const groupItems = (res.groups ?? []).map(toChatItem);
    const singleItems = (res.singleChats ?? []).map(toChatItemSingle);
    chats.value = [...groupItems, ...singleItems];
  } catch (e: unknown) {
    loadError.value = e instanceof Error ? e.message : String(e);
    chats.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => loadChats());

const navigateTo = (path: string) => {
  router.push(path);
};

const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) return chats.value;
  const query = searchQuery.value.toLowerCase();
  return chats.value.filter(
    (chat) =>
      chat.name.toLowerCase().includes(query) ||
      chat.sender?.lastMessage?.toLowerCase().includes(query)
  );
});

const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value;
  if (!isSearchOpen.value) searchQuery.value = "";
};

const toggleFabMenu = () => {
  isFabOpen.value = !isFabOpen.value;
};

const handleNewChat = () => {
  isFabOpen.value = false;
  router.push("/contacts");
};

const handleNewGroup = async () => {
  isFabOpen.value = false;
  const toast = await toastController.create({
    message: t("chats.newGroup"),
    duration: 2000,
    color: "primary",
  });
  toast.present();
};

const formatTime = (time: string | undefined) => {
  if (!time) return "";
  return time;
};

const handleRefresh = async (event: CustomEvent) => {
  await loadChats();
  (event.target as HTMLIonRefresherElement).complete();
};
</script>

<style scoped>
.chats-list {
  padding: 0;
}

.chat-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --inner-padding-end: 0;
  --inner-padding-top: 12px;
  --inner-padding-bottom: 12px;
  margin-bottom: 1px;
}

.chat-avatar {
  width: 50px;
  height: 50px;
  margin-inline-end: 12px;
}

.chat-label {
  margin: 0;
  flex: 1;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.chat-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--ion-text-color);
}

.chat-time {
  font-size: 0.75rem;
  color: var(--ion-color-medium);
  white-space: nowrap;
}

.chat-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.chat-message {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.sender-name {
  font-weight: 500;
  color: var(--ion-text-color);
}

.unread-badge {
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
  margin: 0;
  max-width: 280px;
}

.loading-container {
  padding: 16px;
}

.fab-label {
  font-size: 0.75rem;
  margin-top: 4px;
  color: var(--ion-color-dark);
  text-align: center;
}

ion-fab-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

ion-fab-list ion-fab-button {
  margin-bottom: 4px;
}
</style>
