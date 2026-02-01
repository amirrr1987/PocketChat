import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMemberEntity } from './entities/group-member.entity';
import { CreateGroupMemberDto } from './dto/create-group-member.dto';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto';

@Injectable()
export class GroupMembersService {
  constructor(
    @InjectRepository(GroupMemberEntity)
    private readonly groupMemberRepository: Repository<GroupMemberEntity>,
  ) {}

  create(createGroupMemberDto: CreateGroupMemberDto) {
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

  async findOne(id: string) {
    const member = await this.groupMemberRepository.findOne({
      where: { id },
      relations: ['group', 'user'],
    });
    if (!member) throw new NotFoundException(`Group member #${id} not found`);
    return member;
  }

  async update(id: string, updateGroupMemberDto: UpdateGroupMemberDto) {
    await this.findOne(id);
    await this.groupMemberRepository.update(id, updateGroupMemberDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.groupMemberRepository.delete(id);
  }
}
