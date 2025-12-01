import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class CreateUserRequest {
    @IsEmail()
    email: string;

    @IsStrongPassword({ minLength: 12 })
    password: string;

    @IsString()
    @IsNotEmpty()
    recaptchaToken: string;
}