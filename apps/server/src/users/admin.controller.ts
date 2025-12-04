import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'prisma/generated/enums';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin')
export class AdminController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Get('login-attempts/:userId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async getLoginAttempts(@Param('userId') userId: string) {
        return this.usersService.getLoginAttempts(+userId);
    }

    @Get('all-login-attempts')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async getAllLoginAttempts() {
        return this.usersService.getAllLoginAttempts();
    }
}
