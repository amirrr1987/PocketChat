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
        component: () => import("@/views/App/ChatsPage.vue"),
      },
      {
        path: "contacts",
        component: () => import("@/views/App/ContactsPage.vue"),
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
        component: () => import("@/views/App/SettingsPage.vue"),
      },
      {
        path: "profile",
        component: () => import("@/views/App/ProfilePage.vue"),
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
