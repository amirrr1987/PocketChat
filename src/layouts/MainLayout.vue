<template>
  <div class="h-svh flex flex-col relative">
    <div class="absolute top-2 right-2 z-10">
      <button
        type="button"
        class="p-2 text-stone-500 hover:text-stone-700"
        title="Logout"
        @click="logout"
      >
        <ArrowRightOnRectangleIcon class="size-5" />
      </button>
    </div>
    <div class="flex-1 p-2 overflow-hidden mb-20">
      <RouterView />
    </div>
    <div class="fixed bottom-4 inset-x-2 mx-auto max-w-sm">
      <div
        class="flex justify-evenly items-center gap-4 border border-gray-200 shadow rounded-full py-2 bg-white/30 backdrop-blur-xs"
      >
        <template v-for="menu in menus" :key="menu.id">
          <RouterLink
            :to="{ name: menu.name }"
            class="text-stone-700"
            exact-active-class="text-sky-500!"
          >
            <component :is="menu.icon" class="size-6 mx-auto" />
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
import { ChatBubbleLeftRightIcon } from "@heroicons/vue/24/outline";
import { UserIcon } from "@heroicons/vue/24/outline";
import { ArrowRightOnRectangleIcon } from "@heroicons/vue/24/outline";
import { reactive, type FunctionalComponent, type HTMLAttributes, type VNodeProps } from "vue";
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
  icon: FunctionalComponent<HTMLAttributes & VNodeProps>;
}
const menus = reactive<IMenu[]>([
  {
    id: "1",
    order: 1,
    name: "chats",
    icon: ChatBubbleLeftRightIcon,
    label: "Chats",
  },
  {
    id: "2",
    order: 2,
    name: "profile",
    icon: UserIcon,
    label: "Profile",
  },
]);
</script>
