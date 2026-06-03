import bcrypt from 'bcryptjs';
import { injectable } from 'inversify';

export interface PasswordManagerService {
    toHash(password: string): Promise<string>;
    compare(storedPassword: string, suppliedPassword: string): Promise<boolean>;
}

@injectable()
export class PasswordManagerServiceImpl implements PasswordManagerService {
    private readonly SALT_ROUNDS = 10;

    async toHash(password: string): Promise<string> {
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }

    async compare(storedPassword: string, suppliedPassword: string): Promise<boolean> {
        return bcrypt.compare(suppliedPassword, storedPassword);
    }
}
