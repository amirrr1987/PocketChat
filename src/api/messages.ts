import { apiGet, apiPost, apiPatch, apiDelete } from "./client";

export type MessageType = "TEXT" | "IMAGE" | "FILE";

export interface MessageSender {
  id: string;
  username: string;
}

export interface Message {
  id: string;
  senderId: string;
  sender?: MessageSender;
  singleChatId: string | null;
  groupId: string | null;
  content: string;
  messageType?: MessageType;
  parentMessageId?: string | null;
  createdAt: string;
  editedAt?: string | null;
  deletedAt?: string | null;
  fileUrl?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  thumbnailUrl?: string | null;
}

export interface MessageReadStatus {
  id: string;
  messageId: string;
  userId: string;
  readAt: string;
  user?: MessageSender;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
  user?: MessageSender;
}

export interface CreateMessagePayload {
  senderId: string;
  content: string;
  singleChatId?: string | null;
  groupId?: string | null;
  messageType?: MessageType;
  parentMessageId?: string | null;
}

export function fetchMessagesBySingleChat(singleChatId: string): Promise<Message[]> {
  return apiGet<Message[]>(`/messages?singleChatId=${encodeURIComponent(singleChatId)}`);
}

export function fetchMessagesByGroup(groupId: string): Promise<Message[]> {
  return apiGet<Message[]>(`/messages?groupId=${encodeURIComponent(groupId)}`);
}

export function createMessage(payload: CreateMessagePayload): Promise<Message> {
  return apiPost<Message>("/messages", payload);
}

export function updateMessage(id: string, data: { content?: string }): Promise<Message> {
  return apiPatch<Message>(`/messages/${id}`, data);
}

export function deleteMessage(id: string): Promise<Message> {
  return apiDelete<Message>(`/messages/${id}`);
}

export function getMessageReadStatus(messageId: string): Promise<MessageReadStatus[]> {
  return apiGet<MessageReadStatus[]>(`/message-read-status/message/${messageId}`);
}

export function getMessageReadCount(messageId: string): Promise<{ count: number }> {
  return apiGet<{ count: number }>(`/message-read-status/message/${messageId}/count`);
}

export function getMessageReactions(messageId: string): Promise<MessageReaction[]> {
  return apiGet<MessageReaction[]>(`/message-reactions/message/${messageId}`);
}

export function getMessageReactionCounts(messageId: string): Promise<{ counts: Record<string, number> }> {
  return apiGet<{ counts: Record<string, number> }>(`/message-reactions/message/${messageId}/counts`);
}

export async function uploadFile(
  file: File,
  chatPayload: { singleChatId?: string; groupId?: string; parentMessageId?: string }
): Promise<Message> {
  const formData = new FormData();
  formData.append("file", file);
  if (chatPayload.singleChatId) {
    formData.append("singleChatId", chatPayload.singleChatId);
  }
  if (chatPayload.groupId) {
    formData.append("groupId", chatPayload.groupId);
  }
  if (chatPayload.parentMessageId) {
    formData.append("parentMessageId", chatPayload.parentMessageId);
  }

  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiPrefix()}/messages/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { message: res.statusText || "Upload failed" };
    }
    const err = {
      status: res.status,
      message:
        data && typeof data === "object" && "message" in data && typeof (data as { message: unknown }).message === "string"
          ? (data as { message: string }).message
          : res.statusText || "Upload failed",
      details: data,
    };
    throw err;
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function getApiPrefix(): string {
  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
  const API_VERSION = "1";
  return `${API_BASE}/api/v${API_VERSION}`;
}

function getAuthToken(): string | null {
  return localStorage.getItem("access_token");
}
