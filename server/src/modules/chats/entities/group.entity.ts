import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ChatBaseEntity } from '../../../common/entities/chat-base.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('group')
export class GroupEntity extends ChatBaseEntity {
  @Column()
  title: string;

  @Column({ type: 'uuid' })
  ownerId: UserEntity['id'];

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'ownerId' })
  owner: UserEntity;
}
