import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GroupRoleEnum } from '../../../common/enums';
import { GroupEntity } from '../../chats/entities/group.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('group_member')
export class GroupMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  groupId: GroupEntity['id'];

  @Column({ type: 'uuid' })
  userId: UserEntity['id'];

  @Column({ enum: GroupRoleEnum })
  role: GroupRoleEnum;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  leftAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => GroupEntity)
  @JoinColumn({ name: 'groupId' })
  group: GroupEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
