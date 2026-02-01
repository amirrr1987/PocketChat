import { ChildEntity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ChatBaseEntity } from './chat-base.entity';

@ChildEntity('single')
export class SingleChatEntity extends ChatBaseEntity {
  @Column({ type: 'uuid' })
  user1Id: UserEntity['id'];

  @Column({ type: 'uuid' })
  user2Id: UserEntity['id'];

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user1Id' })
  user1: UserEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user2Id' })
  user2: UserEntity;
}
