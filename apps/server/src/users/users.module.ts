import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RecaptchaService } from '../auth/recaptcha.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [UsersController],
  providers: [UsersService, RecaptchaService],
  exports: [UsersService]
})
export class UsersModule {}
