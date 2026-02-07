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
