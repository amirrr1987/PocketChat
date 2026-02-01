import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<UserEntity>>;

  const mockUser: UserEntity = {
    id: 'uuid-1',
    username: 'testuser',
    password: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(UserEntity));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user when username does not exist', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      (repository.create as jest.Mock).mockReturnValue(mockUser);
      (repository.save as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.create({
        username: 'testuser',
        password: 'plain',
      });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.username = :username',
        { username: 'testuser' },
      );
      expect(repository.create).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'plain',
      });
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException when username already exists', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);

      await expect(
        service.create({ username: 'testuser', password: 'plain' }),
      ).rejects.toThrow(ConflictException);

      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findByUsername', () => {
    it('should return user when found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);

      const result = await service.findByUsername('testuser');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.username = :username',
        { username: 'testuser' },
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await service.findByUsername('nonexistent');

      expect(result).toBeNull();
    });

    it('should add password select when withPassword is true', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);

      await service.findByUsername('testuser', true);

      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('user.password');
    });
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOne('uuid-1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('bad-uuid')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('bad-uuid')).rejects.toThrow(
        'User #bad-uuid not found',
      );
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const users = [mockUser];
      (repository.find as jest.Mock).mockResolvedValue(users);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('update', () => {
    it('should update and return user', async () => {
      (repository.findOne as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({ ...mockUser, username: 'updated' });
      (repository.update as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await service.update('uuid-1', { username: 'updated' });

      expect(repository.findOne).toHaveBeenCalledTimes(2);
      expect(repository.update).toHaveBeenCalledWith('uuid-1', {
        username: 'updated',
      });
      expect(result.username).toBe('updated');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update('bad-uuid', { username: 'new' }),
      ).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete user when found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (repository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.remove('uuid-1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
      expect(repository.delete).toHaveBeenCalledWith('uuid-1');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('bad-uuid')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
