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
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type {
  MessageCreateDto,
  MessageDto,
  MessageUpdateDto,
} from './dto/message.dto';
import { MessagesService } from './messages.service';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Create a new message',
    description:
      'Create a new message in either a single chat or group. One of singleChatId or groupId must be provided.',
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
          description:
            'ID of the single chat (required if groupId is not provided)',
        },
        groupId: {
          type: 'string',
          format: 'uuid',
          nullable: true,
          example: '223e4567-e89b-12d3-a456-426614174001',
          description:
            'ID of the group (required if singleChatId is not provided)',
        },
        content: {
          type: 'string',
          minLength: 1,
          example: 'Hello, how are you?',
          description: 'Message content',
        },
        messageType: {
          type: 'string',
          enum: ['TEXT', 'IMAGE', 'FILE'],
          example: 'TEXT',
          description: 'Message type (optional, default TEXT)',
        },
        parentMessageId: {
          type: 'string',
          format: 'uuid',
          nullable: true,
          example: null,
          description: 'ID of parent message for reply/thread (optional)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Message created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({
    status: 400,
    description: 'Either singleChatId or groupId must be provided',
  })
  async create(@Body() createMessageDto: MessageCreateDto) {
    console.log(
      '[MessagesController] Creating message via REST:',
      createMessageDto,
    );
    const result = await this.messagesService.create(createMessageDto);
    console.log('[MessagesController] Message created via REST:', result);
    return result;
  }

  @Get()
  @ApiOperation({
    summary: 'Get messages',
    description:
      'Retrieve messages. Can filter by singleChatId or groupId query parameters, or get all messages if no filter is provided.',
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
    name: 'groupId',
    required: false,
    type: 'string',
    format: 'uuid',
    example: '223e4567-e89b-12d3-a456-426614174001',
    description: 'Filter messages by group ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
  })
  findAll(
    @Query('singleChatId') singleChatId?: string,
    @Query('groupId') groupId?: string,
  ) {
    if (singleChatId)
      return this.messagesService.findBySingleChat(singleChatId);
    if (groupId) return this.messagesService.findByGroup(groupId);
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
        groupId: {
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
        groupId: {
          type: 'string',
          format: 'uuid',
          nullable: true,
          example: '223e4567-e89b-12d3-a456-426614174001',
          description: 'Group ID (optional)',
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
    description: 'Soft-delete a message (sets deletedAt)',
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
