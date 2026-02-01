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
  MessageCreateDto,
  MessageDto,
  MessageUpdateDto,
} from './dto/message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UsePipes(ZodValidationPipe)
  create(@Body() createMessageDto: MessageCreateDto) {
    return this.messagesService.create(createMessageDto);
  }

  @Get()
  findAll(
    @Query('singleChatId') singleChatId?: string,
    @Query('groupChatId') groupChatId?: string,
  ) {
    if (singleChatId)
      return this.messagesService.findBySingleChat(singleChatId);
    if (groupChatId) return this.messagesService.findByGroupChat(groupChatId);
    return this.messagesService.findAll();
  }

  @Get(':id')
  @UsePipes(ZodValidationPipe)
  findOne(@Param('id') id: MessageDto['id']) {
    return this.messagesService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(ZodValidationPipe)
  update(
    @Param('id') id: MessageDto['id'],
    @Body() updateMessageDto: MessageUpdateDto,
  ) {
    return this.messagesService.update(id, updateMessageDto);
  }

  @Delete(':id')
  @UsePipes(ZodValidationPipe)
  remove(@Param('id') id: MessageDto['id']) {
    return this.messagesService.remove(id);
  }
}
