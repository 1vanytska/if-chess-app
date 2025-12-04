import { Body, Controller, Get, Param, Post, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserRequest } from './dto/create-user.request';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { TokenPayload } from '../auth/token-payload.interface';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecaptchaService } from '../auth/recaptcha.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly recaptchaService: RecaptchaService,
    ) { }

    @Post()
    @UseInterceptors(NoFilesInterceptor())
    async createUser(@Body() request: CreateUserRequest) {

        const isValid = await this.recaptchaService.validate(request.recaptchaToken);

        if (!isValid) {
            throw new UnauthorizedException("Invalid captcha");
        }

        return this.usersService.createUser({
            email: request.email,
            password: request.password,
        } as CreateUserRequest);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMe(@CurrentUser() user: TokenPayload) {
        return user;
    }
}