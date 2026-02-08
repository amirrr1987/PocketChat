import { ref, onUnmounted, type Ref } from "vue";
import { io, type Socket } from "socket.io-client";
import { getAuthToken } from "@/api/client";
import type { Message } from "@/api/messages";

const WS_BASE =
  (import.meta.env.VITE_WS_URL as string | undefined)?.trim() ||
  (import.meta.env.DEV ? "http://localhost:5050" : "");

let socket: Socket | null = null;
let pendingJoin: ChatRoomPayload | null = null;

export interface ChatRoomPayload {
  singleChatId?: string;
  groupId?: string;
}

export interface SendMessagePayload extends ChatRoomPayload {
  parentMessageId?: string;
  messageType?: string;
}

export interface MessageReadBy {
  messageId: string;
  userId: string;
  username: string;
  readAt: string;
}

export interface MessageReactionAdded {
  messageId: string;
  userId: string;
  username: string;
  emoji: string;
  createdAt: string;
}

export interface MessageReactionRemoved {
  messageId: string;
  userId: string;
  emoji: string;
}

export interface ChatUpdated {
  chatId: string;
  chatType: "single" | "group";
  lastMessage: Message;
}

export interface UserOnline {
  userId: string;
}

export interface UserOffline {
  userId: string;
  lastSeenAt: string;
}

export interface OnlineUsers {
  userIds: string[];
  onlineUserIds: string[];
}

export interface TypingStart {
  userId: string;
  username: string;
}

export interface TypingStop {
  userId: string;
}

export interface ChatSocketCallbacks {
  onMessageNew?: (message: Message) => void;
  onMessageEdited?: (message: Message) => void;
  onMessageDeleted?: (payload: { messageId: string }) => void;
  onMessageReadBy?: (payload: MessageReadBy) => void;
  onMessageReactionAdded?: (payload: MessageReactionAdded) => void;
  onMessageReactionRemoved?: (payload: MessageReactionRemoved) => void;
  onChatUpdated?: (payload: ChatUpdated) => void;
  onUserOnline?: (payload: UserOnline) => void;
  onUserOffline?: (payload: UserOffline) => void;
  onOnlineUsers?: (payload: OnlineUsers) => void;
  onTypingStart?: (payload: TypingStart) => void;
  onTypingStop?: (payload: TypingStop) => void;
  onError?: (payload: { message: string }) => void;
  onJoined?: (payload: { room: string }) => void;
}

