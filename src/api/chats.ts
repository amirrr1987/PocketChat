import { apiGet, apiPost, apiPatch, apiDelete } from "./client";

export interface UserRef {
  id: string;
  username: string;
}

export interface GroupChat {
  id: string;
  title: string;
  ownerId: string;
  owner?: UserRef;
  lastMessageId?: string | null;
  lastMessageAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SingleChat {
  id: string;
  user1Id: string;
  user2Id: string;
  user1?: UserRef;
  user2?: UserRef;
  lastMessageId?: string | null;
  lastMessageAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatsResponse {
  groups: GroupChat[];
  singleChats: SingleChat[];
}

export function fetchChats(): Promise<ChatsResponse> {
  return apiGet<ChatsResponse>("/chats");
}

export function fetchChatById(id: string): Promise<GroupChat | SingleChat> {
  return apiGet<GroupChat | SingleChat>(`/chats/${id}`);
}

export function fetchGroupById(id: string): Promise<GroupChat> {
  return apiGet<GroupChat>(`/chats/group/${id}`);
}

export function fetchSingleById(id: string): Promise<SingleChat> {
  return apiGet<SingleChat>(`/chats/single/${id}`);
}

export function createSingleChat(user1Id: string, user2Id: string): Promise<SingleChat> {
  return apiPost<SingleChat>("/chats/single", { user1Id, user2Id });
}

export function createGroupChat(title: string, ownerId: string): Promise<GroupChat> {
  return apiPost<GroupChat>("/chats/group", { title, ownerId });
}

export function updateGroup(id: string, data: { title?: string; ownerId?: string }): Promise<GroupChat> {
  return apiPatch<GroupChat>(`/chats/group/${id}`, data);
}

export function deleteGroup(id: string): Promise<void> {
  return apiDelete<void>(`/chats/group/${id}`);
}

export function deleteSingle(id: string): Promise<void> {
  return apiDelete<void>(`/chats/single/${id}`);
}
