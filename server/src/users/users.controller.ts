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
import type { UserCreateDto, UserDto, UserUpdateDto } from './dto/user.dto';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Create a new user account by username',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: {
          type: 'string',
          minLength: 3,
          example: 'john_doe',
          description: 'Unique username for the user',
        },
        password: {
          type: 'string',
          minLength: 8,
          example: 'password123',
          description: 'User password',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Username already exists' })
  createByUsername(@Body() createUserDto: UserCreateDto): Promise<void> {
    return this.usersService.createByUsername(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all users',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
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
          username: {
            type: 'string',
            example: 'john_doe',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00.000Z',
          },
        },
      },
    },
  })
  findAll(): Promise<UserEntity[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their ID',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        username: {
          type: 'string',
          example: 'john_doe',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  findById(@Param('id') id: UserDto['id']): Promise<UserEntity> {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Update user by ID',
    description: 'Update user information (username and/or password)',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID (UUID)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          minLength: 3,
          example: 'john_doe_updated',
          description: 'New username (optional)',
        },
        password: {
          type: 'string',
          minLength: 8,
          example: 'newPassword123',
          description: 'New password (optional)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Username already exists' })
  updateById(
    @Param('id') id: UserDto['id'],
    @Body() updateUserDto: UserUpdateDto,
  ): Promise<void> {
    return this.usersService.updateById(id, updateUserDto);
  }

  @Delete(':id')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Delete user by ID',
    description: 'Delete a user account permanently',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID (UUID)',
  })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  deleteById(@Param('id') id: UserDto['id']): Promise<void> {
    return this.usersService.deleteById(id);
  }
}
