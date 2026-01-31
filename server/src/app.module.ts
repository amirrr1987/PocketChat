import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { ChatsModule } from './chats/chats.module';
import { ChatMembersModule } from './chat-members/chat-members.module';
import { MessageReadModule } from './message-read/message-read.module';

@Module({
  imports: [AuthModule, UsersModule, MessagesModule, ChatsModule, ChatMembersModule, MessageReadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
