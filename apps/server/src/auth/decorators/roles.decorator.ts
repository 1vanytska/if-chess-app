import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'prisma/generated/enums';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);