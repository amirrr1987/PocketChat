import { ref } from "vue";
import { defineStore } from "pinia";
import { useSocket } from "@/composables/socket.composable";
import type { IProfile } from "@/models/profile.model";

export const useProfileStore = defineStore("profile", () => {
  const profile = ref<IProfile | null>(null);
  const { socket } = useSocket();

  function setupListeners() {
    socket.on("profile:data", (data: IProfile) => {
      profile.value = data;
    });
    socket.on("profile:updated", (data: IProfile) => {
      profile.value = data;
    });
  }

  function loadProfile() {
    socket.emit("profile:get");
  }

  function updateProfile(body: { displayName?: string; bio?: string }) {
    socket.emit("profile:update", body);
  }

  return { profile, setupListeners, loadProfile, updateProfile };
});
