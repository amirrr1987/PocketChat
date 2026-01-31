import { ChatEntity } from "src/chats/entities/chat.entity";
import { UserEntity } from "src/users/entities/user.entity";

export class ChatMemberEntity {
  chatId: number; // FK → chats.id
  userId: number; // FK → users.id
  role: 'member' | 'admin';
  // relations
  chat?: ChatEntity;
  user?: UserEntity;
}
