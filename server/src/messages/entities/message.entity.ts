import { PrimaryGeneratedColumn } from 'typeorm';

export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  chatId: number;
  senderId: number | null;
  content: string | null;
  mediaType: string | null;
  mediaUrl: string | null;
  mediaFilename: string | null;
  replyToMessageId: number | null;
  forwardedFromUserId: number | null;
  forwardedFromUsername: string | null;
  isDeleted: boolean;
  editedAt: Date | null;
  createdAt: Date;
}
