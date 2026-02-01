import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  GroupMemberCreateDto,
  GroupMemberDto,
  GroupMemberUpdateDto,
} from './dto/group-member.dto';
import { GroupMemberEntity } from './entities/group-member.entity';

@Injectable()
export class GroupMembersService {
  constructor(
    @InjectRepository(GroupMemberEntity)
    private readonly groupMemberRepository: Repository<GroupMemberEntity>,
  ) {}

  create(createGroupMemberDto: GroupMemberCreateDto) {
    const member = this.groupMemberRepository.create(createGroupMemberDto);
    return this.groupMemberRepository.save(member);
  }

  findAll() {
    return this.groupMemberRepository.find({
      relations: ['group', 'user'],
    });
  }

  findByGroup(groupId: string) {
    return this.groupMemberRepository.find({
      where: { groupId },
      relations: ['user'],
    });
  }

  findByUser(userId: string) {
    return this.groupMemberRepository.find({
      where: { userId },
      relations: ['group'],
    });
  }

  async findOne(id: GroupMemberDto['id']) {
    const member = await this.groupMemberRepository.findOne({
      where: { id },
      relations: ['group', 'user'],
    });
    if (!member) throw new NotFoundException(`Group member #${id} not found`);
    return member;
  }

  async update(id: GroupMemberDto['id'], updateGroupMemberDto: GroupMemberUpdateDto) {
    await this.findOne(id);
    await this.groupMemberRepository.update(id, updateGroupMemberDto);
    return this.findOne(id);
  }

  async remove(id: GroupMemberDto['id']) {
    await this.findOne(id);
    await this.groupMemberRepository.delete(id);
  }
}
