import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatBaseEntity } from './entities/chat-base.entity';
import { GroupEntity } from './entities/group.entity';
import { SingleChatEntity } from './entities/single-chat.entity';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatBaseEntity, SingleChatEntity, GroupEntity]),
  ],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [TypeOrmModule, ChatsService],
})
export class ChatsModule {}
