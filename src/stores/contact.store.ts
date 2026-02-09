import { ref } from "vue";
import { defineStore } from "pinia";
import { useSocket } from "@/composables/socket.composable";
import type { IUser } from "@/models/user.model";

/** Online users in the app (from socket), not a "contacts" list */
export const useContactStore = defineStore("contact", () => {
  const onlineUsers = ref<IUser[]>([]);
  const { socket } = useSocket();

  function requestUserList() {
    socket.emit("user:list");
  }

  function setupListeners() {
    socket.off("user:list");
    socket.off("user:online");
    socket.off("user:offline");
    socket.on("user:list", (list: IUser[] | { id: string; username: string }[]) => {
      onlineUsers.value = (Array.isArray(list) ? list : []).map((u) => ({
        id: u.id,
        username: u.username,
        email: "email" in u ? u.email : undefined,
        avatarUrl: "avatarUrl" in u ? u.avatarUrl : undefined,
        lastSeenAt: "lastSeenAt" in u ? u.lastSeenAt : undefined,
      }));
    });
    socket.on("user:online", (user: IUser | { id: string; username: string }) => {
      const exists = onlineUsers.value.some((u) => u.id === user.id);
      if (!exists) onlineUsers.value = [...onlineUsers.value, { ...user, email: undefined, avatarUrl: undefined, lastSeenAt: undefined }];
    });
    socket.on("user:offline", (payload: { userId: string }) => {
      onlineUsers.value = onlineUsers.value.filter((u) => u.id !== payload.userId);
    });
  }

  function offListeners() {
    socket.off("user:list");
    socket.off("user:online");
    socket.off("user:offline");
  }

  return {
    onlineUsers,
    requestUserList,
    setupListeners,
    offListeners,
  };
});
