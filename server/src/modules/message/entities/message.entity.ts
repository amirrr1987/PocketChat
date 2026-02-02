import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MessageTypeEnum } from '../../../common/enums';
import { GroupEntity } from '../../chats/entities/group.entity';
import { SingleChatEntity } from '../../chats/entities/single-chat.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('message')
@Check(
  'message_single_or_group',
  '("singleChatId" IS NOT NULL AND "groupId" IS NULL) OR ("singleChatId" IS NULL AND "groupId" IS NOT NULL)',
)
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  senderId: UserEntity['id'];

  @Column({ type: 'uuid', nullable: true })
  singleChatId: SingleChatEntity['id'] | null;

  @Column({ type: 'uuid', nullable: true })
  groupId: GroupEntity['id'] | null;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', default: MessageTypeEnum.TEXT })
  messageType: MessageTypeEnum;

  @Column({ type: 'uuid', nullable: true })
  parentMessageId: MessageEntity['id'] | null;

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

  @ManyToOne(() => MessageEntity, { nullable: true })
  @JoinColumn({ name: 'parentMessageId' })
  parentMessage: MessageEntity | null;
}
