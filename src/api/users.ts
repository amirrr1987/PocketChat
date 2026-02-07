import { apiGet } from "./client";

export interface User {
  id: string;
  username: string;
  createdAt?: string;
  updatedAt?: string;
}

export function fetchUsers(): Promise<User[]> {
  return apiGet<User[]>("/users");
}

export function fetchUserById(id: string): Promise<User> {
  return apiGet<User>(`/users/${id}`);
}

/** Search users by username (partial, case-insensitive). Min 2 characters. */
export function searchUsersByUsername(username: string): Promise<User[]> {
  const q = username.trim();
  if (!q) return Promise.resolve([]);
  return apiGet<User[]>(`/users/search?username=${encodeURIComponent(q)}`);
}
