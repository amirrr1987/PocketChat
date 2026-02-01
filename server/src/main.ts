import { ZodValidationPipe } from './common/pipes/zod-validation.pipe';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });
  const config = new DocumentBuilder()
    .setTitle('Pocket Chat API')
    .setDescription(
      'REST API documentation for Pocket Chat, a messaging platform supporting users, chats, and groups.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  app.useGlobalPipes(new ZodValidationPipe());
  await app.listen(process.env.PORT ?? 5050);
}
void bootstrap();
