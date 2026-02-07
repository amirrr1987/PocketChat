import { apiGet } from "./client";

export interface ChatUserState {
  id: string;
  userId: string;
  chatId: string;
  chatType: "single" | "group";
  unreadCount: number;
  lastReadMessageId: string | null;
  isMuted: boolean;
  isArchived: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export function getChatState(
  chatId: string,
  chatType: "single" | "group"
): Promise<ChatUserState> {
  return apiGet<ChatUserState>(`/chats/${chatId}/state?chatType=${chatType}`);
}

export function getAllChatStates(): Promise<ChatUserState[]> {
  return apiGet<ChatUserState[]>("/chat-user-state/me");
}
