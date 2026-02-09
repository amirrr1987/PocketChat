import type { IUser } from "@/models/user.model";

export interface IConversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IConversationWithOther extends IConversation {
  otherParticipant?: IUser;
}

export interface IMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt?: string;
}
