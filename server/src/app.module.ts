import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './chats/chats.module';
import { GroupMembersModule } from './group-members/group-members.module';
import { MessagesModule } from './messages/messages.module';
import { UserEntity } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { ChatBaseEntity } from './chats/entities/chat-base.entity';
import { SingleChatEntity } from './chats/entities/single-chat.entity';
import { GroupEntity } from './chats/entities/group.entity';
import { GroupMemberEntity } from './group-members/entities/group-member.entity';
import { MessageEntity } from './messages/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_DATABASE ?? 'pocket_chat',
      entities: [
        UserEntity,
        ChatBaseEntity,
        SingleChatEntity,
        GroupEntity,
        GroupMemberEntity,
        MessageEntity,
      ],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    ChatsModule,
    UsersModule,
    GroupMembersModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
