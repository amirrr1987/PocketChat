import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupRoleEnum } from '../../common/enums';
import type {
  ChatUpdateDto,
  GroupChatCreateDto,
  SingleChatCreateDto,
} from './dto/chat.dto';
import { GroupEntity } from './entities/group.entity';
import { SingleChatEntity } from './entities/single-chat.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
    @InjectRepository(SingleChatEntity)
    private readonly singleChatRepository: Repository<SingleChatEntity>,
  ) {}

  async createGroup(createGroupChatDto: GroupChatCreateDto) {
    const group = this.groupRepository.create(createGroupChatDto);
    const savedGroup = await this.groupRepository.save(group);
    // Note: Owner should be added as a member by the controller or a separate service
    // This is handled in the controller to avoid circular dependencies
    return savedGroup;
  }

  async createSingle(createSingleChatDto: SingleChatCreateDto) {
    let { user1Id, user2Id } = createSingleChatDto;
    if (user1Id > user2Id) {
      [user1Id, user2Id] = [user2Id, user1Id];
    }
    // Check if single chat already exists
    const existing = await this.singleChatRepository.findOne({
      where: { user1Id, user2Id },
      relations: ['user1', 'user2'],
    });
    if (existing) {
      return existing;
    }
    const singleChat = this.singleChatRepository.create({ user1Id, user2Id });
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

  async updateGroup(id: string, updateChatDto: ChatUpdateDto) {
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
