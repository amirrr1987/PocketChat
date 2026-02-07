import { apiGet, apiPost, apiDelete } from "./client";

export interface ContactUser {
  id: string;
  username: string;
}

export interface Contact {
  id: string;
  userId: string;
  contactUserId: string;
  createdAt: string;
  contactUser?: ContactUser;
}

export function fetchContacts(): Promise<Contact[]> {
  return apiGet<Contact[]>("/contacts");
}

export function addContactByUserId(contactUserId: string): Promise<Contact> {
  return apiPost<Contact>("/contacts/by-user-id", { contactUserId });
}

export function addContactByUsername(username: string): Promise<Contact> {
  return apiPost<Contact>("/contacts/by-username", { username });
}

export function removeContact(contactUserId: string): Promise<void> {
  return apiDelete<void>(`/contacts/${contactUserId}`);
}
