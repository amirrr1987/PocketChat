import { createZodDto } from '@anatine/zod-nestjs';
import { CreateGroupChatSchema } from '../schema';

export class CreateGroupChatDto extends createZodDto(CreateGroupChatSchema) {}
