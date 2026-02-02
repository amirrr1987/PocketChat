import { NotFoundException, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MessageTypeEnum } from '../../common/enums';
import { WsJwtGuard } from '../../auth/guards/ws-jwt.guard';
import { ChatsService } from '../chats/chats.service';
import { GroupMembersService } from '../group-members/group-members.service';
import { MessagesService } from '../message/messages.service';

type JoinLeavePayload = {
  singleChatId?: string;
  groupId?: string;
};

type MessageSendPayload = {
  content: string;
  singleChatId?: string;
  groupId?: string;
  parentMessageId?: string;
  messageType?: string;
};

type MessageEditPayload = {
  messageId: string;
  content: string;
  singleChatId?: string;
  groupId?: string;
};

type MessageDeletePayload = {
  messageId: string;
  singleChatId?: string;
  groupId?: string;
};

type TypingPayload = {
  singleChatId?: string;
  groupId?: string;
};

interface AuthenticatedSocket {
  user: { userId: string; username: string };
  id: string;
  join: (room: string) => void;
  leave: (room: string) => void;
  emit: (event: string, data?: unknown) => void;
  to: (room: string) => { emit: (event: string, data?: unknown) => void };
}

function getRoom(
  payload: JoinLeavePayload,
): { room: string; type: 'single' | 'group' } | null {
  if (payload.singleChatId && !payload.groupId) {
    return { room: `single:${payload.singleChatId}`, type: 'single' };
  }
  if (payload.groupId && !payload.singleChatId) {
    return { room: `group:${payload.groupId}`, type: 'group' };
  }
  return null;
}

