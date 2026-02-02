import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../modules/user/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'secret-key-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, WsJwtGuard],
  exports: [JwtModule, WsJwtGuard],
})
export class AuthModule {}
