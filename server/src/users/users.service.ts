import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { UserDto } from './dto/user.dto';
import type { UserCreateDto } from './dto/create-user.dto';
import type { UserUpdateDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findByUsername(
    username: UserDto['username'],
    withPassword = false,
  ): Promise<UserEntity | null> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username });
    if (withPassword) {
      qb.addSelect('user.password');
    }
    return qb.getOne();
  }

  async findOne(id: UserDto['id']): Promise<UserEntity> {
    const user = await this.userRepository.findOneByOrFail({ id });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async create(data: UserCreateDto): Promise<UserEntity> {
    const existing = await this.findByUsername(data.username);
    if (existing) {
      throw new ConflictException('Username already exists');
    }
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find();
  }

  async update(id: UserDto['id'], updateUserDto: UserUpdateDto) {
    await this.findOne(id);
    await this.userRepository.update(id, updateUserDto as Partial<UserEntity>);
    return this.findOne(id);
  }

  async remove(id: UserDto['id']) {
    await this.findOne(id);
    await this.userRepository.delete(id);
  }
}
