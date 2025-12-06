import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { User } from 'prisma/generated/client';
import { TwoFAService } from './twofa.service';
import { TwoFARequiredException } from './twofa-required.exception';
import { randomBytes } from 'crypto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly twoFAService: TwoFAService,
    private readonly emailService: EmailService,
  ) { }

  async login(user: User, response: Response) {
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email address before logging in.'
      );
    }

    if (user.twoFAEnabled) {
      throw new TwoFARequiredException(user.id);
    }

    return this.issueToken(user, response);
  }

  async authenticate2FA(
    userId: number,
    twoFACode: string,
    response: Response
  ) {
    const user = await this.usersService.getUserById(userId);

    if (!user.twoFAEnabled || !user.twoFASecret) {
      throw new UnauthorizedException('2FA is not enabled for this account.');
    }

    const verified = await this.twoFAService.verifyCode(user, twoFACode);

    if (!verified) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    return this.issueToken(user, response);
  }

  private issueToken(user: User, response: Response) {
    const tokenPayload: TokenPayload = { userId: user.id, role: user.role };
    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Successfully authenticated',
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async verifyUser(email: string, password: string, req: Request) {
    const user = await this.usersService.getUser({ email });

    if (user.isLocked || user.failedLoginAttempts >= 5) {
      throw new UnauthorizedException(
        'Account is locked. Contact administrator.'
      );
    }

    const authenticated = await bcrypt.compare(password, user.password);

    await this.prismaService.loginAttempt.create({
      data: {
        userId: user?.id ?? null,
        email,
        success: authenticated,
        ipAddress: req.ip || 'unknown',
      },
    });

    if (!authenticated) {
      const updated = await this.prismaService.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: { increment: 1 } },
      });

      if (updated.failedLoginAttempts >= 5) {
        await this.prismaService.user.update({
          where: { id: user.id },
          data: { isLocked: true },
        });
        throw new UnauthorizedException(
          'Account locked due to too many failed attempts'
        );
      }

      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0 },
    });

    return user;
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.prismaService.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token.');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified.');
    }

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });

    return { message: 'Email successfully verified!' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.getUser({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

    await this.prismaService.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    await this.emailService.sendPasswordResetEmail(user.email, token);

    return { message: 'Password reset link sent to email' };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.prismaService.passwordResetToken.findUnique({ where: { token } });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prismaService.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    await this.prismaService.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    return { message: 'Password successfully reset' };
  }
}