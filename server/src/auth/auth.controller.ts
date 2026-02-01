import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import type { ForgotDto, LoginDto, RegisterDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with username and password',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: {
          type: 'string',
          minLength: 3,
          example: 'john_doe',
          description: 'Username of the user',
        },
        password: {
          type: 'string',
          minLength: 8,
          example: 'password123',
          description: 'User password',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ',
        },
        user: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            username: {
              type: 'string',
              example: 'john_doe',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  login(
    @Body() loginDto: LoginDto,
  ): Promise<{ access_token: string; user: { id: string; username: string } }> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'User registration',
    description: 'Register a new user account',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: {
          type: 'string',
          minLength: 3,
          example: 'jane_doe',
          description: 'Username for the new account',
        },
        password: {
          type: 'string',
          minLength: 8,
          example: 'securePass123',
          description: 'Password for the new account',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation error or username already exists',
  })
  @ApiResponse({ status: 409, description: 'Username already exists' })
  register(@Body() registerDto: RegisterDto): Promise<void> {
    return this.authService.register(registerDto);
  }

  @Post('forgot')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({
    summary: 'Forgot password',
    description: 'Request password reset',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: {
          type: 'string',
          minLength: 3,
          example: 'john_doe',
          description: 'Username of the account',
        },
        password: {
          type: 'string',
          minLength: 8,
          example: 'newPassword123',
          description: 'New password for the account',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  forgot(@Body() forgotDto: ForgotDto) {
    return this.authService.forgot(forgotDto);
  }
}
