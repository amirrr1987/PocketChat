import { z } from 'zod';
import { ForgotSchema, LoginSchema, RegisterSchema } from '../schema/auth.schema';

export type LoginDto = z.infer<typeof LoginSchema>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
export type ForgotDto = z.infer<typeof ForgotSchema>;
