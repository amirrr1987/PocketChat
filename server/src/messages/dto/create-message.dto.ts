import { createZodDto } from '@anatine/zod-nestjs';
import { CreateMessageSchema } from '../schema';

export class CreateMessageDto extends createZodDto(CreateMessageSchema) {}
