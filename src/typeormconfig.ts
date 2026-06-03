import { DataSource } from 'typeorm';
import { User } from './entities';

export const getDataSource = () =>
    new DataSource({
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: Number(process.env.DATABASE_PORT) || 5432,
        database: process.env.DATABASE_NAME || 'case_study_db',
        username: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || '',
        entities: [User],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: false,
    });
