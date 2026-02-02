import { z } from 'zod';
import { GroupRoleEnum } from '../../../common/enums';

const uuid = z.uuid();

export const groupMemberSchema = z.object({
  id: uuid,
  groupId: uuid,
  userId: uuid,
  role: z.enum(GroupRoleEnum),
  joinedAt: z.date(),
  leftAt: z.date().nullable(),
});

export const groupMemberCreateSchema = groupMemberSchema.pick({
  groupId: true,
  userId: true,
  role: true,
});
export const groupMemberUpdateSchema = groupMemberCreateSchema.partial();
