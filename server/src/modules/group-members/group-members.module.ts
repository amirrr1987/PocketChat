import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMemberEntity } from './entities/group-member.entity';
import { GroupMembersController } from './group-members.controller';
import { GroupMembersService } from './group-members.service';

@Module({
  imports: [TypeOrmModule.forFeature([GroupMemberEntity])],
  controllers: [GroupMembersController],
  providers: [GroupMembersService],
  exports: [TypeOrmModule, GroupMembersService],
})
export class GroupMembersModule {}
