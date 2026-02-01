import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import type {
  GroupMemberCreateDto,
  GroupMemberDto,
  GroupMemberUpdateDto,
} from './dto/group-member.dto';
import { GroupMembersService } from './group-members.service';

@Controller('group-members')
export class GroupMembersController {
  constructor(private readonly groupMembersService: GroupMembersService) {}

  @Post()
  @UsePipes(ZodValidationPipe)
  create(@Body() createGroupMemberDto: GroupMemberCreateDto) {
    return this.groupMembersService.create(createGroupMemberDto);
  }

  @Get()
  findAll(@Query('groupId') groupId?: string, @Query('userId') userId?: string) {
    if (groupId) return this.groupMembersService.findByGroup(groupId);
    if (userId) return this.groupMembersService.findByUser(userId);
    return this.groupMembersService.findAll();
  }

  @Get(':id')
  @UsePipes(ZodValidationPipe)
  findOne(@Param('id') id: GroupMemberDto['id']) {
    return this.groupMembersService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(ZodValidationPipe)
  update(
    @Param('id') id: GroupMemberDto['id'],
    @Body() updateGroupMemberDto: GroupMemberUpdateDto,
  ) {
    return this.groupMembersService.update(id, updateGroupMemberDto);
  }

  @Delete(':id')
  @UsePipes(ZodValidationPipe)
  remove(@Param('id') id: GroupMemberDto['id']) {
    return this.groupMembersService.remove(id);
  }
}
