import { ForbiddenException } from '@nestjs/common';

export class TwoFARequiredException extends ForbiddenException {
  constructor(userId: number) {
    super({
      statusCode: 403,
      message: 'Two-Factor Authentication required.',
      userId: userId, 
      requires2FA: true,
    });
  }
}