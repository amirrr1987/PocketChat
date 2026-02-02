<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button menu="main-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title> Chats</ion-title>
        <ion-buttons slot="end">
          <ion-button>
            <ion-icon :icon="search"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-list>
        <template v-for="chat in chats" :key="chat.id">
          <ion-item-sliding>
            <ion-item :button="true" @click="navigateTo(`/chat/${chat.id}`)">
              <ion-avatar aria-hidden="true" slot="start">
                <img alt="" :src="chat.avatar" />
              </ion-avatar>
              <ion-label>
                <h3>{{ chat.name }}</h3>
                <p>{{ chat.sender?.name }}:{{ chat.sender?.lastMessage }}</p>
              </ion-label>
              <ion-note slot="end">
                {{ chat.sender?.lastMessageTime }}
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
  IonButton,
  } from "@ionic/vue";
import { search, add } from "ionicons/icons";
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateTo = (path: string) => {
  router.push(path);
};

const chats = [
  {
    id: 1,
    name: "John Doe",
    avatar: "https://placehold.co/40x40/4285f4/ffffff?text=JD",
    sender: {
      name: "John Doe",
      lastMessage: "Hello, how are you?",
      lastMessageTime: "12:00",
    },
  },
  {
    id: 2,
    name: "Jane Smith",
    avatar: "https://placehold.co/40x40/ea4335/ffffff?text=JS",
    sender: {
      name: "John Doe",
      lastMessage: "Hello, how are you?",
      lastMessageTime: "12:00",
    },
  },
  {
    id: 3,
    name: "Mike Johnson",
    avatar: "https://placehold.co/40x40/34a853/ffffff?text=MJ",
    sender: {
      name: "John Doe",
      lastMessage: "Hello, how are you?",
      lastMessageTime: "12:00",
    },
  },
  {
    id: 4,
    name: "Sarah Williams",
    avatar: "https://placehold.co/40x40/fbbc04/ffffff?text=SW",
    sender: {
      name: "John Doe",
      lastMessage: "Hello, how are you?",
      lastMessageTime: "12:00",
    },
  },
  {
    id: 5,
    name: "David Brown",
    avatar: "https://placehold.co/40x40/ff6d01/ffffff?text=DB",
    sender: {
      name: "John Doe",
      lastMessage: "Hello, how are you?",
      lastMessageTime: "12:00",
    },
  },
  {
    id: 6,
    name: "Emily Davis",
    avatar: "https://placehold.co/40x40/9c27b0/ffffff?text=ED",
    sender: {
      name: "John Doe",
      lastMessage: "Hello, how are you?",
      lastMessageTime: "12:00",
    },
  },
  {
    id: 7,
    name: "Chris Wilson",
    avatar: "https://placehold.co/40x40/00acc1/ffffff?text=CW",
    sender: {
      name: "John Doe",
      lastMessage: "Hello, how are you?",
      lastMessageTime: "12:00",
    },
  },
  {
    id: 8,
    name: "Lisa Anderson",
    avatar: "https://placehold.co/40x40/e91e63/ffffff?text=LA",
    sender: {
      name: "John Doe",
      lastMessage: "Hello, how are you?",
      lastMessageTime: "12:00",
    },
  },
];
</script>
