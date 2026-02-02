import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../modules/user/users.service';
import type { ForgotDto, LoginDto, RegisterDto } from './dto/auth.dto';

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
    const user = await this.usersService.findByUsernameWithPassword(
      loginDto.username,
    );
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
    const user = await this.usersService.findByUsernameWithPassword(
      forgotDto.username,
    );
    if (!user) {
      return {
        message: 'If an account exists, you will receive instructions.',
      };
    }
    // TODO: send reset link (email, etc.)
    return { message: 'If an account exists, you will receive instructions.' };
  }
}
