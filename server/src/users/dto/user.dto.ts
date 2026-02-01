import { z } from 'zod';
import { userSchema } from '../schema';

export type UserDto = z.infer<typeof userSchema>;
