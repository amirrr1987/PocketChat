import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import MainLayout from "../layouts/MainLayout.vue";
import AuthLayout from "../layouts/AuthLayout.vue";
import ChatLayout from "../layouts/ChatLayout.vue";
import BlankLayout from "../layouts/BlankLayout.vue";
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: MainLayout,
    children: [
      {
        path: "",
        redirect: "/chats",
      },
      {
        path: "chats",
        component: () => import("@/views/Main/ChatsPage.vue"),
      },
      {
        path: "contacts",
        component: () => import("@/views/Main/ContactsPage.vue"),
      },
    ],
  },
  {
    path: "/app",
    component: BlankLayout,
    children: [
      {
        path: "",
        redirect: "/app/settings",
      },
      {
        path: "settings",
        component: () => import("@/views/Main/SettingsPage.vue"),
      },
    ],
  },
  {
    path: "/chat/:id",
    component: ChatLayout,
    children: [
      {
        path: "",
        component: () => import("@/views/Single/ChatPage.vue"),
      },
    ],
  },

  {
    path: "/auth/",
    component: AuthLayout,
    children: [
      {
        path: "",
        redirect: "/auth/login",
      },
      {
        path: "login",
        component: () => import("@/views/Auth/LoginPage.vue"),
      },
      {
        path: "register",
        component: () => import("@/views/Auth/RegisterPage.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
