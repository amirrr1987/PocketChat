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
import { GroupRoleEnum } from '../../common/enums';
import type {
  ChatUpdateDto,
  GroupChatCreateDto,
  SingleChatCreateDto,
} from './dto/chat.dto';
import { ChatsService } from './chats.service';
import { GroupMembersService } from '../group-members/group-members.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('chats')
@Controller('chats')
export class ChatsController {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly groupMembersService: GroupMembersService,
  ) {}

  @Post('group')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Create a group chat',
    description: 'Create a new group chat with a title and owner',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'ownerId'],
      properties: {
        title: {
          type: 'string',
          minLength: 1,
          example: 'Project Team Chat',
          description: 'Title of the group chat',
        },
        ownerId: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
          description: 'ID of the user who owns the group chat',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Group chat created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Owner user not found' })
  async createGroup(@Body() createGroupChatDto: GroupChatCreateDto) {
    const group = await this.chatsService.createGroup(createGroupChatDto);
    // Add owner as a member with OWNER role
    await this.groupMembersService.create({
      groupId: group.id,
      userId: createGroupChatDto.ownerId,
      role: GroupRoleEnum.OWNER,
    });
    return group;
  }

  @Post('single')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Create a single chat',
    description: 'Create a new one-on-one chat between two users',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['user1Id', 'user2Id'],
      properties: {
        user1Id: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
          description: 'ID of the first user',
        },
        user2Id: {
          type: 'string',
          format: 'uuid',
          example: '223e4567-e89b-12d3-a456-426614174001',
          description: 'ID of the second user',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Single chat created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'One or both users not found' })
  createSingle(@Body() createSingleChatDto: SingleChatCreateDto) {
    return this.chatsService.createSingle(createSingleChatDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all chats',
    description: 'Retrieve a list of all chats (both group and single)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of chats retrieved successfully',
  })
  findAll() {
    return this.chatsService.findAll();
  }

  @Get('group/:id')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Get group chat by ID',
    description: 'Retrieve a specific group chat by its ID',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Group chat ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Group chat retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Group chat not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  findGroup(@Param('id') id: string) {
    return this.chatsService.findGroup(id);
  }

  @Get('single/:id')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Get single chat by ID',
    description: 'Retrieve a specific single chat by its ID',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Single chat ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Single chat retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Single chat not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  findSingle(@Param('id') id: string) {
    return this.chatsService.findSingle(id);
  }

  @Get(':id')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Get any chat by ID',
    description: 'Retrieve any chat (group or single) by its ID',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Chat ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  findOne(@Param('id') id: string) {
    return this.chatsService.findOne(id);
  }

  @Patch('group/:id')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Update group chat',
    description: 'Update group chat information (title and/or owner)',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Group chat ID (UUID)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          minLength: 1,
          example: 'Updated Project Team Chat',
          description: 'New title for the group chat (optional)',
        },
        ownerId: {
          type: 'string',
          format: 'uuid',
          example: '223e4567-e89b-12d3-a456-426614174001',
          description: 'New owner ID for the group chat (optional)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Group chat updated successfully' })
  @ApiResponse({ status: 404, description: 'Group chat not found' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  updateGroup(@Param('id') id: string, @Body() updateChatDto: ChatUpdateDto) {
    return this.chatsService.updateGroup(id, updateChatDto);
  }

  @Delete('group/:id')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Delete group chat',
    description: 'Permanently delete a group chat',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Group chat ID (UUID)',
  })
  @ApiResponse({ status: 200, description: 'Group chat deleted successfully' })
  @ApiResponse({ status: 404, description: 'Group chat not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  removeGroup(@Param('id') id: string) {
    return this.chatsService.removeGroup(id);
  }

  @Delete('single/:id')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Delete single chat',
    description: 'Permanently delete a single chat',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Single chat ID (UUID)',
  })
  @ApiResponse({ status: 200, description: 'Single chat deleted successfully' })
  @ApiResponse({ status: 404, description: 'Single chat not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  removeSingle(@Param('id') id: string) {
    return this.chatsService.removeSingle(id);
  }
}
