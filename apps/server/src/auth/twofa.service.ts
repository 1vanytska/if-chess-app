import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';
import { User } from 'prisma/generated/client';

@Injectable()
export class TwoFAService {
  constructor(private readonly prisma: PrismaService) {}

  async generateSecret(user: User) {
    if (user.twoFAEnabled) {
      throw new BadRequestException('2FA already enabled.');
    }

    const secret = speakeasy.generateSecret({
      name: `Chess App (${user.email})`,
      issuer: 'IF Chess Federation',
      length: 32,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFASecret: secret.base32 },
    });

    const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url!);

    return { 
      qrCodeDataUrl, 
      secret: secret.base32,
      message: 'Scan QR code and verify with code to enable 2FA'
    };
  }

  async confirm2FA(user: User, token: string) {
    if (user.twoFAEnabled) {
      throw new BadRequestException('2FA already enabled.');
    }
    if (!user.twoFASecret) {
      throw new UnauthorizedException('Secret not generated. Start setup first.');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid 2FA code during confirmation.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        twoFAEnabled: true,
      },
    });

    return { 
      message: '2FA successfully enabled.',
    };
  }

  async disable2FA(user: User) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        twoFAEnabled: false, 
        twoFASecret: null,
      },
    });
    return { message: '2FA successfully disabled.' };
  }

  async verifyCode(user: User, token: string): Promise<boolean> {
    if (!user.twoFASecret) {
      throw new UnauthorizedException('2FA is not enabled for this account.');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    return verified;
  }
}