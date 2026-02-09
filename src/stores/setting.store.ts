import { ref } from "vue";
import { defineStore } from "pinia";
import { useSocket } from "@/composables/socket.composable";
import type { ISetting } from "@/models/setting.model";

export const useSettingStore = defineStore("setting", () => {
  const setting = ref<ISetting | null>(null);
  const { socket } = useSocket();

  function setupListeners() {
    socket.on("setting:data", (data: ISetting) => {
      setting.value = data;
    });
    socket.on("setting:updated", (data: ISetting) => {
      setting.value = data;
    });
  }

  function loadSettings() {
    socket.emit("setting:get");
  }

  function updateSettings(
    body: { theme?: "light" | "dark"; notificationsEnabled?: boolean },
  ) {
    socket.emit("setting:update", body);
  }

  return { setting, setupListeners, loadSettings, updateSettings };
});
