import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import type {
  ChatUpdateDto,
  GroupChatCreateDto,
  SingleChatCreateDto,
} from './dto/chat.dto';
import { ChatsService } from './chats.service';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('group')
  @UsePipes(ZodValidationPipe)
  createGroup(@Body() createGroupChatDto: GroupChatCreateDto) {
    return this.chatsService.createGroup(createGroupChatDto);
  }

  @Post('single')
  @UsePipes(ZodValidationPipe)
  createSingle(@Body() createSingleChatDto: SingleChatCreateDto) {
    return this.chatsService.createSingle(createSingleChatDto);
  }

  @Get()
  findAll() {
    return this.chatsService.findAll();
  }

  @Get('group/:id')
  @UsePipes(ZodValidationPipe)
  findGroup(@Param('id') id: string) {
    return this.chatsService.findGroup(id);
  }

  @Get('single/:id')
  @UsePipes(ZodValidationPipe)
  findSingle(@Param('id') id: string) {
    return this.chatsService.findSingle(id);
  }

  @Get(':id')
  @UsePipes(ZodValidationPipe)
  findOne(@Param('id') id: string) {
    return this.chatsService.findOne(id);
  }

  @Patch('group/:id')
  @UsePipes(ZodValidationPipe)
  updateGroup(@Param('id') id: string, @Body() updateChatDto: ChatUpdateDto) {
    return this.chatsService.updateGroup(id, updateChatDto);
  }

  @Delete('group/:id')
  @UsePipes(ZodValidationPipe)
  removeGroup(@Param('id') id: string) {
    return this.chatsService.removeGroup(id);
  }

  @Delete('single/:id')
  @UsePipes(ZodValidationPipe)
  removeSingle(@Param('id') id: string) {
    return this.chatsService.removeSingle(id);
  }
}
