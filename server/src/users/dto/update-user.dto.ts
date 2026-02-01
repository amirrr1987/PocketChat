import { createZodDto } from '@anatine/zod-nestjs';
import { userUpdateSchema } from '../schema';

export class UserUpdateDto extends createZodDto(userUpdateSchema) {}
