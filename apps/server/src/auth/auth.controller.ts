import { Controller, Get, Post, Query, Res, UseGuards, Req } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Response, Request } from 'express';
import { CurrentUser } from './current-user.decorator';
import { AuthService } from './auth.service';
import { User } from 'prisma/generated/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
    @Req() req: Request,
  ) {
    return this.authService.login(user, response);
  }

  @Get('verify')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}