@WebSocketGateway({
  cors: { origin: '*' },
})
@UseGuards(WsJwtGuard)
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly chatsService: ChatsService,
    private readonly groupMembersService: GroupMembersService,
  ) {}

  private async assertSingleChatMembership(
    singleChatId: string,
    userId: string,
  ): Promise<void> {
    const single = await this.chatsService.findSingle(singleChatId);
    if (single.user1Id !== userId && single.user2Id !== userId) {
      throw new WsException('Forbidden');
    }
  }

  private async assertGroupMembership(
    groupId: string,
    userId: string,
  ): Promise<void> {
    const group = await this.chatsService.findGroup(groupId);
    // Check if user is the owner
    if (group.ownerId === userId) {
      return;
    }
    // Check if user is an active member
    const members = await this.groupMembersService.findByGroup(groupId);
    const isActiveMember = members.some(
      (m) => m.userId === userId && m.leftAt === null,
    );
    if (!isActiveMember) {
      throw new WsException('Forbidden');
    }
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @MessageBody() payload: JoinLeavePayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    const parsed = getRoom(payload);
    if (!parsed) {
      client.emit('error', {
        message: 'Provide exactly one of singleChatId or groupId',
      });
      return;
    }
    const userId = client.user.userId;
    try {
      if (parsed.type === 'single') {
        await this.assertSingleChatMembership(payload.singleChatId!, userId);
      } else {
        await this.assertGroupMembership(payload.groupId!, userId);
      }
      client.join(parsed.room);
      client.emit('joined', { room: parsed.room });
    } catch (err) {
      if (err instanceof WsException) {
        client.emit('error', { message: err.message });
        return;
      }
      if (err instanceof NotFoundException) {
        client.emit('error', { message: 'Chat not found' });
        return;
      }
      client.emit('error', { message: 'Unauthorized' });
    }
  }

  @SubscribeMessage('leave_chat')
  async handleLeaveChat(
    @MessageBody() payload: JoinLeavePayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    const parsed = getRoom(payload);
    if (!parsed) {
      client.emit('error', {
        message: 'Provide exactly one of singleChatId or groupId',
      });
      return;
    }
    client.leave(parsed.room);
  }

  @SubscribeMessage('message:send')
  async handleMessageSend(
    @MessageBody() payload: MessageSendPayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    const hasSingle = !!payload.singleChatId && !payload.groupId;
    const hasGroup = !!payload.groupId && !payload.singleChatId;
    if (!hasSingle && !hasGroup) {
      client.emit('error', {
        message: 'Provide exactly one of singleChatId or groupId',
      });
      return;
    }
    if (!payload.content?.trim()) {
      client.emit('error', { message: 'Content is required' });
      return;
    }
    const userId = client.user.userId;
    try {
      if (hasSingle) {
        await this.assertSingleChatMembership(payload.singleChatId!, userId);
      } else {
        await this.assertGroupMembership(payload.groupId!, userId);
      }
      const createDto = hasSingle
        ? {
            senderId: userId,
            content: payload.content.trim(),
            singleChatId: payload.singleChatId!,
            parentMessageId: payload.parentMessageId ?? undefined,
            messageType:
              (payload.messageType as MessageTypeEnum) ?? MessageTypeEnum.TEXT,
          }
        : {
            senderId: userId,
            content: payload.content.trim(),
            groupId: payload.groupId!,
            parentMessageId: payload.parentMessageId ?? undefined,
            messageType:
              (payload.messageType as MessageTypeEnum) ?? MessageTypeEnum.TEXT,
          };
      console.log(
        '[ChatGateway] Creating message with DTO:',
        JSON.stringify(createDto, null, 2),
      );
      const created = await this.messagesService.create(createDto);
      console.log(
        '[ChatGateway] Message created:',
        JSON.stringify(created, null, 2),
      );
      const saved = await this.messagesService.findOne(created.id);
      console.log(
        '[ChatGateway] Message saved and fetched:',
        JSON.stringify(saved, null, 2),
      );
      const room = hasSingle
        ? `single:${payload.singleChatId}`
        : `group:${payload.groupId}`;
      console.log('[ChatGateway] Emitting to room:', room);
      this.server.to(room).emit('message:new', saved);
    } catch (err) {
      console.error('[ChatGateway] Error handling message:send:', err);
      if (err instanceof Error) {
        console.error('[ChatGateway] Error name:', err.name);
        console.error('[ChatGateway] Error message:', err.message);
        console.error('[ChatGateway] Error stack:', err.stack);
      }
      if (err instanceof WsException) {
        client.emit('error', { message: err.message });
        return;
      }
      if (err instanceof NotFoundException) {
        client.emit('error', { message: 'Chat not found' });
        return;
      }
      console.error('[ChatGateway] Unexpected error type:', typeof err);
      console.error(
        '[ChatGateway] Unexpected error:',
        JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
      );
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send message';
      client.emit('error', { message: errorMessage });
    }
  }

  @SubscribeMessage('message:edit')
  async handleMessageEdit(
    @MessageBody() payload: MessageEditPayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    const hasSingle = !!payload.singleChatId && !payload.groupId;
    const hasGroup = !!payload.groupId && !payload.singleChatId;
    if ((!hasSingle && !hasGroup) || !payload.content?.trim()) {
      client.emit('error', {
        message: 'Provide exactly one of singleChatId or groupId and content',
      });
      return;
    }
    const userId = client.user.userId;
    try {
      const message = await this.messagesService.findOne(payload.messageId);
      if (message.senderId !== userId) {
        client.emit('error', { message: 'Forbidden' });
        return;
      }
      if (hasSingle) {
        await this.assertSingleChatMembership(payload.singleChatId!, userId);
      } else {
        await this.assertGroupMembership(payload.groupId!, userId);
      }
      const updated = await this.messagesService.update(payload.messageId, {
        content: payload.content.trim(),
      });
      const room = hasSingle
        ? `single:${payload.singleChatId}`
        : `group:${payload.groupId}`;
      this.server.to(room).emit('message:edited', updated);
    } catch (err) {
      if (err instanceof WsException) {
        client.emit('error', { message: err.message });
        return;
      }
      if (err instanceof NotFoundException) {
        client.emit('error', { message: 'Message or chat not found' });
        return;
      }
      client.emit('error', { message: 'Failed to edit message' });
    }
  }

  @SubscribeMessage('message:delete')
  async handleMessageDelete(
    @MessageBody() payload: MessageDeletePayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    const hasSingle = !!payload.singleChatId && !payload.groupId;
    const hasGroup = !!payload.groupId && !payload.singleChatId;
    if (!hasSingle && !hasGroup) {
      client.emit('error', {
        message: 'Provide exactly one of singleChatId or groupId',
      });
      return;
    }
    const userId = client.user.userId;
    try {
      const message = await this.messagesService.findOne(payload.messageId);
      if (message.senderId !== userId) {
        client.emit('error', { message: 'Forbidden' });
        return;
      }
      if (hasSingle) {
        await this.assertSingleChatMembership(payload.singleChatId!, userId);
      } else {
        await this.assertGroupMembership(payload.groupId!, userId);
      }
      await this.messagesService.remove(payload.messageId);
      const room = hasSingle
        ? `single:${payload.singleChatId}`
        : `group:${payload.groupId}`;
      this.server
        .to(room)
        .emit('message:deleted', { messageId: payload.messageId });
    } catch (err) {
      if (err instanceof WsException) {
        client.emit('error', { message: err.message });
        return;
      }
      if (err instanceof NotFoundException) {
        client.emit('error', { message: 'Message or chat not found' });
        return;
      }
      client.emit('error', { message: 'Failed to delete message' });
    }
  }

  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @MessageBody() payload: TypingPayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    const parsed = getRoom(payload);
    if (!parsed) return;
    const userId = client.user.userId;
    try {
      if (parsed.type === 'single') {
        await this.assertSingleChatMembership(payload.singleChatId!, userId);
      } else {
        await this.assertGroupMembership(payload.groupId!, userId);
      }
      client.to(parsed.room).emit('typing:start', {
        userId: client.user.userId,
        username: client.user.username,
      });
    } catch {
      // ignore
    }
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @MessageBody() payload: TypingPayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    const parsed = getRoom(payload);
    if (!parsed) return;
    const userId = client.user.userId;
    try {
      if (parsed.type === 'single') {
        await this.assertSingleChatMembership(payload.singleChatId!, userId);
      } else {
        await this.assertGroupMembership(payload.groupId!, userId);
      }
      client.to(parsed.room).emit('typing:stop', {
        userId: client.user.userId,
      });
    } catch {
      // ignore
    }
  }
}
