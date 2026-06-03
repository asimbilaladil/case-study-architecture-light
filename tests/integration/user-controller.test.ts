import 'reflect-metadata';
import express from 'express';
import { json } from 'body-parser';
import request from 'supertest';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import '../../src/lib/base-controller';
import '../../src/controllers/user-controller';
import { TYPES } from '../../src/lib/types';
import { ConflictError, UnauthorizedError } from '../../src/lib/errors';

const mockRegister = jest.fn();
const mockLogin = jest.fn();

function buildApp() {
    const container = new Container();
    container.bind(TYPES.UserService).toConstantValue({
        register: mockRegister,
        login: mockLogin,
    });

    const server = new InversifyExpressServer(container, null, {
        rootPath: '/partner-app/api',
    });
    server.setConfig((app: express.Application) => app.use(json()));
    return server.build();
}

const app = buildApp();

beforeEach(() => jest.clearAllMocks());

describe('POST /partner-app/api/auth/register', () => {
    const body = {
        email: 'jane@example.com',
        password: 'Password1',
        firstName: 'Jane',
        lastName: 'Doe',
    };

    it('returns 201 with token on success', async () => {
        mockRegister.mockResolvedValue({
            token: 'jwt-token',
            user: { id: '1', email: body.email, firstName: 'Jane', lastName: 'Doe' },
        });

        const res = await request(app).post('/partner-app/api/auth/register').send(body);

        expect(res.status).toBe(201);
        expect(res.body.token).toBe('jwt-token');
    });

    it('returns 409 if email already in use', async () => {
        mockRegister.mockRejectedValue(new ConflictError('Email already in use'));
        const res = await request(app).post('/partner-app/api/auth/register').send(body);
        expect(res.status).toBe(409);
        expect(res.body.error).toBe('Email already in use');
    });

    it('returns 400 for missing fields', async () => {
        const res = await request(app)
            .post('/partner-app/api/auth/register')
            .send({ email: 'x@x.com' });
        expect(res.status).toBe(400);
    });
});

describe('POST /partner-app/api/auth/login', () => {
    const body = { email: 'jane@example.com', password: 'Password1' };

    it('returns 200 with token on success', async () => {
        mockLogin.mockResolvedValue({
            token: 'jwt-token',
            user: { id: '1', email: body.email, firstName: 'Jane', lastName: 'Doe' },
        });

        const res = await request(app).post('/partner-app/api/auth/login').send(body);

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it('returns 401 for invalid credentials', async () => {
        mockLogin.mockRejectedValue(new UnauthorizedError());
        const res = await request(app).post('/partner-app/api/auth/login').send(body);
        expect(res.status).toBe(401);
    });

    it('returns 400 for missing fields', async () => {
        const res = await request(app)
            .post('/partner-app/api/auth/login')
            .send({ email: 'x@x.com' });
        expect(res.status).toBe(400);
    });
});
