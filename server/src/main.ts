import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ZodValidationPipe } from './common/pipes/zod-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });
  const config = new DocumentBuilder()
    .setTitle('Pocket Chat API')
    .setDescription(
      `
      This API provides:
      - 🔐 Authentication
      - 💬 Private Chats
      - 👥 Groups
      - 📡 Real-time Chat (Socket.IO)

      ---

      ## Real-time Chat (Socket.IO)

      Connect to the same origin (e.g. \`http://localhost:5050\`) with Socket.IO. Send JWT in handshake:

      - \`auth: { token: "YOUR_JWT" }\` or \`Authorization: Bearer YOUR_JWT\`

      **Client → Server events:**

      | Event | Payload | Description |
      |-------|---------|-------------|
      | \`join_chat\` | \`{ singleChatId?: string, groupId?: string }\` | Join a chat room (exactly one). Server emits \`joined\` or \`error\`. |
      | \`leave_chat\` | \`{ singleChatId?: string, groupId?: string }\` | Leave the chat room. |
      | \`message:send\` | \`{ content, singleChatId?, groupId?, parentMessageId? }\` | Send a message. Server emits \`message:new\`. |
      | \`message:edit\` | \`{ messageId, content, singleChatId?, groupId? }\` | Edit a message. Server emits \`message:edited\`. |
      | \`message:delete\` | \`{ messageId, singleChatId?, groupId? }\` | Soft-delete a message. Server emits \`message:deleted\`. |
      | \`typing:start\` / \`typing:stop\` | \`{ singleChatId?, groupId? }\` | Broadcast typing indicator to room (excluding sender). |

      **Server → Client events:**

      | Event | When |
      |-------|------|
      | \`joined\` | After successful \`join_chat\` (payload: \`{ room: string }\`). |
      | \`message:new\` | New message in room (payload: full message with \`sender\`). |
      | \`message:edited\` | Message updated (payload: full message). |
      | \`message:deleted\` | Message soft-deleted (payload: \`{ messageId }\`). |
      | \`typing:start\` / \`typing:stop\` | Another user typing (payload: \`{ userId, username? }\`). |
      | \`error\` | Validation or auth error (payload: \`{ message: string }\`). |
      `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  app.useGlobalPipes(new ZodValidationPipe());
  await app.listen(process.env.PORT ?? 5050);
}
void bootstrap();
