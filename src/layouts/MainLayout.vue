<template>
  <div class="h-svh flex flex-col relative">
    <div class="absolute top-2 right-2 z-10">
      <button
        type="button"
        class="p-2 text-stone-500 hover:text-stone-700"
        title="Logout"
        @click="logout"
      >
        <Icon icon="mdi:logout" class="size-5" />
      </button>
    </div>
    <div class="flex-1 p-2 overflow-hidden" :class="{ 'mb-20': $route.name !== 'chat' }">
      <RouterView />
    </div>
    <div class="fixed bottom-4 inset-x-2 mx-auto max-w-sm" v-if="$route.name !== 'chat'">
      <div
        class="flex justify-evenly items-center gap-4 border border-gray-200 shadow rounded-full py-2 bg-white/30 backdrop-blur-xs"
      >
        <template v-for="menu in menus" :key="menu.id">
          <RouterLink
            :to="{ name: menu.name }"
            class="text-stone-700 flex flex-col items-center gap-1"
            exact-active-class="text-sky-500!"
          >
            <Icon :icon="menu.icon" class="size-6" />
            <span class="text-xs">{{ menu.label }}</span>
          </RouterLink>
        </template>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";
import { RouterView, RouterLink } from "vue-router";
import { Icon } from "@iconify/vue";
import { reactive } from "vue";
import { useAuthStore } from "@/stores/auth.store";

const router = useRouter();
const authStore = useAuthStore();

async function logout() {
  await authStore.logout();
  router.push({ name: "login" });
}

interface IMenu {
  id: string;
  order: number;
  name: string;
  label: string;
  icon: string;
}
const menus = reactive<IMenu[]>([
  {
    id: "1",
    order: 1,
    name: "chats",
    icon: "mdi:chat",
    label: "Chats",
  },
  {
    id: "3",
    order: 3,
    name: "contacts",
    icon: "mdi:contacts",
    label: "Contacts",
  },
  {
    id: "2",
    order: 2,
    name: "profile",
    icon: "mdi:account-circle",
    label: "Profile",
  },
]);
</script>
