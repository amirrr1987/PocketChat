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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(ZodValidationPipe)
  create(@Body() createUserDto: UserCreateDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UsePipes(ZodValidationPipe)
  findOne(@Param('id') id: UserDto['id']) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(ZodValidationPipe)
  update(@Param('id') id: UserDto['id'], @Body() updateUserDto: UserUpdateDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UsePipes(ZodValidationPipe)
  remove(@Param('id') id: UserDto['id']) {
    return this.usersService.remove(id);
  }
}
