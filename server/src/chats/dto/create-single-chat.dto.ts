import { createZodDto } from '@anatine/zod-nestjs';
import { CreateSingleChatSchema } from '../schema';

export class CreateSingleChatDto extends createZodDto(CreateSingleChatSchema) {}
