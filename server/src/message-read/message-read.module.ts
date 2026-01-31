import { Module } from '@nestjs/common';
import { MessageReadService } from './message-read.service';
import { MessageReadController } from './message-read.controller';

@Module({
  controllers: [MessageReadController],
  providers: [MessageReadService],
})
export class MessageReadModule {}
