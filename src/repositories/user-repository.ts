import { injectable, inject } from 'inversify';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities';
import { TYPES } from '../lib';

export interface UserRepository {
    findByEmail(email: string): Promise<User | null>;
    save(user: Partial<User>): Promise<User>;
}

@injectable()
export class UserRepositoryImpl implements UserRepository {
    private repo: Repository<User>;

    constructor(@inject(TYPES.DB) private db: DataSource) {
        this.repo = db.getRepository(User);
    }

    findByEmail(email: string): Promise<User | null> {
        return this.repo.findOne({ where: { email } });
    }

    save(user: Partial<User>): Promise<User> {
        return this.repo.save(user);
    }
}
