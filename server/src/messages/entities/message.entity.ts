import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GroupEntity } from '../../chats/entities/group.entity';
import { SingleChatEntity } from '../../chats/entities/single-chat.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('message')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  senderId: UserEntity['id'];

  @Column({ type: 'uuid', nullable: true })
  singleChatId: SingleChatEntity['id'] | null;

  @Column({ type: 'uuid', nullable: true })
  groupChatId: GroupEntity['id'] | null;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  editedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'senderId' })
  sender: UserEntity;

  @ManyToOne(() => SingleChatEntity, { nullable: true })
  @JoinColumn({ name: 'singleChatId' })
  singleChat: SingleChatEntity | null;

  @ManyToOne(() => GroupEntity, { nullable: true })
  @JoinColumn({ name: 'groupId' })
  group: GroupEntity | null;
}
