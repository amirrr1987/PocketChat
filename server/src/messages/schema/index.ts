import { z } from 'zod';


export const messageSchema = z.object({
  id: z.uuid(),
  senderId: z.uuid(),
  singleChatId: z.uuid().nullable(),
  groupChatId: z.uuid().nullable(),
  content: z.string().min(1),
  createdAt: z.date(),
  editedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
});

export const messageCreateSchema = z.object({
  senderId: z.uuid(),
  singleChatId: z.uuid().nullable().optional(),
  groupChatId: z.uuid().nullable().optional(),
  content: z.string().min(1),
});

export const messageUpdateSchema = messageCreateSchema.partial();
