import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { ChatBaseEntity } from '../../../common/entities/chat-base.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('single_chat')
@Unique(['user1Id', 'user2Id'])
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
