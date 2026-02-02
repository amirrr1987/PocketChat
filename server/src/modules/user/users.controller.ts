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
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { UserCreateDto, UserDto, UserUpdateDto } from './dto/user.dto';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
          maxLength: 20,
        },
        password: {
          type: 'string',
          minLength: 4,
          maxLength: 8,
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{4,8}$',
          format: 'password',
        },
      },
    },
  })
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
          },
          username: {
            type: 'string',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
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
        },
        username: {
          type: 'string',
          example: 'john_doe',
        },
        createdAt: {
          type: 'date',
          format: 'date-time',
        },
        updatedAt: {
          type: 'date',
          format: 'date-time',
        },
      },
    },
  })
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
  deleteById(@Param('id') id: UserDto['id']): Promise<void> {
    return this.usersService.deleteById(id);
  }
}
