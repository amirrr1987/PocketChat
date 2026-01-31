import { Test, TestingModule } from '@nestjs/testing';
import { ChatMembersService } from './chat-members.service';

describe('ChatMembersService', () => {
  let service: ChatMembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatMembersService],
    }).compile();

    service = module.get<ChatMembersService>(ChatMembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
