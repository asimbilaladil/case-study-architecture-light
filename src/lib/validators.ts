import { BadRequestError } from './errors';

export interface RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export function validateRegisterDto(body: any): RegisterDto {
    const { email, password, firstName, lastName } = body ?? {};

    const missing = ['email', 'password', 'firstName', 'lastName'].filter(
        (f) => !body?.[f]?.toString().trim()
    );
    if (missing.length) {
        throw new BadRequestError(`Missing required fields: ${missing.join(', ')}`);
    }

    return { email, password, firstName, lastName };
}

export function validateLoginDto(body: any): LoginDto {
    const { email, password } = body ?? {};

    if (!email?.trim() || !password?.trim()) {
        throw new BadRequestError('Email and password are required');
    }

    return { email, password };
}
