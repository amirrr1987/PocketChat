import { Injectable } from '@nestjs/common';
import { CreateMessageReadDto } from './dto/create-message-read.dto';
import { UpdateMessageReadDto } from './dto/update-message-read.dto';

@Injectable()
export class MessageReadService {
  create(createMessageReadDto: CreateMessageReadDto) {
    return 'This action adds a new messageRead';
  }

  findAll() {
    return `This action returns all messageRead`;
  }

  findOne(id: number) {
    return `This action returns a #${id} messageRead`;
  }

  update(id: number, updateMessageReadDto: UpdateMessageReadDto) {
    return `This action updates a #${id} messageRead`;
  }

  remove(id: number) {
    return `This action removes a #${id} messageRead`;
  }
}
