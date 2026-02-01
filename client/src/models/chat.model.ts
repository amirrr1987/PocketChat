import { z } from 'zod';
import { CreateGroupChatSchema,CreateSingleChatSchema,UpdateChatSchema } from '@/schemas/chat.schema';

export type CreateGroupChatDto = z.infer<typeof CreateGroupChatSchema>;
export type CreateSingleChatDto = z.infer<typeof CreateSingleChatSchema>;
export type UpdateChatDto = z.infer<typeof UpdateChatSchema>;
