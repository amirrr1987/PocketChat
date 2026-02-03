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
import { ref, computed } from "vue";
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

const { t } = useI18n();
const router = useRouter();

const isSearchOpen = ref(false);
const searchQuery = ref("");
const isFabOpen = ref(false);
const isLoading = ref(false);

const navigateTo = (path: string) => {
  router.push(path);
};

const chats = ref([
  {
    id: 1,
    name: "John Doe",
    avatar: "https://placehold.co/40x40/4285f4/ffffff?text=JD",
    sender: {
      name: "John Doe",
      lastMessage: "Hello, how are you?",
      lastMessageTime: "12:00",
    },
    unreadCount: 2,
  },
  {
    id: 2,
    name: "Jane Smith",
    avatar: "https://placehold.co/40x40/ea4335/ffffff?text=JS",
    sender: {
      name: "Jane Smith",
      lastMessage: "See you tomorrow!",
      lastMessageTime: "11:30",
    },
    unreadCount: 0,
  },
  {
    id: 3,
    name: "Mike Johnson",
    avatar: "https://placehold.co/40x40/34a853/ffffff?text=MJ",
    sender: {
      name: "Mike Johnson",
      lastMessage: "Thanks for your help",
      lastMessageTime: "10:15",
    },
    unreadCount: 5,
  },
  {
    id: 4,
    name: "Sarah Williams",
    avatar: "https://placehold.co/40x40/fbbc04/ffffff?text=SW",
    sender: {
      name: "Sarah Williams",
      lastMessage: "Let's meet at 3pm",
      lastMessageTime: "09:45",
    },
    unreadCount: 0,
  },
  {
    id: 5,
    name: "David Brown",
    avatar: "https://placehold.co/40x40/ff6d01/ffffff?text=DB",
    sender: {
      name: "David Brown",
      lastMessage: "Great idea!",
      lastMessageTime: "Yesterday",
    },
    unreadCount: 1,
  },
  {
    id: 6,
    name: "Emily Davis",
    avatar: "https://placehold.co/40x40/9c27b0/ffffff?text=ED",
    sender: {
      name: "Emily Davis",
      lastMessage: "Can you send me the file?",
      lastMessageTime: "Yesterday",
    },
    unreadCount: 0,
  },
  {
    id: 7,
    name: "Chris Wilson",
    avatar: "https://placehold.co/40x40/00acc1/ffffff?text=CW",
    sender: {
      name: "Chris Wilson",
      lastMessage: "See you later!",
      lastMessageTime: "2 days ago",
    },
    unreadCount: 0,
  },
  {
    id: 8,
    name: "Lisa Anderson",
    avatar: "https://placehold.co/40x40/e91e63/ffffff?text=LA",
    sender: {
      name: "Lisa Anderson",
      lastMessage: "Happy birthday!",
      lastMessageTime: "3 days ago",
    },
    unreadCount: 0,
  },
]);

const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) {
    return chats.value;
  }
  const query = searchQuery.value.toLowerCase();
  return chats.value.filter(
    (chat) =>
      chat.name.toLowerCase().includes(query) ||
      chat.sender?.lastMessage?.toLowerCase().includes(query)
  );
});

const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value;
  if (!isSearchOpen.value) {
    searchQuery.value = "";
  }
};

const toggleFabMenu = () => {
  isFabOpen.value = !isFabOpen.value;
};

const handleNewChat = async () => {
  isFabOpen.value = false;
  const toast = await toastController.create({
    message: t("chats.newChat"),
    duration: 2000,
    color: "primary",
  });
  toast.present();
  // TODO: Navigate to new chat page or open contact selector
};

const handleNewGroup = async () => {
  isFabOpen.value = false;
  const toast = await toastController.create({
    message: t("chats.newGroup"),
    duration: 2000,
    color: "primary",
  });
  toast.present();
  // TODO: Navigate to new group page
};

const formatTime = (time: string | undefined) => {
  if (!time) return "";
  // Simple time formatting - can be enhanced with date-fns or similar
  return time;
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
