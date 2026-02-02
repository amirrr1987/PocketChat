import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { ChatsModule } from '../chats/chats.module';
import { GroupMembersModule } from '../group-members/group-members.module';
import { MessagesModule } from '../message/messages.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [AuthModule, MessagesModule, ChatsModule, GroupMembersModule],
  providers: [ChatGateway],
})
export class ChatModule {}
