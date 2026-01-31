import { Test, TestingModule } from '@nestjs/testing';
import { ChatMembersController } from './chat-members.controller';
import { ChatMembersService } from './chat-members.service';

describe('ChatMembersController', () => {
  let controller: ChatMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatMembersController],
      providers: [ChatMembersService],
    }).compile();

    controller = module.get<ChatMembersController>(ChatMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
