import { Injectable, UnprocessableEntityException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserRequest } from './dto/create-user.request';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from 'prisma/generated/enums';
import { Prisma } from 'prisma/generated/client';
import { RecaptchaService } from '../auth/recaptcha.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
    private readonly recaptchaService: RecaptchaService,
  ) { }

  async createUser(data: CreateUserRequest) {
    const isHuman = await this.recaptchaService.validate(data.recaptchaToken);
    if (!isHuman) {
      throw new UnauthorizedException('Failed reCAPTCHA validation.');
    }

    try {
      const verificationToken = uuidv4();

      const { recaptchaToken, ...userData } = data;

      const newUser = await this.prismaService.user.create({
        data: {
          ...userData,
          password: await bcrypt.hash(data.password, 10),
          verificationToken,
          emailVerified: false,
          failedLoginAttempts: 0,
          role: UserRole.USER,
        },
        select: {
          email: true,
          id: true,
          role: true,
        },
      });

      await this.emailService.sendVerificationEmail(data.email, verificationToken);

      return newUser;
    } catch (err) {
      if (err.code === 'P2002') {
        throw new UnprocessableEntityException('Email already exists.');
      }
      throw err;
    }
  }

  async getUser(filter: Prisma.UserWhereUniqueInput) {
    const user = await this.prismaService.user.findUnique({
      where: filter,
    });

    if (!user) {
      throw new BadRequestException('User not registered');
    }

    return user;
  }

  async getUserById(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException('User not registered');
    }

    return user;
  }

  async getLoginAttempts(userId: number) {
    return this.prismaService.loginAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllLoginAttempts() {
    return this.prismaService.loginAttempt.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: {
            email: true,
            role: true
          }
        }
      }
    });
  }

  async promoteUserToAdmin(email: string) {
    return this.prismaService.user.update({
      where: { email },
      data: { role: UserRole.ADMIN },
    });
  }
}
