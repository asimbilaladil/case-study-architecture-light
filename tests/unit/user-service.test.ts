import 'reflect-metadata';
import { UserServiceImpl } from '../../src/services/user-service';
import { BadRequestError, ConflictError, UnauthorizedError } from '../../src/lib/errors';

const mockFindByEmail = jest.fn();
const mockSave = jest.fn();
const mockToHash = jest.fn();
const mockCompare = jest.fn();

const mockUserRepo = { findByEmail: mockFindByEmail, save: mockSave };
const mockPasswordManager = { toHash: mockToHash, compare: mockCompare };

const service = new UserServiceImpl(mockUserRepo as any, mockPasswordManager as any);

beforeEach(() => jest.clearAllMocks());

describe('UserService.register', () => {
    const validInput = {
        email: 'john@example.com',
        password: 'Password1',
        firstName: 'John',
        lastName: 'Doe',
    };

    it('registers a new user and returns token', async () => {
        process.env.JWT_SECRET = 'test-secret';
        mockFindByEmail.mockResolvedValue(null);
        mockToHash.mockResolvedValue('hashed');
        mockSave.mockResolvedValue({ id: 'uuid-1', ...validInput, password: 'hashed' });

        const result = await service.register(validInput);

        expect(result.token).toBeDefined();
        expect(result.user.email).toBe('john@example.com');
        expect(result.user).not.toHaveProperty('password');
    });

    it('throws ConflictError if email already exists', async () => {
        mockFindByEmail.mockResolvedValue({ id: 'existing' });
        await expect(service.register(validInput)).rejects.toThrow(ConflictError);
    });

    it('throws BadRequestError for invalid email', async () => {
        await expect(
            service.register({ ...validInput, email: 'not-an-email' })
        ).rejects.toThrow(BadRequestError);
    });

    it('throws BadRequestError for weak password', async () => {
        await expect(
            service.register({ ...validInput, password: 'weak' })
        ).rejects.toThrow(BadRequestError);
    });

    it('throws BadRequestError for missing firstName', async () => {
        await expect(
            service.register({ ...validInput, firstName: '' })
        ).rejects.toThrow(BadRequestError);
    });
});

describe('UserService.login', () => {
    const storedUser = {
        id: 'uuid-1',
        email: 'john@example.com',
        password: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
    };

    it('returns token on valid credentials', async () => {
        process.env.JWT_SECRET = 'test-secret';
        mockFindByEmail.mockResolvedValue(storedUser);
        mockCompare.mockResolvedValue(true);

        const result = await service.login({ email: 'john@example.com', password: 'Password1' });

        expect(result.token).toBeDefined();
        expect(result.user.id).toBe('uuid-1');
    });

    it('throws UnauthorizedError if user not found', async () => {
        mockFindByEmail.mockResolvedValue(null);
        await expect(
            service.login({ email: 'nobody@example.com', password: 'Password1' })
        ).rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError if password is wrong', async () => {
        mockFindByEmail.mockResolvedValue(storedUser);
        mockCompare.mockResolvedValue(false);
        await expect(
            service.login({ email: 'john@example.com', password: 'wrong' })
        ).rejects.toThrow(UnauthorizedError);
    });
});
