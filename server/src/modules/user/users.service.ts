import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { UserCreateDto, UserDto, UserUpdateDto } from './dto/user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findByUsername(username: UserDto['username']): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) throw new NotFoundException(`User #${username} not found`);
    return user;
  }

  /** For auth only: returns user with password selected. */
  async findByUsernameWithPassword(
    username: UserDto['username'],
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { username },
      select: ['id', 'username', 'password', 'createdAt', 'updatedAt'],
    });
  }

  async findById(id: UserDto['id']): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async createByUsername(data: UserCreateDto): Promise<void> {
    // const existing = await this.findByUsername(data.username);
    const existing = await this.userRepository.findOneBy({
      username: data.username,
    });
    if (existing) {
      throw new ConflictException('Username already exists');
    }
    const user = this.userRepository.create(data);
    await this.userRepository.save(user);
  }

  findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async updateById(
    id: UserDto['id'],
    updateUserDto: UserUpdateDto,
  ): Promise<void> {
    await this.findById(id);
    await this.userRepository.update(id, updateUserDto as Partial<UserEntity>);
  }

  async deleteById(id: UserDto['id']): Promise<void> {
    await this.findById(id);
    await this.userRepository.delete(id);
  }
}
