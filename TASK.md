# How I approached this

## Order of work

1. **Dependencies & config** — added `bcryptjs` and `jsonwebtoken`, replaced the AWS SSM datasource config with a straightforward `.env`-driven one. SSM is fine for production but made local development impossible without AWS credentials.

2. **Error classes** — before writing any business logic I defined typed error classes (`AppError`, `BadRequestError`, `UnauthorizedError`, `ConflictError`). Having these early means services and controllers can throw semantically meaningful errors and the HTTP layer maps them to status codes cleanly.

3. **Data layer** — `User` entity with TypeORM, then `UserRepository` wrapping it. Keeping the repository behind an interface means I can swap the implementation in tests without touching anything else.

4. **Services** — `PasswordManagerService` uses `bcryptjs` (10 salt rounds — good balance of security vs. performance). `UserService` owns all the domain rules: email format, password strength, uniqueness check. Login intentionally returns the same `UnauthorizedError` whether the user doesn't exist or the password is wrong — avoids leaking which emails are registered.

5. **DTOs & validators** — lightweight manual validation functions rather than a decorator library. Class-validator would have been cleaner at scale but adds overhead and the task is small enough that a few functions are more readable.

6. **Controller & wiring** — `UserController` delegates to the service and maps `AppError` subclasses to HTTP status codes. DI bindings in `inversify.config.ts` and DB initialisation in `src/index.ts`.

7. **Auth middleware** — `authMiddleware` for protecting future routes. Not wired to any route yet since the task only requires register/login, but the pattern is there.

8. **Tests** — unit tests mock the repository and password manager so they're fast and deterministic. Integration tests use `supertest` against a real in-memory Inversify container with the service mocked — they test HTTP behaviour (status codes, response shape) not business logic.

## Key decisions

- **bcryptjs over scrypt** — the boilerplate had a scrypt stub but bcryptjs has a cleaner async API and is widely battle-tested in Node. No meaningful security difference at this scale.
- **JWT in Authorization header** — standard Bearer token pattern; not using cookies since the spec didn't mention a browser client.
- **`synchronize: true` in dev** — TypeORM auto-creates the schema in non-production. A real production service would use migrations.
- **No refresh tokens** — the `env.example` hinted at it but the requirements don't ask for it, so skipped.

## Tools used

- Node.js 18 + TypeScript
- Express with inversify-express-utils
- TypeORM + PostgreSQL
- bcryptjs, jsonwebtoken
- Jest + ts-jest + supertest
