import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserRequest } from './dto/create-user.request';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from 'prisma/generated/enums';
import { Prisma } from 'prisma/generated/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createUser(data: CreateUserRequest) {
    try {
      const verificationToken = uuidv4();

      const newUser = await this.prismaService.user.create({
        data: {
          ...data,
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
    return this.prismaService.user.findUniqueOrThrow({
      where: filter,
    });
  }

  async getUserById(id: number) {
    return this.prismaService.user.findUniqueOrThrow({
      where: { id },
    });
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
