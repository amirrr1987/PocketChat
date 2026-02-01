import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { CreateSingleChatDto } from './dto/create-single-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('group')
  createGroup(@Body() createGroupChatDto: CreateGroupChatDto) {
    return this.chatsService.createGroup(createGroupChatDto);
  }

  @Post('single')
  createSingle(@Body() createSingleChatDto: CreateSingleChatDto) {
    return this.chatsService.createSingle(createSingleChatDto);
  }

  @Get()
  findAll() {
    return this.chatsService.findAll();
  }

  @Get('group/:id')
  findGroup(@Param('id') id: string) {
    return this.chatsService.findGroup(id);
  }

  @Get('single/:id')
  findSingle(@Param('id') id: string) {
    return this.chatsService.findSingle(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatsService.findOne(id);
  }

  @Patch('group/:id')
  updateGroup(
    @Param('id') id: string,
    @Body() updateChatDto: UpdateChatDto,
  ) {
    return this.chatsService.updateGroup(id, updateChatDto);
  }

  @Delete('group/:id')
  removeGroup(@Param('id') id: string) {
    return this.chatsService.removeGroup(id);
  }

  @Delete('single/:id')
  removeSingle(@Param('id') id: string) {
    return this.chatsService.removeSingle(id);
  }
}