export function useChatSocket() {
  const isConnected: Ref<boolean> = ref(false);
  const socketError: Ref<string> = ref("");

  function getSocket(): Socket {
    if (socket?.connected) return socket;
    const token = getAuthToken();
    if (!token) {
      throw new Error("Not authenticated");
    }
    if (socket) {
      socket.auth = { token };
      socket.connect();
      return socket;
    }
    socket = io(WS_BASE || window.location.origin, {
      auth: { token: token ?? "" },
      extraHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      transports: ["websocket", "polling"],
    });
    socket.on("connect", () => {
      isConnected.value = true;
      socketError.value = "";
      if (pendingJoin) {
        socket.emit("join_chat", pendingJoin);
        pendingJoin = null;
      }
    });
    socket.on("disconnect", () => {
      isConnected.value = false;
    });
    socket.on("connect_error", (err) => {
      socketError.value = err.message || "Connection failed";
    });
    return socket;
  }

  function connect(callbacks: ChatSocketCallbacks = {}): Socket | null {
    const token = getAuthToken();
    if (!token) {
      return null;
    }
    const s = getSocket();
    const off = () => {
      s.off("message:new");
      s.off("message:edited");
      s.off("message:deleted");
      s.off("message:read_by");
      s.off("message:reaction_added");
      s.off("message:reaction_removed");
      s.off("chat:updated");
      s.off("user:online");
      s.off("user:offline");
      s.off("online_users");
      s.off("typing:start");
      s.off("typing:stop");
      s.off("error");
      s.off("joined");
    };
    off();
    if (callbacks.onMessageNew) {
      s.on("message:new", (message: Message) => callbacks.onMessageNew!(message));
    }
    if (callbacks.onMessageEdited) {
      s.on("message:edited", (message: Message) => callbacks.onMessageEdited!(message));
    }
    if (callbacks.onMessageDeleted) {
      s.on("message:deleted", (payload: { messageId: string }) =>
        callbacks.onMessageDeleted!(payload),
      );
    }
    if (callbacks.onMessageReadBy) {
      s.on("message:read_by", (payload: MessageReadBy) =>
        callbacks.onMessageReadBy!(payload),
      );
    }
    if (callbacks.onMessageReactionAdded) {
      s.on("message:reaction_added", (payload: MessageReactionAdded) =>
        callbacks.onMessageReactionAdded!(payload),
      );
    }
    if (callbacks.onMessageReactionRemoved) {
      s.on("message:reaction_removed", (payload: MessageReactionRemoved) =>
        callbacks.onMessageReactionRemoved!(payload),
      );
    }
    if (callbacks.onChatUpdated) {
      s.on("chat:updated", (payload: ChatUpdated) =>
        callbacks.onChatUpdated!(payload),
      );
    }
    if (callbacks.onUserOnline) {
      s.on("user:online", (payload: UserOnline) =>
        callbacks.onUserOnline!(payload),
      );
    }
    if (callbacks.onUserOffline) {
      s.on("user:offline", (payload: UserOffline) =>
        callbacks.onUserOffline!(payload),
      );
    }
    if (callbacks.onOnlineUsers) {
      s.on("online_users", (payload: OnlineUsers) =>
        callbacks.onOnlineUsers!(payload),
      );
    }
    if (callbacks.onTypingStart) {
      s.on("typing:start", (payload: TypingStart) =>
        callbacks.onTypingStart!(payload),
      );
    }
    if (callbacks.onTypingStop) {
      s.on("typing:stop", (payload: TypingStop) =>
        callbacks.onTypingStop!(payload),
      );
    }
    if (callbacks.onError) {
      s.on("error", (payload: { message: string }) => callbacks.onError!(payload));
    }
    if (callbacks.onJoined) {
      s.on("joined", (payload: { room: string }) => callbacks.onJoined!(payload));
    }
    return s;
  }

  function joinChat(payload: ChatRoomPayload): void {
    if (!socket) return;
    if (socket.connected) {
      socket.emit("join_chat", payload);
      pendingJoin = null;
    } else {
      pendingJoin = payload;
    }
  }

  function leaveChat(payload: ChatRoomPayload): void {
    if (pendingJoin && payload.singleChatId === pendingJoin.singleChatId && payload.groupId === pendingJoin.groupId) {
      pendingJoin = null;
    }
    if (!socket?.connected) return;
    socket.emit("leave_chat", payload);
  }

  function sendMessage(
    content: string,
    payload: SendMessagePayload,
  ): void {
    if (!socket?.connected) return;
    socket.emit("message:send", {
      content,
      singleChatId: payload.singleChatId,
      groupId: payload.groupId,
      parentMessageId: payload.parentMessageId,
      messageType: payload.messageType,
    });
  }

  function editMessage(
    messageId: string,
    content: string,
    payload: ChatRoomPayload,
  ): void {
    if (!socket?.connected) return;
    socket.emit("message:edit", {
      messageId,
      content,
      singleChatId: payload.singleChatId,
      groupId: payload.groupId,
    });
  }

  function deleteMessage(messageId: string, payload: ChatRoomPayload): void {
    if (!socket?.connected) return;
    socket.emit("message:delete", {
      messageId,
      singleChatId: payload.singleChatId,
      groupId: payload.groupId,
    });
  }

  function typingStart(payload: ChatRoomPayload): void {
    if (!socket?.connected) return;
    socket.emit("typing:start", payload);
  }

  function typingStop(payload: ChatRoomPayload): void {
    if (!socket?.connected) return;
    socket.emit("typing:stop", payload);
  }

  function markMessageAsRead(messageId: string, payload: ChatRoomPayload): void {
    if (!socket?.connected) return;
    socket.emit("message:read", {
      messageId,
      singleChatId: payload.singleChatId,
      groupId: payload.groupId,
    });
  }

  function reactToMessage(messageId: string, emoji: string, payload: ChatRoomPayload): void {
    if (!socket?.connected) return;
    socket.emit("message:react", {
      messageId,
      emoji,
      singleChatId: payload.singleChatId,
      groupId: payload.groupId,
    });
  }

  function unreactToMessage(messageId: string, emoji: string, payload: ChatRoomPayload): void {
    if (!socket?.connected) return;
    socket.emit("message:unreact", {
      messageId,
      emoji,
      singleChatId: payload.singleChatId,
      groupId: payload.groupId,
    });
  }

  function markChatAsRead(payload: ChatRoomPayload, lastReadMessageId?: string): void {
    if (!socket?.connected) return;
    socket.emit("chat:mark_as_read", {
      singleChatId: payload.singleChatId,
      groupId: payload.groupId,
      lastReadMessageId,
    });
  }

  function getOnlineUsers(userIds: string[]): void {
    if (!socket?.connected) return;
    socket.emit("get:online_users", { userIds });
  }

  function disconnect(): void {
    if (socket) {
      socket.disconnect();
      socket = null;
      isConnected.value = false;
    }
  }

  onUnmounted(() => {
    // Keep socket alive for app-level; only disconnect on logout if desired
  });

  return {
    isConnected,
    socketError,
    connect,
    joinChat,
    leaveChat,
    sendMessage,
    editMessage,
    deleteMessage,
    markMessageAsRead,
    reactToMessage,
    unreactToMessage,
    markChatAsRead,
    getOnlineUsers,
    typingStart,
    typingStop,
    disconnect,
    getSocket,
  };
}
