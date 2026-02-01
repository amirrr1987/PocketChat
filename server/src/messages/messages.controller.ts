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
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Create a new message',
    description:
      'Create a new message in either a single chat or group chat. One of singleChatId or groupChatId must be provided.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['senderId', 'content'],
      properties: {
        senderId: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
          description: 'ID of the user sending the message',
        },
        singleChatId: {
          type: 'string',
          format: 'uuid',
          nullable: true,
          example: '123e4567-e89b-12d3-a456-426614174000',
          description: 'ID of the single chat (required if groupChatId is not provided)',
        },
        groupChatId: {
          type: 'string',
          format: 'uuid',
          nullable: true,
          example: '223e4567-e89b-12d3-a456-426614174001',
          description: 'ID of the group chat (required if singleChatId is not provided)',
        },
        content: {
          type: 'string',
          minLength: 1,
          example: 'Hello, how are you?',
          description: 'Message content',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Message created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({
    status: 400,
    description: 'Either singleChatId or groupChatId must be provided',
  })
  create(@Body() createMessageDto: MessageCreateDto) {
    return this.messagesService.create(createMessageDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get messages',
    description:
      'Retrieve messages. Can filter by singleChatId or groupChatId query parameters, or get all messages if no filter is provided.',
  })
  @ApiQuery({
    name: 'singleChatId',
    required: false,
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter messages by single chat ID',
  })
  @ApiQuery({
    name: 'groupChatId',
    required: false,
    type: 'string',
    format: 'uuid',
    example: '223e4567-e89b-12d3-a456-426614174001',
    description: 'Filter messages by group chat ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
  })
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
  @ApiOperation({
    summary: 'Get message by ID',
    description: 'Retrieve a specific message by its ID',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Message ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Message retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        senderId: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        singleChatId: {
          type: 'string',
          format: 'uuid',
          nullable: true,
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        groupChatId: {
          type: 'string',
          format: 'uuid',
          nullable: true,
          example: '223e4567-e89b-12d3-a456-426614174001',
        },
        content: {
          type: 'string',
          example: 'Hello, how are you?',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
        editedAt: {
          type: 'string',
          format: 'date-time',
          nullable: true,
          example: '2024-01-01T01:00:00.000Z',
        },
        deletedAt: {
          type: 'string',
          format: 'date-time',
          nullable: true,
          example: null,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  findOne(@Param('id') id: MessageDto['id']) {
    return this.messagesService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Update message by ID',
    description: 'Update message content',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Message ID (UUID)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        senderId: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
          description: 'Sender ID (optional)',
        },
        singleChatId: {
          type: 'string',
          format: 'uuid',
          nullable: true,
          example: '123e4567-e89b-12d3-a456-426614174000',
          description: 'Single chat ID (optional)',
        },
        groupChatId: {
          type: 'string',
          format: 'uuid',
          nullable: true,
          example: '223e4567-e89b-12d3-a456-426614174001',
          description: 'Group chat ID (optional)',
        },
        content: {
          type: 'string',
          minLength: 1,
          example: 'Updated message content',
          description: 'Updated message content (optional)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Message updated successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  update(
    @Param('id') id: MessageDto['id'],
    @Body() updateMessageDto: MessageUpdateDto,
  ) {
    return this.messagesService.update(id, updateMessageDto);
  }

  @Delete(':id')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Delete message by ID',
    description: 'Permanently delete a message',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Message ID (UUID)',
  })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  remove(@Param('id') id: MessageDto['id']) {
    return this.messagesService.remove(id);
  }
}
