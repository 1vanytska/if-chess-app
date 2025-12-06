import { Controller, Get, Post, Query, Res, UseGuards, Req, HttpCode, Body } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Response, Request } from 'express';
import { CurrentUser } from './current-user.decorator';
import { AuthService } from './auth.service';
import { User } from 'prisma/generated/client';
import { TwoFAService } from './twofa.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private twoFAService: TwoFAService,
  ) { }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
    @Req() req: Request,
  ) {
    return this.authService.login(user, response);
  }

  @Post('2fa/authenticate')
  @HttpCode(200)
  async authenticate2FA(
    @Body('userId') userId: number,
    @Body('twoFACode') twoFACode: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.authenticate2FA(userId, twoFACode, response);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async enable2FA(@CurrentUser() user: User) {
    return this.twoFAService.generateSecret(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/confirm')
  @HttpCode(200)
  async confirm2FA(@CurrentUser() user: User, @Body('code') code: string) {
    return this.twoFAService.confirm2FA(user, code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  @HttpCode(200)
  async disable2FA(@CurrentUser() user: User) {
    return this.twoFAService.disable2FA(user);
  }

  @Get('verify')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  async resetPassword(@Body('token') token: string, @Body('newPassword') newPassword: string) {
    return this.authService.resetPassword(token, newPassword);
  }
}