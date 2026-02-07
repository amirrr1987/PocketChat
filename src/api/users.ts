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
