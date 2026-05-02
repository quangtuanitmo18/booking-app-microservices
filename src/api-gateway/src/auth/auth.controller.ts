import { Body, Controller, Post, Res, Req, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { COOKIE_ACCESS_TOKEN } from '../shared/constants';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login and set HttpOnly cookie' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const authResult = await this.authService.login(loginDto);
    
    if (authResult?.access?.token) {
      // Set access token in HttpOnly cookie
      response.cookie(COOKIE_ACCESS_TOKEN, authResult.access.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      });
    }

    return { message: 'Login successful', user: { email: loginDto.email } };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return { message: 'Registration successful', user };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and clear cookie' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(COOKIE_ACCESS_TOKEN);
    return { message: 'Logout successful' };
  }

  @Post('me')
  @ApiOperation({ summary: 'Get current user session status from cookie' })
  @ApiResponse({ status: 200, description: 'Session valid' })
  @ApiResponse({ status: 401, description: 'Session invalid' })
  me(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const token = request.cookies[COOKIE_ACCESS_TOKEN];
    if (!token) {
      response.status(HttpStatus.UNAUTHORIZED);
      return { message: 'Unauthorized' };
    }
    // In a real application, you would validate the token with Identity service here
    // For now we just check if it exists
    return { authenticated: true };
  }
}
