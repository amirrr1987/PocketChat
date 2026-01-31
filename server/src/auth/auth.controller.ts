import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { ForgotDto, LoginDto, RegisterDto } from './dto/auth.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  @Post('forgot')
  forgot(@Body() forgotDto: ForgotDto) {
    return this.authService.forgot(forgotDto);
  }
}
