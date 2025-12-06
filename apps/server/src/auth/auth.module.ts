import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { TwoFAService } from './twofa.service';
import { EmailModule } from '../email/email.module';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      secret: configService.getOrThrow('JWT_SECRET'),
      signOptions: {
        expiresIn: configService.getOrThrow('JWT_EXPIRATION'),
      },
    }),
    inject: [ConfigService],
  }), 
  ConfigModule,
  UsersModule, 
  PrismaModule,
  EmailModule,
],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, TwoFAService, GoogleStrategy],
})
export class AuthModule {}
