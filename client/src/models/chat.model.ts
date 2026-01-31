import { z } from "zod";

const UserRefSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string(),
  createdAt: z.string(),
  read: z.boolean().optional(),
});

const ConversationSchema = z.object({
  id: z.string(),
  participants: z.array(UserRefSchema).min(1),
  lastMessage: MessageSchema.nullable().optional(),
  updatedAt: z.string(),
  unreadCount: z.number().optional(),
});

export type IUserRef = z.infer<typeof UserRefSchema>;
export type IMessage = z.infer<typeof MessageSchema>;
export type IConversation = z.infer<typeof ConversationSchema>;
