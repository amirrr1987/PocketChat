import { z } from 'zod';
import { GroupRoleEnum } from '../../enums';

const uuid = z.string().uuid();

export const CreateGroupMemberSchema = z.object({
  groupId: uuid,
  userId: uuid,
  role: z.nativeEnum(GroupRoleEnum),
});

export const UpdateGroupMemberSchema = CreateGroupMemberSchema.partial();
