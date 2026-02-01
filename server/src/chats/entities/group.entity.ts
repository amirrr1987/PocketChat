import { ChildEntity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ChatBaseEntity } from './chat-base.entity';

@ChildEntity('group')
export class GroupEntity extends ChatBaseEntity {
  @Column()
  title: string;

  @Column({ type: 'uuid' })
  ownerId: UserEntity['id'];

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'ownerId' })
  owner: UserEntity;
}
