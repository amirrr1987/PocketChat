import { createZodDto } from '@anatine/zod-nestjs';
import { userCreateSchema } from '../schema';

export class UserCreateDto extends createZodDto(userCreateSchema) {}
