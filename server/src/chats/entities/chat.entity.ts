import { ChatMemberEntity } from "src/chat-members/entities/chat-member.entity";
import { UserEntity } from "src/users/entities/user.entity";

export class ChatEntity {
  id: number;
  type: 'single' | 'group' | 'channel';
  title: string | null;
  ownerId: number | null;
  createdAt: Date;
  owner?: UserEntity;
  members?: ChatMemberEntity[];
}
