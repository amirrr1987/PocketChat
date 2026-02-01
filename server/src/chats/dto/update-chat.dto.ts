import { createZodDto } from '@anatine/zod-nestjs';
import { UpdateChatSchema } from '../schema';

export class UpdateChatDto extends createZodDto(UpdateChatSchema) {}
