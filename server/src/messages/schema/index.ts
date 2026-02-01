import { z } from 'zod';

const uuid = z.string().uuid();

export const CreateMessageSchema = z.object({
  senderId: uuid,
  singleChatId: uuid.nullable().optional(),
  groupChatId: uuid.nullable().optional(),
  content: z.string().min(1),
});

export const UpdateMessageSchema = CreateMessageSchema.partial();
