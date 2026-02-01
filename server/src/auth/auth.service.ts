import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { ForgotDto, LoginDto, RegisterDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<void> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    await this.usersService.createByUsername({
      username: registerDto.username,
      password: hashedPassword,
    });
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsername(loginDto.username);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const access_token = this.jwtService.sign({
      sub: user.id,
      username: user.username,
    });
    return { access_token, user: { id: user.id, username: user.username } };
  }

  async forgot(forgotDto: ForgotDto) {
    const user = await this.usersService.findByUsername(forgotDto.username);
    if (!user) {
      return {
        message: 'If an account exists, you will receive instructions.',
      };
    }
    // TODO: send reset link (email, etc.)
    return { message: 'If an account exists, you will receive instructions.' };
  }
}
