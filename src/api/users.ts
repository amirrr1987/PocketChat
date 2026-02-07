import { apiGet, apiPatch, getAuthUser } from "./client";

export interface User {
  id: string;
  username: string;
  email?: string | null;
  lastSeenAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export function fetchUsers(): Promise<User[]> {
  return apiGet<User[]>("/users");
}

export function getUserById(id: string): Promise<User> {
  return apiGet<User>(`/users/${id}`);
}

export function getCurrentUser(): Promise<User> {
  const currentUser = getAuthUser();
  if (!currentUser) {
    throw new Error("Not authenticated");
  }
  return getUserById(currentUser.id);
}

export function updateUser(id: string, data: { email?: string }): Promise<User> {
  return apiPatch<User>(`/users/${id}`, data);
}

/** Search users by username (partial, case-insensitive). Min 2 characters. */
export function searchUsersByUsername(username: string): Promise<User[]> {
  const q = username.trim();
  if (!q) return Promise.resolve([]);
  return apiGet<User[]>(`/users/search?username=${encodeURIComponent(q)}`);
}
