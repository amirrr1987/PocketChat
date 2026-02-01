import { z } from 'zod';
import {
  messageCreateSchema,
  messageSchema,
  messageUpdateSchema,
} from '../schema';

export type MessageDto = z.infer<typeof messageSchema>;
export type MessageCreateDto = z.infer<typeof messageCreateSchema>;
export type MessageUpdateDto = z.infer<typeof messageUpdateSchema>;
