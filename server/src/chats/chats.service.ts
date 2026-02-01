import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupEntity } from './entities/group.entity';
import { SingleChatEntity } from './entities/single-chat.entity';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { CreateSingleChatDto } from './dto/create-single-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
    @InjectRepository(SingleChatEntity)
    private readonly singleChatRepository: Repository<SingleChatEntity>,
  ) {}

  async createGroup(createGroupChatDto: CreateGroupChatDto) {
    const group = this.groupRepository.create(createGroupChatDto);
    return this.groupRepository.save(group);
  }

  async createSingle(createSingleChatDto: CreateSingleChatDto) {
    const singleChat = this.singleChatRepository.create(createSingleChatDto);
    return this.singleChatRepository.save(singleChat);
  }

  async findAll() {
    const [groups, singleChats] = await Promise.all([
      this.groupRepository.find({ relations: ['owner'] }),
      this.singleChatRepository.find({ relations: ['user1', 'user2'] }),
    ]);
    return { groups, singleChats };
  }

  async findGroup(id: string) {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!group) throw new NotFoundException(`Group #${id} not found`);
    return group;
  }

  async findSingle(id: string) {
    const single = await this.singleChatRepository.findOne({
      where: { id },
      relations: ['user1', 'user2'],
    });
    if (!single) throw new NotFoundException(`Single chat #${id} not found`);
    return single;
  }

  async findOne(id: string) {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (group) return group;
    const single = await this.singleChatRepository.findOne({
      where: { id },
      relations: ['user1', 'user2'],
    });
    if (single) return single;
    throw new NotFoundException(`Chat #${id} not found`);
  }

  async updateGroup(id: string, updateChatDto: UpdateChatDto) {
    await this.findGroup(id);
    await this.groupRepository.update(id, updateChatDto);
    return this.findGroup(id);
  }

  async removeGroup(id: string) {
    await this.findGroup(id);
    await this.groupRepository.delete(id);
  }

  async removeSingle(id: string) {
    await this.findSingle(id);
    await this.singleChatRepository.delete(id);
  }
}
