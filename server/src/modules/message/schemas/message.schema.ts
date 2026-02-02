import { z } from 'zod';
import { MessageTypeEnum } from '../../../common/enums';

export const messageSchema = z.object({
  id: z.uuid(),
  senderId: z.uuid(),
  singleChatId: z.uuid().nullable(),
  groupId: z.uuid().nullable(),
  content: z.string().min(1),
  messageType: z.nativeEnum(MessageTypeEnum).optional(),
  parentMessageId: z.uuid().nullable().optional(),
  createdAt: z.date(),
  editedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
});

export const messageCreateSchema = z.object({
  senderId: z.uuid(),
  singleChatId: z.uuid().nullable().optional(),
  groupId: z.uuid().nullable().optional(),
  content: z.string().min(1),
  messageType: z.nativeEnum(MessageTypeEnum).optional(),
  parentMessageId: z.uuid().nullable().optional(),
});

export const messageUpdateSchema = messageCreateSchema.partial();
