import { createZodDto } from '@anatine/zod-nestjs';
import { UpdateGroupMemberSchema } from '../schema';

export class UpdateGroupMemberDto extends createZodDto(UpdateGroupMemberSchema) {}
