import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${this.configService.get<string>('API_URL')}/auth/verify?token=${token}`;
    const mailOptions = {
      from: `"${this.configService.get<string>('MAIL_SENDER_NAME_DEFAULT')}" <${this.configService.get<string>('MAIL_SENDER_DEFAULT')}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: `<p>Please click this link to verify your email address: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
