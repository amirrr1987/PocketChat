import { createZodDto } from '@anatine/zod-nestjs';
import { UpdateMessageSchema } from '../schema';

export class UpdateMessageDto extends createZodDto(UpdateMessageSchema) {}
