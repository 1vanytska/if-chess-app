import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserRequest } from './dto/create-user.request';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from 'prisma/generated';
import { EmailService } from '../email/email.service';
import { v4 as uuidv4 } from 'uuid';

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
                    verificationToken: verificationToken,
                    emailVerified: false,
                },
                select: {
                    email: true,
                    id: true,
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
}
