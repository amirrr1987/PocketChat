<template>
  <div class="p-4 space-y-4">
    <h1 class="text-lg font-semibold text-stone-800">Settings</h1>

    <div v-if="setting" class="space-y-4">
      <div>
        <label class="block text-sm text-stone-600 mb-1">Theme</label>
        <select
          v-model="theme"
          class="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-800"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <input
          v-model="notificationsEnabled"
          type="checkbox"
          id="notif"
          class="rounded border-stone-300"
        />
        <label for="notif" class="text-sm text-stone-700">Notifications</label>
      </div>
      <p v-if="message" class="text-sm" :class="messageOk ? 'text-green-600' : 'text-red-600'">
        {{ message }}
      </p>
      <button
        type="button"
        class="rounded-lg bg-sky-600 text-white px-4 py-2 font-medium hover:bg-sky-700 disabled:opacity-50"
        :disabled="saving"
        @click="save"
      >
        {{ saving ? "Saving…" : "Save" }}
      </button>
    </div>
    <p v-else class="text-stone-500">Loading…</p>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useSettingStore } from "@/stores/setting.store";

const settingStore = useSettingStore();
const { setting } = storeToRefs(settingStore);

const theme = ref<"light" | "dark">("light");
const notificationsEnabled = ref(true);
const saving = ref(false);
const message = ref("");
const messageOk = ref(false);

watch(
  setting,
  (s) => {
    if (s) {
      theme.value = s.theme ?? "light";
      notificationsEnabled.value = s.notificationsEnabled ?? true;
    }
  },
  { immediate: true },
);

async function save() {
  message.value = "";
  saving.value = true;
  try {
    await settingStore.updateSettings({
      theme: theme.value,
      notificationsEnabled: notificationsEnabled.value,
    });
    message.value = "Saved.";
    messageOk.value = true;
    setTimeout(() => (message.value = ""), 2000);
  } catch {
    message.value = "Failed to save.";
    messageOk.value = false;
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  settingStore.setupListeners();
  settingStore.loadSettings();
});
</script>
