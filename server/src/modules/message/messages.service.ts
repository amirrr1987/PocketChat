import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type {
  MessageCreateDto,
  MessageDto,
  MessageUpdateDto,
} from './dto/message.dto';
import { MessageEntity } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  async create(createMessageDto: MessageCreateDto) {
    console.log(
      '[MessagesService] Creating message:',
      JSON.stringify(createMessageDto, null, 2),
    );
    try {
      const message = this.messageRepository.create(createMessageDto);
      console.log(
        '[MessagesService] Message entity created:',
        JSON.stringify(message, null, 2),
      );
      const saved = await this.messageRepository.save(message);
      console.log(
        '[MessagesService] Message saved to DB successfully:',
        JSON.stringify(saved, null, 2),
      );
      console.log('[MessagesService] Saved message ID:', saved.id);
      return saved;
    } catch (error) {
      console.error('[MessagesService] Error saving message:', error);
      if (error instanceof Error) {
        console.error('[MessagesService] Error message:', error.message);
        console.error('[MessagesService] Error stack:', error.stack);
      }
      if (error && typeof error === 'object' && 'detail' in error) {
        console.error('[MessagesService] Error detail:', (error as any).detail);
      }
      throw error;
    }
  }

  findAll() {
    return this.messageRepository.find({
      relations: ['sender', 'singleChat', 'group'],
    });
  }

  findBySingleChat(singleChatId: string) {
    return this.messageRepository.find({
      where: { singleChatId, deletedAt: IsNull() },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  findByGroup(groupId: string) {
    return this.messageRepository.find({
      where: { groupId, deletedAt: IsNull() },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: MessageDto['id']) {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['sender', 'singleChat', 'group'],
    });
    if (!message) throw new NotFoundException(`Message #${id} not found`);
    return message;
  }

  async update(id: MessageDto['id'], updateMessageDto: MessageUpdateDto) {
    await this.findOne(id);
    await this.messageRepository.update(id, {
      ...updateMessageDto,
      editedAt: new Date(),
    });
    return this.findOne(id);
  }

  async remove(id: MessageDto['id']) {
    await this.findOne(id);
    await this.messageRepository.update(id, { deletedAt: new Date() });
    return this.findOne(id);
  }
}
