import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './modules/chat-gateway/chat.module';
import { ChatsModule } from './modules/chats/chats.module';
import { GroupEntity } from './modules/chats/entities/group.entity';
import { SingleChatEntity } from './modules/chats/entities/single-chat.entity';
import { GroupMemberEntity } from './modules/group-members/entities/group-member.entity';
import { GroupMembersModule } from './modules/group-members/group-members.module';
import { MessageEntity } from './modules/message/entities/message.entity';
import { MessagesModule } from './modules/message/messages.module';
import { UserEntity } from './modules/user/entities/user.entity';
import { UsersModule } from './modules/user/users.module';

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
        SingleChatEntity,
        GroupEntity,
        GroupMemberEntity,
        MessageEntity,
      ],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    ChatModule,
    ChatsModule,
    UsersModule,
    GroupMembersModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
