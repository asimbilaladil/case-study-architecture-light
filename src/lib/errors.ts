export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500
    ) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string) {
        super(message, 400);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Invalid credentials') {
        super(message, 401);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
