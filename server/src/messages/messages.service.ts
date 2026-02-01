import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  create(createMessageDto: CreateMessageDto) {
    const message = this.messageRepository.create(createMessageDto);
    return this.messageRepository.save(message);
  }

  findAll() {
    return this.messageRepository.find({
      relations: ['sender', 'singleChat', 'group'],
    });
  }

  findBySingleChat(singleChatId: string) {
    return this.messageRepository.find({
      where: { singleChatId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  findByGroupChat(groupChatId: string) {
    return this.messageRepository.find({
      where: { groupChatId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string) {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['sender', 'singleChat', 'group'],
    });
    if (!message) throw new NotFoundException(`Message #${id} not found`);
    return message;
  }

  async update(id: string, updateMessageDto: UpdateMessageDto) {
    await this.findOne(id);
    await this.messageRepository.update(id, {
      ...updateMessageDto,
      editedAt: new Date(),
    });
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.messageRepository.update(id, { deletedAt: new Date() });
    return this.findOne(id);
  }
}
