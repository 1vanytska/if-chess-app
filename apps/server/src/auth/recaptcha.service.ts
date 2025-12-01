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
                return false;
            }
            if (score < minimumScore) {
                return false;
            }
            if (expectedHostname && hostname !== expectedHostname) {
                return false;
            }
            if (action && action !== "submit") {
                return false;
            }

            return true;
        } catch (error) {
            return false;
        }
    }
}