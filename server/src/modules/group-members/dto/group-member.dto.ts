import { z } from 'zod';
import {
  groupMemberCreateSchema,
  groupMemberSchema,
  groupMemberUpdateSchema,
} from '../schema/group-member.schema';

export type GroupMemberDto = z.infer<typeof groupMemberSchema>;
export type GroupMemberCreateDto = z.infer<typeof groupMemberCreateSchema>;
export type GroupMemberUpdateDto = z.infer<typeof groupMemberUpdateSchema>;
