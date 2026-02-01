import { z } from 'zod';
import { LoginSchema,ForgotSchema,RegisterSchema } from '@/schemas/auth.schema';

export type LoginDto = z.infer<typeof LoginSchema>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
export type ForgotDto = z.infer<typeof ForgotSchema>;
