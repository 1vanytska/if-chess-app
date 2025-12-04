import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import ms from 'ms';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { User } from 'prisma/generated/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) { }

  async login(user: User, response: Response) {
    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email address before logging in.');
    }

    const expires = new Date();
    expires.setMilliseconds(
      expires.getMilliseconds() +
      ms(this.configService.getOrThrow<string>('JWT_EXPIRATION') as ms.StringValue),
    );

    const tokenPayload: TokenPayload = { userId: user.id, role: user.role };
    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, {
      secure: true,
      httpOnly: true,
    });

    return { tokenPayload, role: user.role };
  }

  async verifyUser(email: string, password: string, req: Request) {
    const user = await this.usersService.getUser({ email });

    if (user.isLocked || user.failedLoginAttempts >= 5) {
      throw new UnauthorizedException('Account is locked. Contact administrator.');
    }

    const authenticated = await bcrypt.compare(password, user.password);

    await this.prismaService.loginAttempt.create({
      data: {
        userId: user?.id ?? null,
        email,
        success: authenticated,
        ipAddress: req.ip,
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
        throw new UnauthorizedException('Account locked due to too many failed attempts');
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
}
