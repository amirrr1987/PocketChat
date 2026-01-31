<template>
  <div>
    <NavBar :title="navTitle" fixed placeholder>
      <template #right>
        <Tag v-if="authStore.auth" plain type="primary">{{ initials }}</Tag>
      </template>
    </NavBar>
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
    <Tabbar v-model="activeTab" route placeholder>
      <TabbarItem to="/chats" name="chats" icon="chat-o">Chats</TabbarItem>
      <TabbarItem to="/contacts" name="contacts" icon="friends-o">Contacts</TabbarItem>
    </Tabbar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterView, useRoute } from "vue-router";
/* eslint-disable @typescript-eslint/no-unused-vars -- Vant components used in template as van-nav-bar, van-tag, van-tabbar, van-tabbar-item */
import { NavBar, Tag, Tabbar, TabbarItem } from "vant";
/* eslint-enable @typescript-eslint/no-unused-vars */
import { useAuthStore } from "@/stores/auth.store";

const route = useRoute();
const authStore = useAuthStore();

const navTitle = "PocketChat";

const activeTab = ref("chats");
watch(
  () => route.path,
  (path) => {
    if (path === "/chats" || path.startsWith("/chats/")) activeTab.value = "chats";
    else if (path === "/contacts") activeTab.value = "contacts";
  },
  { immediate: true }
);

const initials = computed(() => {
  const name = authStore.auth?.user?.username ?? "?";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length >= 2) {
    const a = parts[0]?.[0] ?? "";
    const b = parts[parts.length - 1]?.[0] ?? "";
    return (a + b).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});
</script>
