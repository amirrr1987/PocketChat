import { createRouter, createWebHistory } from "vue-router";
import AuthLayout from "@/layouts/AuthLayout.vue";
import MainLayout from "@/layouts/MainLayout.vue";
import { useAuthStore } from "@/stores/auth.store";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          redirect: { name: "chats" },
        },
        {
          path: "chats",
          name: "chats",
          component: () => import("@/views/ListChat.vue"),
        },
        {
          path: "chats/:id",
          name: "chat",
          component: () => import("@/views/SingleChat.vue"),
        },
        {
          path: "contacts",
          name: "contacts",
          component: () => import("@/views/ContactsPage.vue"),
        },
      ],
    },
    {
      path: "/auth",
      component: AuthLayout,
      meta: { guest: true },
      children: [
        {
          path: "login",
          name: "login",
          component: () => import("@/views/Auth/LoginPage.vue"),
        },
        {
          path: "register",
          name: "register",
          component: () => import("@/views/Auth/RegisterPage.vue"),
        },
      ],
    },
    {
      path: "/login",
      redirect: { name: "login" },
    },
    {
      path: "/register",
      redirect: { name: "register" },
    },
  ],
});

router.beforeEach((to, _from, next) => {
  // const authStore = useAuthStore();
  // const requiresAuth = to.matched.some((r) => r.meta.requiresAuth);
  // const guest = to.matched.some((r) => r.meta.guest);

  // if (requiresAuth && !authStore.isAuthenticated) {
  //   next({ name: "login", query: { redirect: to.fullPath } });
  //   return;
  // }
  // if (guest && authStore.isAuthenticated) {
  //   const redirect = (to.query.redirect as string) ?? "/";
  //   next(redirect);
  //   return;
  // }
  next();
});

export default router;
