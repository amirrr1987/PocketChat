import { z } from 'zod';

const uuid = z.uuid();


export const CreateGroupChatSchema = z.object({
  title: z.string().min(1),
  ownerId: uuid,
});

export const CreateSingleChatSchema = z.object({
  user1Id: uuid,
  user2Id: uuid,
});

export const UpdateChatSchema = CreateGroupChatSchema.partial();
