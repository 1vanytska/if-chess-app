import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import ms from 'ms';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { Response } from 'express';
import { User } from 'prisma/generated';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

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
            ms(
                this.configService.getOrThrow<string>(
                    'JWT_EXPIRATION') as unknown as ms.StringValue,
            ),
        );

        const tokenPayload: TokenPayload = {
            userId: user.id,
        };
        const token = this.jwtService.sign(tokenPayload);

        response.cookie('Authentication', token, {
            secure: true,
            httpOnly: true
        });

        return { tokenPayload };
    }

    async verifyUser(email: string, password: string) {
        try {
            const user = await this.usersService.getUser({ email });
            const authenticated = await bcrypt.compare(password, user.password);
            if (!authenticated) {
                throw new UnauthorizedException();
            }
            return user;
        } catch (err) {
            throw new UnauthorizedException('Credentials are not valid.');
        }
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
