import { z } from 'zod';
export const userSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3),
  password: z.string().min(8),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userCreateSchema = userSchema.omit({
  createdAt: true,
  updatedAt: true,
  id: true,
});
export const userUpdateSchema = userSchema
  .partial()
  .omit({ createdAt: true, updatedAt: true, id: true });
