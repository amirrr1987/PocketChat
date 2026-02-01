import { createZodDto } from '@anatine/zod-nestjs';
import { CreateGroupMemberSchema } from '../schema';

export class CreateGroupMemberDto extends createZodDto(CreateGroupMemberSchema) {}
