import { z } from 'zod';
import { userCreateSchema, userSchema, userUpdateSchema } from '../schema';

export type UserDto = z.infer<typeof userSchema>;
export type UserCreateDto = z.infer<typeof userCreateSchema>;
export type UserUpdateDto = z.infer<typeof userUpdateSchema>;