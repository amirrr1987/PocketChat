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
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('group-members')
@Controller('group-members')
export class GroupMembersController {
  constructor(private readonly groupMembersService: GroupMembersService) {}

  @Post()
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Create a group member',
    description: 'Add a user to a group chat with a specific role',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['groupId', 'userId', 'role'],
      properties: {
        groupId: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
          description: 'ID of the group chat',
        },
        userId: {
          type: 'string',
          format: 'uuid',
          example: '223e4567-e89b-12d3-a456-426614174001',
          description: 'ID of the user to add to the group',
        },
        role: {
          type: 'string',
          enum: ['OWNER', 'ADMIN', 'MEMBER'],
          example: 'MEMBER',
          description: 'Role of the user in the group',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Group member created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Group chat or user not found' })
  create(@Body() createGroupMemberDto: GroupMemberCreateDto) {
    return this.groupMembersService.create(createGroupMemberDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get group members',
    description:
      'Retrieve group members. Can filter by groupId or userId query parameters, or get all group members if no filter is provided.',
  })
  @ApiQuery({
    name: 'groupId',
    required: false,
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter group members by group chat ID',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: 'string',
    format: 'uuid',
    example: '223e4567-e89b-12d3-a456-426614174001',
    description: 'Filter group members by user ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Group members retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          groupId: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          userId: {
            type: 'string',
            format: 'uuid',
            example: '223e4567-e89b-12d3-a456-426614174001',
          },
          role: {
            type: 'string',
            enum: ['OWNER', 'ADMIN', 'MEMBER'],
            example: 'MEMBER',
          },
          joinedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00.000Z',
          },
          leftAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: null,
          },
        },
      },
    },
  })
  findAll(
    @Query('groupId') groupId?: string,
    @Query('userId') userId?: string,
  ) {
    if (groupId) return this.groupMembersService.findByGroup(groupId);
    if (userId) return this.groupMembersService.findByUser(userId);
    return this.groupMembersService.findAll();
  }

  @Get(':id')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Get group member by ID',
    description: 'Retrieve a specific group member by its ID',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Group member ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Group member retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        groupId: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        userId: {
          type: 'string',
          format: 'uuid',
          example: '223e4567-e89b-12d3-a456-426614174001',
        },
        role: {
          type: 'string',
          enum: ['OWNER', 'ADMIN', 'MEMBER'],
          example: 'MEMBER',
        },
        joinedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
        leftAt: {
          type: 'string',
          format: 'date-time',
          nullable: true,
          example: null,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Group member not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  findOne(@Param('id') id: GroupMemberDto['id']) {
    return this.groupMembersService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Update group member',
    description: 'Update group member information (role)',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Group member ID (UUID)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        groupId: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
          description: 'Group ID (optional)',
        },
        userId: {
          type: 'string',
          format: 'uuid',
          example: '223e4567-e89b-12d3-a456-426614174001',
          description: 'User ID (optional)',
        },
        role: {
          type: 'string',
          enum: ['OWNER', 'ADMIN', 'MEMBER'],
          example: 'ADMIN',
          description: 'New role for the group member (optional)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Group member updated successfully' })
  @ApiResponse({ status: 404, description: 'Group member not found' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  update(
    @Param('id') id: GroupMemberDto['id'],
    @Body() updateGroupMemberDto: GroupMemberUpdateDto,
  ) {
    return this.groupMembersService.update(id, updateGroupMemberDto);
  }

  @Delete(':id')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Delete group member',
    description: 'Remove a user from a group chat',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Group member ID (UUID)',
  })
  @ApiResponse({ status: 200, description: 'Group member deleted successfully' })
  @ApiResponse({ status: 404, description: 'Group member not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  remove(@Param('id') id: GroupMemberDto['id']) {
    return this.groupMembersService.remove(id);
  }
}
