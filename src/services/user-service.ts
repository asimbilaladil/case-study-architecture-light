import { injectable, inject } from 'inversify';
import jwt from 'jsonwebtoken';
import { TYPES, BadRequestError, UnauthorizedError, ConflictError } from '../lib';
import { UserRepository } from '../repositories';
import { PasswordManagerService } from './password-manager-service';

export interface RegisterInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthResult {
    token: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
}

export interface UserService {
    register(input: RegisterInput): Promise<AuthResult>;
    login(input: LoginInput): Promise<AuthResult>;
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@injectable()
export class UserServiceImpl implements UserService {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.PasswordManagerService) private passwordManager: PasswordManagerService
    ) {}

    async register(input: RegisterInput): Promise<AuthResult> {
        const { email, password, firstName, lastName } = input;

        if (!EMAIL_REGEX.test(email)) {
            throw new BadRequestError('Invalid email format');
        }

        if (!PASSWORD_REGEX.test(password)) {
            throw new BadRequestError(
                'Password must be at least 8 characters with one uppercase, one lowercase, and one number'
            );
        }

        if (!firstName?.trim() || !lastName?.trim()) {
            throw new BadRequestError('First name and last name are required');
        }

        const existing = await this.userRepository.findByEmail(email.toLowerCase());
        if (existing) {
            throw new ConflictError('Email already in use');
        }

        const hashed = await this.passwordManager.toHash(password);
        const user = await this.userRepository.save({
            email: email.toLowerCase(),
            password: hashed,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
        });

        return { token: this.signToken(user.id), user: this.sanitize(user) };
    }

    async login(input: LoginInput): Promise<AuthResult> {
        const { email, password } = input;

        const user = await this.userRepository.findByEmail(email.toLowerCase());
        if (!user) {
            throw new UnauthorizedError();
        }

        const valid = await this.passwordManager.compare(user.password, password);
        if (!valid) {
            throw new UnauthorizedError();
        }

        return { token: this.signToken(user.id), user: this.sanitize(user) };
    }

    private signToken(userId: string): string {
        const secret = process.env.JWT_SECRET!;
        const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
        return jwt.sign({ sub: userId }, secret, { expiresIn } as jwt.SignOptions);
    }

    private sanitize(user: any) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        };
    }
}
