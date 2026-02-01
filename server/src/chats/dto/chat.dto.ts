import { z } from 'zod';
import {
  CreateGroupChatSchema,
  CreateSingleChatSchema,
  UpdateChatSchema,
} from '../schema';

export type GroupChatCreateDto = z.infer<typeof CreateGroupChatSchema>;
export type SingleChatCreateDto = z.infer<typeof CreateSingleChatSchema>;
export type ChatUpdateDto = z.infer<typeof UpdateChatSchema>;
