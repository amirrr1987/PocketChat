import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMembersModule } from '../group-members/group-members.module';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { GroupEntity } from './entities/group.entity';
import { SingleChatEntity } from './entities/single-chat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SingleChatEntity, GroupEntity]),
    GroupMembersModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [TypeOrmModule, ChatsService],
})
export class ChatsModule {}
