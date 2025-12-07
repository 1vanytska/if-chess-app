import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RecaptchaService {
    async validate(token: string): Promise<boolean> {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY!;
        const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
        const minimumScore = 0.5;
        const expectedHostname = process.env.RECAPTCHA_EXPECTED_HOSTNAME;

        try {
            const response = await axios.post(verifyUrl, null, {
                params: { secret: secretKey, response: token },
            });

            const { success, score, action, hostname } = response.data;

            if (!success) {
                throw new UnauthorizedException('Invalid reCAPTCHA response');
            }
            if (score < minimumScore) {
                throw new UnauthorizedException('Low reCAPTCHA score');
            }
            if (expectedHostname && hostname !== expectedHostname) {
                throw new UnauthorizedException('Hostname mismatch in reCAPTCHA');
            }
            if (action && action !== 'submit') {
                throw new UnauthorizedException('Unexpected reCAPTCHA action');
            }

            return true;
        } catch (error) {
            console.error('reCAPTCHA validation failed:', error);
            throw new UnauthorizedException('reCAPTCHA validation failed');
        }
    }
}