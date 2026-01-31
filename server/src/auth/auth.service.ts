import { Injectable } from '@nestjs/common';
import { ForgotDto, LoginDto, RegisterDto } from './dto/auth.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  login(loginDto: LoginDto) {
    return 'This action adds a new auth';
  }

  register(registerDto: RegisterDto) {
    return 'This action adds a new auth';
  }

  forgot(forgotDto: ForgotDto) {
    return 'This action adds a new auth';
  }
}
