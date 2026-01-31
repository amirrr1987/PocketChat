import { z } from 'zod';
export const CreateChatSchema = z.object({
  type: z.enum(['single', 'group', 'channel']),
  title: z.string().optional(),
  ownerId: z.number().optional(),
});