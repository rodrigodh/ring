# TypeScript Standards

> **⚠️ MAINTENANCE:** This file is indexed in `dev-team/skills/shared-patterns/standards-coverage-table.md`.
> When adding/removing `## ` sections, follow FOUR-FILE UPDATE RULE in CLAUDE.md: (1) edit standards file, (2) update TOC, (3) update standards-coverage-table.md, (4) update agent file.

This file defines the specific standards for TypeScript (backend) development.

> **Reference**: Always consult `docs/PROJECT_RULES.md` for common project standards.

---

## Table of Contents

| # | Section | Description |
|---|---------|-------------|
| 1 | [Version](#version) | TypeScript and Node.js versions |
| 2 | [Strict Configuration](#strict-configuration-mandatory) | tsconfig.json requirements |
| 3 | [Frameworks & Libraries](#frameworks--libraries) | Backend stack (Fastify, Kysely, InversifyJS, Zod via @v4-company/mars-api) |
| 4 | [Type Safety](#type-safety) | Never use any, branded types |
| 5 | [Zod Validation Patterns](#zod-validation-patterns) | Schema validation |
| 6 | [Dependency Injection](#dependency-injection) | InversifyJS patterns with TYPES symbols |
| 7 | [Context Propagation](#context-propagation) | DI-based context (auth via @Auth, transactions via UoW) |
| 8 | [Testing](#testing) | Type-safe mocks, fixtures |
| 9 | [Error Handling](#error-handling) | Custom error classes |
| 10 | [Function Design](#function-design-mandatory) | Single responsibility principle |
| 11 | [File Organization](#file-organization-mandatory) | File-level single responsibility |
| 12 | [Naming Conventions](#naming-conventions) | Files, interfaces, types |
| 13 | [Directory Structure](#directory-structure) | Clean Architecture + DDD (domain/app/infra) |
| 14 | [RabbitMQ Worker Pattern](#rabbitmq-worker-pattern) | Async message processing |
| 15 | [Always-Valid Domain Model](#always-valid-domain-model-mandatory) | AggregateRoot/Entity factories, Value Objects, domain events |
| 16 | [BFF Architecture Pattern](#bff-architecture-pattern-mandatory) | Clean Architecture for Next.js API Routes |
| 17 | [Three-Layer DTO Mapping](#three-layer-dto-mapping-mandatory) | HTTP ↔ Domain ↔ External DTOs |
| 18 | [HttpService Lifecycle](#httpservice-lifecycle) | Request/response hooks for external APIs |
| 19 | [API Routes Pattern](#api-routes-pattern-mandatory) | Next.js API Routes (NEVER Server Actions) |
| 20 | [Exception Hierarchy](#exception-hierarchy) | Custom API exceptions with GlobalExceptionFilter |
| 21 | [Cross-Cutting Decorators](#cross-cutting-decorators) | LogOperation and other decorators |

**Meta-sections (not checked by agents):**
- [Checklist](#checklist) - Self-verification before submitting code

---

## Version

- TypeScript 5.0+
- Node.js 20+ / Deno 1.40+ / Bun 1.0+

---

## Strict Configuration (MANDATORY)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": false
  }
}
```

---

## Frameworks & Libraries

> **BFF note:** BFF architecture uses different framework patterns. See sections 16-21 for BFF-specific details.

### Backend Stack

| Component | Library | Notes |
|-----------|---------|-------|
| Framework | Fastify via `@v4-company/mars-api/server` | FastifyServerBuilder, FastifyController base class |
| Query Builder | Kysely | Type-safe SQL queries via BaseRepository |
| Schema/Migrations | Prisma (prisma-kysely generator) | Schema management + type generation only — NOT used as ORM |
| DI | InversifyJS | @injectable, @inject decorators, Container |
| Validation | Zod + RequestDto from `@v4-company/mars-api/core` | All inputs as RequestDto subclass with Zod schemas |
| Auth | `@v4-company/mars-api/identity` | AuthMiddlewareBuilder, @Auth decorator — NEVER custom middleware |
| Events | RabbitMQ + EventBus from `@v4-company/mars-api/core` | Domain events, publish AFTER UoW commit |
| Testing | Vitest | Type-safe mocks via `Mocked<T>` from vitest |

### Key `@v4-company/mars-api` Abstractions

The shared library provides the architectural foundation. MUST use these abstractions instead of building custom equivalents.

**From `@v4-company/mars-api/core`:**

| Abstraction | Purpose |
|-------------|---------|
| `AggregateRoot<Props>` | Base for domain aggregate roots |
| `Entity<Props>` | Base for domain child entities |
| `EntityIdVO`, `RequiredStringVO`, `RequiredBooleanVO`, `RequiredDateVO`, `StringVO`, `EmailVO` | Value Object types |
| `UseCase<In, Out>` | Use case interface |
| `Service<In, Out>` | Reusable service interface |
| `EventHandler<T>` | Event handler interface |
| `BaseRepository<T, DB>` | Repository base with Kysely |
| `UowEntitiesRepository<T>` | Unit of Work repository interface |
| `KyselyUnitOfWork` | Transaction manager (uow.start → commit) |
| `PaginationParams`, `PaginatedResult<T>` | Pagination types — MUST NOT create custom pagination types |
| `KyselyDatabasePagination` | Pagination helper for Kysely queries |
| `RequestDto` | Base class for input DTOs with Zod validation |
| `EventBus`, `RabbitMQEventBus` | Event publishing |
| `NotFoundException`, `BadRequestException`, `HttpException` | Standard exceptions |
| `createHandlerScope` | Event handler DI scoping |

**From `@v4-company/mars-api/server`:**

| Abstraction | Purpose |
|-------------|---------|
| `FastifyController` | Controller base class (routing, validation, error handling) |
| `FastifyServerBuilder` | Server factory with fluent API |
| `Route` | Method decorator (get/post/put/delete/patch) |
| `ApiTag`, `ApiBodySchema`, `ApiQueryParamsSchema`, `ApiResponseSchema` | OpenAPI decorators |

**From `@v4-company/mars-api/identity`:**

| Abstraction | Purpose |
|-------------|---------|
| `AuthMiddlewareBuilder` | Auth middleware factory |
| `createAuthMiddleware(identityUrl)` | Creates middleware instance |
| `Auth` | Route decorator for permission checking |
| `AuthResponse` | Authenticated user/token info (sub, orgId, aud, kind) |
| `AuthFastifyRequest<T>` | Type-safe request with auth context |

---

## Type Safety

### never use `any`

```typescript
// FORBIDDEN
const data: any = fetchData();
function process(x: any) { ... }

// CORRECT - use unknown with type narrowing
const data: unknown = fetchData();
if (isUser(data)) {
    console.log(data.name); // Now TypeScript knows it's User
}

// Type guard
function isUser(value: unknown): value is User {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'name' in value
    );
}
```

### Branded Types for IDs

```typescript
// Define branded type to prevent ID mixing
type Brand<T, B> = T & { __brand: B };

type UserId = Brand<string, 'UserId'>;
type TenantId = Brand<string, 'TenantId'>;
type OrderId = Brand<string, 'OrderId'>;

// Factory functions with validation
function createUserId(value: string): UserId {
    if (!value.startsWith('usr_')) {
        throw new Error('Invalid user ID format');
    }
    return value as UserId;
}

// Now TypeScript prevents mixing IDs
function getUser(id: UserId): User { ... }
function getOrder(id: OrderId): Order { ... }

const userId = createUserId('usr_123');
const orderId = createOrderId('ord_456');

getUser(userId);   // OK
getUser(orderId);  // TypeScript ERROR - type mismatch
```

### Discriminated Unions for State

```typescript
// CORRECT - use discriminated unions
type RequestState<T> =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: T }
    | { status: 'error'; error: Error };

function handleState(state: RequestState<User>) {
    switch (state.status) {
        case 'idle':
            return null;
        case 'loading':
            return <Spinner />;
        case 'success':
            return <UserCard user={state.data} />; // TypeScript knows data exists
        case 'error':
            return <ErrorMessage error={state.error} />; // TypeScript knows error exists
    }
}
```

### Result Type for Error Handling

```typescript
// Define Result type
type Result<T, E = Error> =
    | { success: true; data: T }
    | { success: false; error: E };

// Usage
async function createUser(input: CreateUserInput): Promise<Result<User, ValidationError>> {
    const validation = userSchema.safeParse(input);
    if (!validation.success) {
        return { success: false, error: new ValidationError(validation.error) };
    }

    const user = await db.user.create({ data: validation.data });
    return { success: true, data: user };
}

// Pattern matching approach
const result = await createUser(input);
if (result.success) {
    console.log(result.data.id); // TypeScript knows data exists
} else {
    console.error(result.error.message); // TypeScript knows error exists
}
```

---

## Zod Validation Patterns

### Schema Definition

```typescript
import { z } from 'zod';

// Reusable primitives
const emailSchema = z.string().email();
const uuidSchema = z.string().uuid();
const moneySchema = z.number().positive().multipleOf(0.01);

// Compose schemas
const createUserSchema = z.object({
    email: emailSchema,
    name: z.string().min(1).max(100),
    role: z.enum(['admin', 'user', 'guest']),
    preferences: z.object({
        theme: z.enum(['light', 'dark']).default('light'),
        notifications: z.boolean().default(true),
    }).optional(),
});

// Infer TypeScript type from schema
type CreateUserInput = z.infer<typeof createUserSchema>;

// Runtime validation
function createUser(input: unknown): CreateUserInput {
    return createUserSchema.parse(input); // Throws on invalid
}

// Safe parsing (returns Result-like)
function validateUser(input: unknown) {
    const result = createUserSchema.safeParse(input);
    if (!result.success) {
        return { error: result.error.flatten() };
    }
    return { data: result.data };
}
```

### Schema Composition

```typescript
// Base schemas
const timestampSchema = z.object({
    createdAt: z.date(),
    updatedAt: z.date(),
});

const identifiableSchema = z.object({
    id: uuidSchema,
});

// Compose for full entity
const userSchema = identifiableSchema
    .merge(timestampSchema)
    .extend({
        email: emailSchema,
        name: z.string(),
    });
```

---

## Dependency Injection

### InversifyJS with TYPES Symbols

Use InversifyJS with centralized TYPES symbols for all DI bindings. MUST NOT use string-based injection tokens.

```typescript
// app/dtos/types.ts — Centralized DI symbols
export const TYPES = {
  // Repositories
  UserRepository: Symbol.for("UserRepository"),
  ProjectRepository: Symbol.for("ProjectRepository"),

  // Services
  CheckUserOrganizationService: Symbol.for("CheckUserOrganizationService"),

  // Infrastructure
  UnitOfWork: Symbol.for("UnitOfWork"),
  IdentityUrl: Symbol.for("IdentityUrl"),
  EventBus: Symbol.for("EventBus"),
};
```

```typescript
// UseCase with DI — constructor injection via @inject
import { injectable, inject } from "inversify";
import { type UseCase } from "@v4-company/mars-api/core";
import { TYPES } from "../dtos/types.ts";

@injectable()
export class FindUserByIdUseCase implements UseCase<FindUserByIdRequest, UserResponse> {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: FindUserByIdRequest): Promise<UserResponse> {
    const user = await this.userRepository.findById(input.props.id);
    if (!user) throw new UserNotFoundException();
    return new UserResponseMapper().toResponse({ user });
  }
}
```

### DI Container Configuration

Organize bindings into separate config files, called from the main container:

```typescript
// infra/di/container.ts — Main container setup
import { Container } from "inversify";

export function createContainer(): Container {
  const container = new Container();

  // Validate required env vars at boot
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");

  // Call config functions
  configureRepositories(container);
  configureUseCases(container);
  configureServices(container);
  configureControllers(container);
  configureEvents(container);

  // Singletons for shared infrastructure
  container.bind(TYPES.EventBus).to(RabbitMQEventBus).inSingletonScope();
  container.bind(TYPES.UnitOfWork).to(KyselyUnitOfWork).inTransientScope();

  return container;
}
```

```typescript
// infra/di/usecases.ts — Use case bindings (all transient)
export function configureUseCases(container: Container): void {
  container.bind(FindUserByIdUseCase).toSelf().inTransientScope();
  container.bind(CreateUserUseCase).toSelf().inTransientScope();
  // ...
}
```

**Rules:**
- Use cases and repositories: `inTransientScope()` (new instance per request)
- EventBus, config values: `inSingletonScope()` (shared)
- MUST validate env vars at container creation, not at runtime

---

## Context Propagation

> **BFF note:** BFF applications using Next.js may use AsyncLocalStorage. See sections 16-21 for BFF-specific patterns.

Context is propagated through **dependency injection and method parameters**, not global storage.

### Auth Context via @Auth Decorator

The `@Auth()` decorator from `@v4-company/mars-api/identity` provides auth context on every request:

```typescript
import { Auth, type AuthFastifyRequest } from "@v4-company/mars-api/identity";
import { PERMISSIONS } from "../config/Permissions.ts";

@injectable()
export class UserController extends FastifyController {
  // @Auth() — any authenticated user
  @Auth()
  @Route("get", "/users/me")
  async me(req: AuthFastifyRequest, reply: FastifyReply) {
    // req.auth contains: { sub, orgId, aud, kind }
    const user = await this.findUserUseCase.execute(
      new FindUserByIdRequest({ id: req.auth.sub }),
    );
    return reply.send(user);
  }

  // @Auth(RESOURCE, ACTION) — specific permission required
  @Auth(PERMISSIONS.RESOURCES.USERS, PERMISSIONS.ACTIONS.CREATE)
  @Route("post", "/users")
  async create(req: AuthFastifyRequest<{ Body: CreateUserDTO }>, reply: FastifyReply) {
    const result = await this.createUserUseCase.execute(request, req.auth);
    return reply.send(result).status(201);
  }
}
```

### Transaction Context via Unit of Work

Transaction boundaries are managed by `KyselyUnitOfWork`, injected via DI:

```typescript
@injectable()
export class CreateProjectUseCase implements UseCase<CreateProjectRequest, ProjectResponse> {
  constructor(
    @inject(TYPES.UnitOfWork) private readonly uow: UnityOfWork,
    @inject(TYPES.ProjectRepository) private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(input: CreateProjectRequest, auth: AuthResponse): Promise<ProjectResponse> {
    const project = Project.create({ name: input.props.name, createdBy: auth.sub });

    await this.uow.start([this.projectRepository]);
    this.uow.registerNew(project);
    await this.uow.commit();

    // Publish events AFTER commit
    await this.eventBus.publish(project.raisedEvents);

    return new ProjectResponseMapper().toResponse({ project });
  }
}
```

**Rules:**
- MUST NOT use AsyncLocalStorage for request/auth context in backend services
- Auth context comes from `req.auth` (provided by @Auth decorator)
- Transaction context comes from `KyselyUnitOfWork` (injected via DI)
- Service parameters pass context explicitly — no hidden global state

---

## Testing

### Type-Safe Mocks

```typescript
import { vi, describe, it, expect } from 'vitest';

// Create typed mock
const mockUserRepository: jest.Mocked<UserRepository> = {
    findById: vi.fn(),
    save: vi.fn(),
};

describe('UserService', () => {
    it('returns user when found', async () => {
        // Arrange
        const user: User = { id: 'usr_123', name: 'John', email: 'john@example.com' };
        mockUserRepository.findById.mockResolvedValue(user);

        const service = new UserService(mockUserRepository);

        // Act
        const result = await service.getUser('usr_123');

        // Assert
        expect(result).toEqual(user);
        expect(mockUserRepository.findById).toHaveBeenCalledWith('usr_123');
    });

    it('throws NotFoundError when user not found', async () => {
        // Arrange
        mockUserRepository.findById.mockResolvedValue(null);

        const service = new UserService(mockUserRepository);

        // Act & Assert
        await expect(service.getUser('usr_999')).rejects.toThrow(NotFoundError);
    });
});
```

### Type-Safe Fixtures

```typescript
// fixtures/user.ts
import { faker } from '@faker-js/faker';

export function createUserFixture(overrides: Partial<User> = {}): User {
    return {
        id: `usr_${faker.string.uuid()}`,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        createdAt: faker.date.past(),
        updatedAt: new Date(),
        ...overrides,
    };
}

// Usage in tests
const user = createUserFixture({ name: 'Test User' });
```

### Edge Case Coverage (MANDATORY)

**Every acceptance criterion MUST have edge case tests beyond the happy path.**

| AC Type | Required Edge Cases | Minimum Count |
|---------|---------------------|---------------|
| Input validation | null, undefined, empty string, boundary values, invalid format, special chars | 3+ |
| CRUD operations | not found, duplicate, concurrent access, large payload | 3+ |
| Business logic | zero, negative, overflow, boundary conditions, invalid state | 3+ |
| Error handling | timeout, connection refused, invalid response, retry exhausted | 2+ |
| Authentication | expired token, invalid token, missing token, revoked token | 2+ |

**Edge Case Test Pattern:**

```typescript
describe('UserService', () => {
    describe('createUser', () => {
        // Happy path
        it('creates user with valid input', async () => {
            const result = await service.createUser(validInput);
            expect(result.id).toBeDefined();
        });

        // Edge cases (MANDATORY - minimum 3)
        it('throws ValidationError for null input', async () => {
            await expect(service.createUser(null as any)).rejects.toThrow(ValidationError);
        });

        it('throws ValidationError for empty email', async () => {
            await expect(service.createUser({ ...validInput, email: '' })).rejects.toThrow(ValidationError);
        });

        it('throws ValidationError for invalid email format', async () => {
            await expect(service.createUser({ ...validInput, email: 'invalid' })).rejects.toThrow(ValidationError);
        });

        it('throws ValidationError for email exceeding max length', async () => {
            const longEmail = 'a'.repeat(256) + '@test.com';
            await expect(service.createUser({ ...validInput, email: longEmail })).rejects.toThrow(ValidationError);
        });

        it('throws DuplicateError for existing email', async () => {
            mockRepo.findByEmail.mockResolvedValue(existingUser);
            await expect(service.createUser(validInput)).rejects.toThrow(DuplicateError);
        });
    });
});
```

**Anti-Pattern (FORBIDDEN):**

```typescript
// ❌ WRONG: Only happy path
describe('UserService', () => {
    it('creates user', async () => {
        const result = await service.createUser(validInput);
        expect(result).toBeDefined();  // No edge cases = incomplete test
    });
});
```

---

## Error Handling

### Custom Error Classes

```typescript
// Base application error
export class AppError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly statusCode: number = 500,
        public readonly details?: Record<string, unknown>
    ) {
        super(message);
        this.name = this.constructor.name;
    }

    toJSON() {
        return {
            error: {
                code: this.code,
                message: this.message,
                details: this.details,
            },
        };
    }
}

// Specific errors
export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, 'NOT_FOUND', 404);
    }
}

export class ValidationError extends AppError {
    constructor(errors: z.ZodError) {
        super('Validation failed', 'VALIDATION_ERROR', 400, {
            fields: errors.flatten().fieldErrors,
        });
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 'UNAUTHORIZED', 401);
    }
}
```

---

## Function Design (MANDATORY)

**Single Responsibility Principle (SRP):** Each function MUST have exactly ONE responsibility.

### Rules

| Rule | Description |
|------|-------------|
| **One responsibility per function** | A function should do ONE thing and do it well |
| **Max 20-30 lines** | If longer, break into smaller functions |
| **One level of abstraction** | Don't mix high-level and low-level operations |
| **Descriptive names** | Function name should describe its single responsibility |

### Examples

```typescript
// ❌ BAD - Multiple responsibilities
async function processOrder(order: Order): Promise<void> {
    // Validate order
    if (!order.items?.length) {
        throw new Error('no items');
    }
    // Calculate total
    let total = 0;
    for (const item of order.items) {
        total += item.price * item.quantity;
    }
    // Apply discount
    if (order.couponCode) {
        total = total * 0.9;
    }
    // Save to database
    await db.orders.save(order);
    // Send email
    await sendEmail(order.customerEmail, 'Order confirmed');
}

// ✅ GOOD - Single responsibility per function
async function processOrder(order: Order): Promise<void> {
    validateOrder(order);
    const total = calculateTotal(order.items);
    const finalTotal = applyDiscount(total, order.couponCode);
    await saveOrder(order, finalTotal);
    await notifyCustomer(order.customerEmail);
}

function validateOrder(order: Order): void {
    if (!order.items?.length) {
        throw new ValidationError('Order must have items');
    }
}

function calculateTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function applyDiscount(total: number, couponCode?: string): number {
    return couponCode ? total * 0.9 : total;
}
```

### Signs a Function Has Multiple Responsibilities

| Sign | Action |
|------|--------|
| Multiple `// section` comments | Split at comment boundaries |
| "and" in function name | Split into separate functions |
| More than 3 parameters | Consider parameter object or splitting |
| Nested conditionals > 2 levels | Extract inner logic to functions |
| Function does validation and processing | Separate validation function |

---

## File Organization (MANDATORY)

**Single Responsibility per File:** Each file MUST represent ONE cohesive concept.

### Rules

| Rule | Description |
|------|-------------|
| **One concept per file** | A file groups functions/types for a single domain concept |
| **Max 200-300 lines** | If longer, split by responsibility boundaries |
| **File name = content** | `user-validator.ts` MUST only contain user validation logic |
| **One class per file** | Each class gets its own file |
| **Co-locate types with usage** | Types used by one file live in that file, shared types in `/types` |

### Examples

```typescript
// ❌ BAD - transaction-service.ts (500 lines, multiple concerns)
export class TransactionService {
    constructor(
        private readonly repo: TransactionRepository,
        private readonly logger: Logger,
    ) {}

    // CRUD operations
    async createTransaction(input: CreateTransactionInput): Promise<Transaction> { ... }
    async updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction> { ... }
    async getTransaction(id: string): Promise<Transaction> { ... }
    async listTransactions(filter: TransactionFilter): Promise<Transaction[]> { ... }

    // Validation (different concern)
    async validateAmount(amount: number, currency: string): Promise<void> { ... }
    async validateParties(from: string, to: string): Promise<void> { ... }

    // Fee calculation (different concern)
    async calculateFees(amount: number, type: TransactionType): Promise<Fee> { ... }
    async applyExchangeRate(amount: number, from: string, to: string): Promise<number> { ... }

    // Export (different concern)
    async generateReceipt(id: string): Promise<Receipt> { ... }
    async exportToOFX(id: string): Promise<Buffer> { ... }
}
```

```typescript
// ✅ GOOD - Split by responsibility

// create-transaction.command.ts (~80 lines) - Write operation
export class CreateTransactionCommand {
    constructor(
        private readonly repo: TransactionRepository,
        private readonly validator: TransactionValidator,
        private readonly logger: Logger,
    ) {}

    async execute(input: CreateTransactionInput): Promise<Transaction> { ... }
}

// update-transaction.command.ts (~70 lines) - Write operation
export class UpdateTransactionCommand {
    constructor(
        private readonly repo: TransactionRepository,
        private readonly logger: Logger,
    ) {}

    async execute(id: string, input: UpdateTransactionInput): Promise<Transaction> { ... }
}

// get-transaction.query.ts (~50 lines) - Read operation
export class GetTransactionQuery {
    constructor(private readonly repo: TransactionRepository) {}

    async execute(id: string): Promise<Transaction> { ... }
}

// list-transactions.query.ts (~60 lines) - Read operation
export class ListTransactionsQuery {
    constructor(private readonly repo: TransactionRepository) {}

    async execute(filter: TransactionFilter): Promise<Transaction[]> { ... }
}

// transaction-validator.ts (~70 lines) - Validation
export function validateAmount(amount: number, currency: string): void { ... }
export function validateParties(from: string, to: string): void { ... }

// transaction-fees.ts (~60 lines) - Fee calculation
export function calculateFees(amount: number, type: TransactionType): Fee { ... }
export function applyExchangeRate(amount: number, from: string, to: string): number { ... }

// transaction-export.ts (~80 lines) - Export/reporting
export function generateReceipt(id: string): Promise<Receipt> { ... }
export function exportToOFX(id: string): Promise<Buffer> { ... }
```

### Signs a File Needs Splitting

| Sign | Action |
|------|--------|
| File exceeds 300 lines | Split at responsibility boundaries |
| Multiple exported classes | One class per file |
| `// ===== Section =====` separator comments | Each section becomes its own file |
| Mix of commands + queries in one service | Split into separate command/query files |
| File name requires "and" to describe content | Split into separate files |
| More than 5 unrelated exports | Group related exports into separate modules |
| Types block at top exceeds 50 lines | Extract to dedicated `types.ts` or co-located type file |

---

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | `user-service.ts` |
| Interfaces | PascalCase | `UserRepository` |
| Types | PascalCase | `CreateUserInput` |
| Functions | camelCase | `createUser` |
| Constants | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| Enums | PascalCase + UPPER_SNAKE values | `UserRole.ADMIN` |

---

## Directory Structure

The directory structure follows **Clean Architecture + DDD** with strict layer separation.

```
src/
  domain/                  # Pure business logic (ZERO dependencies on app or infra)
    aggregates/            # Aggregate roots (extend AggregateRoot<Props>)
    entities/              # Domain child entities (extend Entity<Props>)
    value-objects/         # Immutable Value Objects
    repositories/          # Repository interfaces (extend UowEntitiesRepository)
    providers/             # External service interface contracts
    schemas/               # Zod domain validation schemas
    test/mocks/            # Domain test mocks (RepositoryMock, EntityMock)
  app/                     # Application layer (depends ONLY on domain)
    usecases/              # Use cases — orchestration only (UseCase<In, Out>)
    services/              # Reusable business services (Service<In, Out>)
    dtos/
      inputs/              # Input DTOs (Zod schema + RequestDto subclass)
      outputs/             # Response DTOs (z.infer types)
      types.ts             # TYPES symbols for DI
    mappers/               # Response mappers (domain aggregate → API response)
    events/                # Event handlers (EventHandler<T>)
    exceptions/            # Application exceptions (NotFoundException, etc.)
  infra/                   # Infrastructure (depends on app + domain)
    controllers/           # FastifyController subclasses with decorators
    database/
      kysely/              # Kysely repository implementations (BaseRepository)
      prisma/              # Prisma schema + migrations (type generation only)
    mappers/               # Persistence mappers (domain ↔ database, bidirectional)
    providers/             # Provider implementations (e.g., JoseTokenProvider)
    di/                    # DI container config (container.ts + per-concern files)
    server/                # Server bootstrap (FastifyServerBuilder)
    events/                # Event bus setup (RabbitMQ subscriptions)
    config/                # Configuration (Permissions.ts, etc.)
```

**Layer dependency rules (MANDATORY):**
- **domain/** → ZERO imports from app/ or infra/
- **app/** → imports from domain/ only (except DI types from infra/di)
- **infra/** → imports from app/ and domain/

**Naming conventions:**
- Files: `PascalCase` with concept suffix — `FindUserByIdUseCase.ts`, `UserResponseMapper.ts`, `KyselyUserRepository.ts`
- Test files: co-located as `*.spec.ts` — `FindUserByIdUseCase.spec.ts`
- Test mocks: in `domain/test/mocks/` — `UserMock.ts`, `UserRepositoryMock.ts`

---

## RabbitMQ Worker Pattern

When the application includes async processing (API+Worker or Worker Only), follow this pattern.

### Application Types

| Type | Characteristics | Components |
|------|----------------|------------|
| **API Only** | HTTP endpoints, no async processing | Handlers, Services, Repositories |
| **API + Worker** | HTTP endpoints + async message processing | All above + Consumers, Producers |
| **Worker Only** | No HTTP, only message processing | Consumers, Services, Repositories |

### Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│  Service Bootstrap                                          │
│  ├── HTTP Server (Express/Fastify)  ← API endpoints        │
│  ├── RabbitMQ Consumer              ← Event-driven workers │
│  └── Redis Consumer (optional)      ← Scheduled polling    │
└─────────────────────────────────────────────────────────────┘
```

### Core Types

```typescript
// Handler function signature
type QueueHandlerFunc = (ctx: Context, body: Buffer) => Promise<void>;

// Consumer configuration
interface ConsumerConfig {
    connection: RabbitMQConnection;
    routes: Map<string, QueueHandlerFunc>;
    numberOfWorkers: number;   // Workers per queue (default: 5)
    prefetchCount: number;     // QoS prefetch (default: 10)
    logger: Logger;
    telemetry: Telemetry;
}

// Context for handlers
interface Context {
    requestId: string;
    logger: Logger;
    span: Span;
}
```

### Worker Configuration

| Config | Default | Purpose |
|--------|---------|---------|
| `RABBITMQ_NUMBERS_OF_WORKERS` | 5 | Concurrent workers per queue |
| `RABBITMQ_NUMBERS_OF_PREFETCH` | 10 | Messages buffered per worker |
| `RABBITMQ_CONSUMER_USER` | - | Separate credentials for consumer |
| `RABBITMQ_{QUEUE}_QUEUE` | - | Queue name per handler |

**Formula:** `Total buffered = Workers × Prefetch` (e.g., 5 × 10 = 50 messages)

### Handler Registration

```typescript
// Register handlers per queue
class MultiQueueConsumer {
    registerRoutes(routes: ConsumerRoutes): void {
        routes.register(
            process.env.RABBITMQ_BALANCE_CREATE_QUEUE!,
            this.handleBalanceCreate.bind(this)
        );
        routes.register(
            process.env.RABBITMQ_TRANSACTION_QUEUE!,
            this.handleTransaction.bind(this)
        );
    }
}
```

### Handler Implementation

```typescript
async handleBalanceCreate(ctx: Context, body: Buffer): Promise<void> {
    // 1. Parse and validate message
    const parsed = queueMessageSchema.safeParse(JSON.parse(body.toString()));
    if (!parsed.success) {
        ctx.logger.error('Invalid message format', { error: parsed.error });
        throw new Error(`Invalid message: ${parsed.error.message}`);
    }

    // 2. Execute business logic
    const result = await this.useCase.createBalance(ctx, parsed.data);
    if (!result.success) {
        throw result.error;
    }

    // 3. Success → Ack automatically (by returning without error)
}
```

### Message Acknowledgment

| Result | Action | Effect |
|--------|--------|--------|
| Resolves | `msg.ack()` | Message removed from queue |
| Rejects/Throws | `msg.nack(false, true)` | Message requeued |

### Worker Lifecycle

```text
runConsumers()
├── For each registered queue:
│   ├── ensureChannel() with exponential backoff
│   ├── Set QoS (prefetch)
│   ├── Start consume()
│   └── Process messages with concurrency limit

processMessage():
├── Extract/generate TraceID from headers
├── Create context with requestId
├── Start OpenTelemetry span
├── Call handler(ctx, msg.content)
├── On success: msg.ack()
└── On error: log + msg.nack(false, true)
```

### Exponential Backoff with Jitter

```typescript
const BACKOFF_CONFIG = {
    maxRetries: 5,
    initialBackoff: 500,    // ms
    maxBackoff: 10_000,     // ms
    backoffFactor: 2.0,
} as const;

function fullJitter(baseDelay: number): number {
    const jitter = Math.random() * baseDelay;
    return Math.min(jitter, BACKOFF_CONFIG.maxBackoff);
}

function nextBackoff(current: number): number {
    const next = current * BACKOFF_CONFIG.backoffFactor;
    return Math.min(next, BACKOFF_CONFIG.maxBackoff);
}
```

### Producer Implementation

```typescript
class ProducerRepository {
    async publish(
        exchange: string,
        routingKey: string,
        message: unknown,
        ctx: Context
    ): Promise<void> {
        await this.ensureChannel();

        const headers = {
            'x-request-id': ctx.requestId,
            ...injectTraceHeaders(ctx.span),
        };

        this.channel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(message)),
            {
                contentType: 'application/json',
                persistent: true,
                headers,
            }
        );
    }
}
```

### Message Schema with Zod

```typescript
const queueDataSchema = z.object({
    id: z.string().uuid(),
    value: z.unknown(),
});

const queueMessageSchema = z.object({
    organizationId: z.string().uuid(),
    ledgerId: z.string().uuid(),
    auditId: z.string().uuid(),
    data: z.array(queueDataSchema),
});

type QueueMessage = z.infer<typeof queueMessageSchema>;
```

### Service Bootstrap (API + Worker)

```typescript
class Service {
    constructor(
        private readonly server: HttpServer,
        private readonly consumer: MultiQueueConsumer,
        private readonly logger: Logger,
    ) {}

    async run(): Promise<void> {
        // Run all components concurrently
        await Promise.all([
            this.server.listen(),
            this.consumer.start(),
        ]);

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            this.logger.info('Shutting down...');
            await this.consumer.stop();
            await this.server.close();
        });
    }
}
```

### Directory Structure for Workers

```text
/src
  /infrastructure
    /rabbitmq
      consumer.ts      # ConsumerRoutes, worker pool
      producer.ts      # ProducerRepository
      connection.ts    # Connection management
  /bootstrap
    rabbitmq-server.ts # MultiQueueConsumer, handler registration
    service.ts         # Service orchestration
  /lib
    backoff.ts         # Backoff utilities
  /types
    queue.ts           # Message schemas
```

### Worker Checklist

- [ ] Handlers are idempotent (safe to process duplicates)
- [ ] Manual Ack enabled (`noAck: false`)
- [ ] Error handling throws error (triggers Nack)
- [ ] Context propagation with requestId
- [ ] OpenTelemetry spans for tracing
- [ ] Exponential backoff for connection recovery
- [ ] Graceful shutdown with proper cleanup
- [ ] Separate credentials for consumer vs producer
- [ ] Zod validation for all message payloads

---

## Always-Valid Domain Model (MANDATORY)

**HARD GATE:** All domain entities MUST use the Always-Valid Domain Model pattern. Anemic models (plain objects without validation) are FORBIDDEN.

### Why This Pattern Is Mandatory

| Problem with Anemic Models | Impact |
|---------------------------|--------|
| Objects can exist in invalid state | Bugs propagate through system |
| Validation scattered across codebase | Duplication, inconsistency |
| Business rules not enforced at creation | Invalid data reaches database |
| No single source of truth for validity | Every consumer must re-validate |

### The Pattern

**Core Principle:** An entity can NEVER exist in an invalid state. Use library base classes with factory methods.

### Aggregate Root Pattern

Aggregates extend `AggregateRoot<Props>` from `@v4-company/mars-api/core`. They use a private constructor, a `build` method for Value Object construction, `from` for reconstruction, and `create` for new instances with domain events:

```typescript
import {
  AggregateRoot,
  RequiredBooleanVO,
  RequiredDateVO,
  RequiredStringVO,
  StringVO,
  type ToPrimitives,
  type EntityIdVO,
  DomainException,
} from "@v4-company/mars-api/core";
import { EmailVerifiedEvent, UserCreatedEvent } from "@v4-company/mars-events";

import { EmailAddress } from "../entities/EmailAddress.ts";
import { type ExternalAccount } from "../entities/ExternalAccount.ts";
import { type Membership } from "../entities/Membership.ts";
import { MetadataVO } from "../value-objects/MetadataVO.ts";

type UserProps = {
  firstName: RequiredStringVO;
  lastName: RequiredStringVO;
  imageUrl: StringVO;
  banned: RequiredBooleanVO;
  emails: EmailAddress[];
  externalAccount: ExternalAccount;
  memberships: Membership[];
  metadata?: MetadataVO;
  isSystemAdmin: RequiredBooleanVO;
  createdAt: RequiredDateVO;
  updatedAt: RequiredDateVO;
};

export type PrimitiveUserProps = ToPrimitives<UserProps>;

export type CreateUserInput = Omit<PrimitiveUserProps, "emails"> & {
  email: string;
};

export class User extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id?: EntityIdVO) {
    super(props, id);
  }

  // Build method converts primitives to Value Objects
  private static build(props: PrimitiveUserProps): UserProps {
    return {
      firstName: new RequiredStringVO(props.firstName),
      lastName: new RequiredStringVO(props.lastName),
      imageUrl: new StringVO(props.imageUrl),
      banned: new RequiredBooleanVO(props.banned),
      emails: props.emails,
      externalAccount: props.externalAccount,
      isSystemAdmin: new RequiredBooleanVO(props.isSystemAdmin),
      memberships: props.memberships,
      metadata: props.metadata ? new MetadataVO(props.metadata) : undefined,
      createdAt: new RequiredDateVO(new Date()),
      updatedAt: new RequiredDateVO(new Date()),
    };
  }

  // Reconstruction from database (trusted data, no events)
  static from(props: PrimitiveUserProps, id?: EntityIdVO): User {
    return new User(User.build(props), id);
  }

  // Factory for NEW entities — raises domain events
  static create(input: CreateUserInput): User {
    const user = User.from({ ...input, emails: [] });

    const primaryEmail = EmailAddress.create({
      email: input.email,
      userId: user.id.value,
      isPrimary: true,
      verified: false,
      verifiedAt: null,
    });
    user.addEmail(primaryEmail);

    user.raiseEvent(
      new UserCreatedEvent({
        userId: user.id.value,
        email: primaryEmail.email.value,
      }),
    );

    return user;
  }

  // Getters expose values
  get firstName(): string { return this.props.firstName.value; }
  get lastName(): string { return this.props.lastName.value; }
  get banned(): boolean { return this.props.banned.value; }
  get emails(): EmailAddress[] { return this.props.emails; }

  // Domain behavior methods
  public addEmail(email: EmailAddress): void {
    if (email.isPrimary.value && this.primaryEmail) {
      throw new DomainException("User already has a primary email");
    }
    this.props.emails.push(email);
  }

  public verifyEmail(email: string): void {
    const emailAddress = this.props.emails.find((e) => e.email.value === email);
    if (!emailAddress) {
      throw new DomainException("Email not found at verification");
    }

    emailAddress.props.verified = new RequiredBooleanVO(true);
    emailAddress.props.verifiedAt = new RequiredDateVO(new Date());
    this.props.updatedAt = new RequiredDateVO(new Date());

    this.raiseEvent(new EmailVerifiedEvent({
      userId: this.id.value,
      emailAddressId: emailAddress.id.value,
    }));
  }
}
```

### Entity Pattern

Child entities extend `Entity<Props>` with the same private constructor + `build` + `create`/`from` pattern:

```typescript
import {
  DateVO,
  EmailVO,
  EntityIdVO,
  RequiredBooleanVO,
  type EntityProps,
  Entity,
  type ToPrimitives,
} from "@v4-company/mars-api/core";

export type EmailAddressProps = EntityProps<{
  email: EmailVO;
  verified: RequiredBooleanVO;
  verifiedAt: DateVO;
  isPrimary: RequiredBooleanVO;
  userId: EntityIdVO;
}>;

export type EmailAddressPrimitives = ToPrimitives<EmailAddressProps>;

export class EmailAddress extends Entity<EmailAddressProps> {
  private constructor(props: EmailAddressProps, id?: EntityIdVO) {
    super(props, id);
  }

  private static build(props: EmailAddressPrimitives): EmailAddressProps {
    return {
      email: new EmailVO(props.email),
      verified: new RequiredBooleanVO(props.verified),
      verifiedAt: new DateVO(props.verifiedAt),
      isPrimary: new RequiredBooleanVO(props.isPrimary),
      userId: new EntityIdVO(props.userId),
    };
  }

  static create(props: EmailAddressPrimitives): EmailAddress {
    const entityProps = this.build(props);
    return new EmailAddress(entityProps);
  }

  static from(props: EmailAddressPrimitives, id: EntityIdVO): EmailAddress {
    const entityProps = this.build(props);
    return new EmailAddress(entityProps, id);
  }

  get email(): EmailVO { return this.props.email; }
  get verified(): RequiredBooleanVO { return this.props.verified; }
  get verifiedAt(): DateVO { return this.props.verifiedAt; }
  get isPrimary(): RequiredBooleanVO { return this.props.isPrimary; }
  get userId(): EntityIdVO { return this.props.userId; }
}
```

### Requirements

| Requirement | Description |
|-------------|-------------|
| **Private constructor** | Prevent direct instantiation — use `create()`/`from()` factories |
| **`build` method** | Private static method that converts primitives to Value Objects |
| **`create()` factory** | For new entities — calls `build`, may raise domain events |
| **`from()` factory** | For reconstruction from database — calls `build`, no events |
| **Library base classes** | Extend `AggregateRoot<Props>` or `Entity<Props>` from mars-api/core |
| **`ToPrimitives<T>` type** | Export primitive type for use in mappers and inputs |
| **Value Objects for all properties** | Use `EntityIdVO`, `RequiredStringVO`, `RequiredBooleanVO`, `DateVO`, `EmailVO`, etc. |
| **Domain events** | Aggregates raise events via `this.raiseEvent()` — events from `@v4-company/mars-events` |
| **Domain behavior methods** | State changes through methods that validate and enforce invariants |

### UseCase Pattern (orchestration)

```typescript
@injectable()
export class CreateProjectUseCase implements UseCase<CreateProjectRequest, ProjectResponse> {
  constructor(
    @inject(TYPES.UnitOfWork) private readonly uow: UnityOfWork,
    @inject(TYPES.ProjectRepository) private readonly projectRepository: ProjectRepository,
    @inject(TYPES.EventBus) private readonly eventBus: EventBus,
  ) {}

  async execute(input: CreateProjectRequest, auth: AuthResponse): Promise<ProjectResponse> {
    // 1. Business logic
    const project = Project.create({ name: input.props.name, createdBy: auth.sub });

    // 2. UoW: start → register → commit
    await this.uow.start([this.projectRepository]);
    this.uow.registerNew(project);
    await this.uow.commit();

    // 3. Events AFTER commit (never before)
    await this.eventBus.publish(project.raisedEvents);

    // 4. Return mapped DTO
    return new ProjectResponseMapper().toResponse({ project });
  }
}
```

### Input DTO Pattern (Zod + RequestDto)

```typescript
import { z } from "zod";
import { RequestDto } from "@v4-company/mars-api/core";

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  template: z.enum(["TYPESCRIPT", "GOLANG"]),
});

export type CreateProjectDTO = z.infer<typeof CreateProjectSchema>;

export class CreateProjectRequest extends RequestDto<typeof CreateProjectSchema> {
  constructor(data: CreateProjectDTO) {
    super(CreateProjectSchema, data);
  }
}
```

### Response Mapper Pattern

```typescript
import { type ResponseMapper } from "@v4-company/mars-api/core";

type ProjectParam = { project: Project };

export class ProjectResponseMapper implements ResponseMapper<ProjectParam, ProjectResponse> {
  toResponse({ project }: ProjectParam): ProjectResponse {
    return {
      id: project.id.value,
      name: project.props.name.value,
      description: project.props.description?.value ?? null,
      createdBy: project.props.createdBy.value,
      createdAt: project.props.createdAt.value,
    };
  }
}
```

### Anti-Rationalization Table

| Rationalization | Why It's WRONG | Required Action |
|-----------------|----------------|-----------------|
| "Zod validation at boundary is enough" | Boundary validation is for input format. Domain validation is for business rules. | **Use both: Zod validation + factory validation** |
| "Adds boilerplate" | Invalid objects cause more work debugging than factories. | **Write the factory. It's an investment.** |
| "We trust our code" | Every consumer must remember to validate. Humans forget. | **Enforce at construction. Forget-proof.** |
| "Performance overhead" | Validation once at creation vs checking everywhere. | **Single validation is MORE efficient** |
| "Existing code doesn't do this" | Technical debt. Refactor when touching the code. | **New code MUST follow. Refactor gradually.** |
| "Plain interfaces are fine for DTOs" | DTOs are fine as plain objects. Domain entities are NOT. | **Distinguish DTO from Domain Entity** |

### Checklist

- [ ] All domain entities use `private constructor` + `static create()` factory
- [ ] Factories return `Result<Entity, Error>` - never throw
- [ ] Properties are `readonly` or accessed via getters
- [ ] Mutation through validated methods only
- [ ] Reconstruct methods for database loading
- [ ] No direct object instantiation outside factories

---

## BFF Architecture Pattern (MANDATORY)

**HARD GATE:** All Next.js projects with dynamic data MUST use the BFF (Backend for Frontend) pattern via API Routes. Server Actions are FORBIDDEN.

### Why BFF is Mandatory

| Risk (Without BFF) | Impact |
|--------------------|--------|
| **Security** | API keys, tokens exposed in browser |
| **CORS issues** | Cross-origin requests blocked or misconfigured |
| **Type safety** | No server-side validation before client receives data |
| **Error handling** | Inconsistent error formats across different backends |
| **Performance** | No server-side caching, aggregation, or optimization |

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│  src/core/                                                   │
│  ├── domain/              # Business entities, interfaces   │
│  │   ├── entities/        # Domain models                   │
│  │   ├── repositories/    # Repository interfaces           │
│  │   └── services/        # Domain service interfaces       │
│  ├── application/         # Use cases, orchestration        │
│  │   └── use-cases/       # Application logic               │
│  └── infrastructure/      # External implementations        │
│      ├── http/            # HTTP clients, external APIs     │
│      ├── repositories/    # Repository implementations      │
│      └── app.ts           # Application bootstrap           │
└─────────────────────────────────────────────────────────────┘
```

### Dual-Mode Architecture

The BFF architecture supports two modes based on whether `@lerianstudio/sindarian-server` is available:

| Mode | When to Use | Characteristics |
|------|-------------|-----------------|
| **With sindarian-server** | Project has `@lerianstudio/sindarian-server` dependency | Use decorators (@Controller, @Get, @injectable, @inject, @Module) |
| **Without sindarian-server** | Standard Next.js project | Same architecture, manual DI container, no decorators |

**IMPORTANT:** Both modes follow IDENTICAL architecture. The only difference is decorator usage.

### Directory Structure

```
/src/core
  /domain
    /entities
      organization.ts           # Domain entity
    /repositories
      organization-repository.ts # Repository interface
  /application
    /use-cases
      /organization
        get-organizations.use-case.ts
        create-organization.use-case.ts
  /infrastructure
    /http
      /controllers
        organization.controller.ts
      /dto
        midaz-organization.dto.ts
        organization.dto.ts
      /mappers
        midaz-organization.mapper.ts
        organization.mapper.ts
      /services
        midaz-http.service.ts    # External API client
    /repositories
      organization.repository.ts # Implementation
    /modules
      organization.module.ts     # DI module (sindarian) or container setup
    app.ts                       # Bootstrap
```

### With sindarian-server (Decorators)

```typescript
// src/core/infrastructure/http/controllers/organization.controller.ts
import { Controller, Get, Post, Body, Query } from '@lerianstudio/sindarian-server';

@Controller('/organizations')
export class OrganizationController {
    constructor(
        @inject(GetOrganizationsUseCase) private getOrganizations: GetOrganizationsUseCase,
        @inject(CreateOrganizationUseCase) private createOrganization: CreateOrganizationUseCase,
    ) {}

    @Get('/')
    async list(@Query('limit') limit?: number) {
        return this.getOrganizations.execute({ limit: limit ?? 10 });
    }

    @Post('/')
    async create(@Body() body: CreateOrganizationDto) {
        return this.createOrganization.execute(body);
    }
}

// src/core/infrastructure/app.ts
import { ServerFactory } from '@lerianstudio/sindarian-server';
import { AppModule } from './modules/app.module';

export const app = await ServerFactory.create(AppModule);

// app/api/organizations/route.ts (Next.js API Route)
import { app } from '@/core/infrastructure/app';

export const GET = app.handler.bind(app);
export const POST = app.handler.bind(app);
```

### Without sindarian-server (Manual DI)

```typescript
// src/core/infrastructure/http/controllers/organization.controller.ts
export class OrganizationController {
    constructor(
        private getOrganizations: GetOrganizationsUseCase,
        private createOrganization: CreateOrganizationUseCase,
    ) {}

    async list(limit: number = 10) {
        return this.getOrganizations.execute({ limit });
    }

    async create(body: CreateOrganizationDto) {
        return this.createOrganization.execute(body);
    }
}

// src/core/infrastructure/container.ts
import { Container } from 'inversify';

const container = new Container();
container.bind(OrganizationRepository).to(OrganizationRepositoryImpl);
container.bind(GetOrganizationsUseCase).toSelf();
container.bind(CreateOrganizationUseCase).toSelf();
container.bind(OrganizationController).toSelf();

export { container };

// app/api/organizations/route.ts (Next.js API Route)
import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/core/infrastructure/container';
import { OrganizationController } from '@/core/infrastructure/http/controllers/organization.controller';

export async function GET(request: NextRequest) {
    const controller = container.get(OrganizationController);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '10');

    try {
        const result = await controller.list(limit);
        return NextResponse.json(result);
    } catch (error) {
        return handleError(error);
    }
}

export async function POST(request: NextRequest) {
    const controller = container.get(OrganizationController);
    const body = await request.json();

    try {
        const result = await controller.create(body);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return handleError(error);
    }
}
```

### Use Case Pattern

```typescript
// src/core/application/use-cases/organization/get-organizations.use-case.ts
import { injectable, inject } from 'inversify';

@injectable()
export class GetOrganizationsUseCase {
    constructor(
        @inject(OrganizationRepository) private repository: OrganizationRepository,
    ) {}

    async execute(params: { limit: number }): Promise<Organization[]> {
        return this.repository.findAll({ limit: params.limit });
    }
}
```

### Anti-Patterns (FORBIDDEN)

| Pattern | Status | Why |
|---------|--------|-----|
| Server Actions | **FORBIDDEN** | No centralized error handling, no middleware support |
| Direct API calls from client | **FORBIDDEN** | Security risk, no aggregation layer |
| Business logic in API routes | **FORBIDDEN** | Must be in use cases |
| Repository in controller | **FORBIDDEN** | Controller → Use Case → Repository |
| Skipping use case for "simple" operations | **FORBIDDEN** | Consistency over convenience |

---

## Three-Layer DTO Mapping (MANDATORY)

**HARD GATE:** All data transformations MUST use three-layer DTO mapping. Direct object passing between layers is FORBIDDEN.

### The Three Layers

```
┌──────────────────────────────────────────────────────────────┐
│  HTTP Layer (Controllers)                                     │
│  └── HTTP DTOs (CreateOrganizationDto, OrganizationResponse) │
├──────────────────────────────────────────────────────────────┤
│  Domain Layer (Use Cases)                                     │
│  └── Domain Entities (Organization)                           │
├──────────────────────────────────────────────────────────────┤
│  Infrastructure Layer (External Services)                     │
│  └── External DTOs (MidazOrganizationDto)                    │
└──────────────────────────────────────────────────────────────┘
```

### Mapper Interfaces

```typescript
// Domain ↔ HTTP Mapper
interface EntityMapper<Entity, HttpDto, CreateDto> {
    toEntity(dto: HttpDto): Entity;
    toDto(entity: Entity): HttpDto;
    fromCreateDto(dto: CreateDto): Partial<Entity>;
}

// Domain ↔ External Service Mapper
interface ExternalMapper<Entity, ExternalDto> {
    toDomain(external: ExternalDto): Entity;
    toExternal(entity: Entity): ExternalDto;
}
```

### Implementation Example

```typescript
// src/core/domain/entities/organization.ts
export interface Organization {
    id: string;
    name: string;
    status: OrganizationStatus;
    createdAt: Date;
    updatedAt: Date;
}

// src/core/infrastructure/http/dto/organization.dto.ts (HTTP Layer)
export interface CreateOrganizationDto {
    name: string;
}

export interface OrganizationResponseDto {
    id: string;
    name: string;
    status: string;
    created_at: string;  // snake_case for API response
    updated_at: string;
}

// src/core/infrastructure/http/dto/midaz-organization.dto.ts (External Service)
export interface MidazOrganizationDto {
    organization_id: string;
    organization_name: string;
    org_status: string;
    created_timestamp: string;
}

// src/core/infrastructure/http/mappers/organization.mapper.ts
export class OrganizationMapper implements EntityMapper<Organization, OrganizationResponseDto, CreateOrganizationDto> {
    toEntity(dto: OrganizationResponseDto): Organization {
        return {
            id: dto.id,
            name: dto.name,
            status: dto.status as OrganizationStatus,
            createdAt: new Date(dto.created_at),
            updatedAt: new Date(dto.updated_at),
        };
    }

    toDto(entity: Organization): OrganizationResponseDto {
        return {
            id: entity.id,
            name: entity.name,
            status: entity.status,
            created_at: entity.createdAt.toISOString(),
            updated_at: entity.updatedAt.toISOString(),
        };
    }

    fromCreateDto(dto: CreateOrganizationDto): Partial<Organization> {
        return {
            name: dto.name,
            status: 'active' as OrganizationStatus,
        };
    }
}

// src/core/infrastructure/http/mappers/midaz-organization.mapper.ts
export class MidazOrganizationMapper implements ExternalMapper<Organization, MidazOrganizationDto> {
    toDomain(external: MidazOrganizationDto): Organization {
        return {
            id: external.organization_id,
            name: external.organization_name,
            status: this.mapStatus(external.org_status),
            createdAt: new Date(external.created_timestamp),
            updatedAt: new Date(), // External doesn't provide this
        };
    }

    toExternal(entity: Organization): MidazOrganizationDto {
        return {
            organization_id: entity.id,
            organization_name: entity.name,
            org_status: entity.status.toUpperCase(),
            created_timestamp: entity.createdAt.toISOString(),
        };
    }

    private mapStatus(externalStatus: string): OrganizationStatus {
        const statusMap: Record<string, OrganizationStatus> = {
            'ACTIVE': 'active',
            'INACTIVE': 'inactive',
            'SUSPENDED': 'suspended',
        };
        return statusMap[externalStatus] ?? 'inactive';
    }
}
```

### Data Flow

```
Client Request
    │
    ▼
[HTTP DTO] ──────────────────────────────────────────────┐
    │                                                     │
    │ OrganizationMapper.fromCreateDto()                 │
    ▼                                                     │
[Domain Entity] ←─────────────────────────────────────────┤
    │                                                     │
    │ MidazOrganizationMapper.toExternal()               │
    ▼                                                     │
[External DTO] → External Service                        │
    │                                                     │
    │ MidazOrganizationMapper.toDomain()                 │
    ▼                                                     │
[Domain Entity] ──────────────────────────────────────────┤
    │                                                     │
    │ OrganizationMapper.toDto()                         │
    ▼                                                     │
[HTTP DTO] → Client Response                              │
```

### Anti-Rationalization Table

| Rationalization | Why It's WRONG | Required Action |
|-----------------|----------------|-----------------|
| "Same shape, no mapper needed" | Shapes evolve independently. Today same, tomorrow different. | **Create mapper now. Decouple layers.** |
| "Too much boilerplate" | Boilerplate < debugging type mismatches in production. | **Write the mapper. It's documentation.** |
| "External service uses same format" | External services change without notice. Mapper isolates impact. | **Always map. Never trust external shapes.** |
| "Just pass-through for now" | Tech debt. Every pass-through becomes a bug later. | **Map from day one.** |

---

## HttpService Lifecycle

The HttpService pattern provides hooks for request/response processing when calling external APIs.

### Lifecycle Hooks

```typescript
// src/core/infrastructure/http/services/base-http.service.ts
export abstract class BaseHttpService {
    protected baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    // Hook 1: Create default headers and config
    protected createDefaults(): RequestInit {
        return {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        };
    }

    // Hook 2: Modify request before sending
    protected onBeforeFetch(url: string, init: RequestInit): RequestInit {
        // Add auth token, request ID, etc.
        return {
            ...init,
            headers: {
                ...init.headers,
                'X-Request-ID': crypto.randomUUID(),
            },
        };
    }

    // Hook 3: Process response after receiving
    protected async onAfterFetch<T>(response: Response): Promise<T> {
        if (!response.ok) {
            throw await this.handleError(response);
        }
        return response.json();
    }

    // Hook 4: Handle errors
    protected async catch(error: unknown): Promise<never> {
        if (error instanceof ApiException) {
            throw error;
        }
        throw new ApiException('External service error', 500, { cause: error });
    }

    // Main fetch method using hooks
    protected async fetch<T>(path: string, init: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        const defaults = this.createDefaults();
        const merged = { ...defaults, ...init, headers: { ...defaults.headers, ...init.headers } };
        const finalInit = this.onBeforeFetch(url, merged);

        try {
            const response = await fetch(url, finalInit);
            return await this.onAfterFetch<T>(response);
        } catch (error) {
            return this.catch(error);
        }
    }
}
```

### Implementation Example

```typescript
// src/core/infrastructure/http/services/midaz-http.service.ts
import { injectable } from 'inversify';

@injectable()
export class MidazHttpService extends BaseHttpService {
    constructor() {
        super(process.env.MIDAZ_API_URL!);
    }

    protected createDefaults(): RequestInit {
        return {
            ...super.createDefaults(),
            headers: {
                ...super.createDefaults().headers,
                'Authorization': `Bearer ${process.env.MIDAZ_API_TOKEN}`,
            },
        };
    }

    protected onBeforeFetch(url: string, init: RequestInit): RequestInit {
        const modified = super.onBeforeFetch(url, init);
        // Add Midaz-specific headers
        return {
            ...modified,
            headers: {
                ...modified.headers,
                'X-Midaz-Client': 'bff-service',
            },
        };
    }

    protected async onAfterFetch<T>(response: Response): Promise<T> {
        // Log response metrics
        console.log(`[Midaz] ${response.status} - ${response.url}`);
        return super.onAfterFetch<T>(response);
    }

    protected async catch(error: unknown): Promise<never> {
        // Transform to Midaz-specific exception
        if (error instanceof Response) {
            const body = await error.json().catch(() => ({}));
            throw new MidazApiException(body.message ?? 'Midaz API error', error.status, body);
        }
        return super.catch(error);
    }

    // Service-specific methods
    async getOrganizations(limit: number): Promise<MidazOrganizationDto[]> {
        return this.fetch<MidazOrganizationDto[]>(`/organizations?limit=${limit}`);
    }

    async createOrganization(data: CreateMidazOrganizationDto): Promise<MidazOrganizationDto> {
        return this.fetch<MidazOrganizationDto>('/organizations', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}
```

### Hook Execution Order

```
1. createDefaults()      → Base configuration
2. onBeforeFetch()       → Request modification (auth, headers)
3. fetch()               → Actual HTTP call
4. onAfterFetch()        → Response processing (success path)
   OR
4. catch()               → Error handling (failure path)
```

---

## API Routes Pattern (MANDATORY)

**⛔ HARD GATE: Server Actions are FORBIDDEN. All dynamic data MUST flow through API Routes.**

### Why Server Actions Are Forbidden

| Server Actions Problem | Impact |
|-----------------------|--------|
| No centralized error handling | Each action handles errors differently |
| No middleware support | Cannot add auth, logging, rate limiting |
| No API versioning | Breaking changes affect all clients |
| No OpenAPI/Swagger | Cannot generate API documentation |
| Tight coupling | Client directly calls server functions |
| No caching layer | Every call hits the server |

### Required Pattern: API Routes

```typescript
// ✅ CORRECT: API Route with controller resolution
// app/api/organizations/route.ts

// With sindarian-server
import { app } from '@/core/infrastructure/app';

export const GET = app.handler.bind(app);
export const POST = app.handler.bind(app);

// Without sindarian-server
import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/core/infrastructure/container';
import { OrganizationController } from '@/core/infrastructure/http/controllers/organization.controller';
import { GlobalExceptionFilter } from '@/core/infrastructure/filters/global-exception.filter';

const exceptionFilter = new GlobalExceptionFilter();

export async function GET(request: NextRequest) {
    try {
        const controller = container.get(OrganizationController);
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') ?? '10');

        const result = await controller.list(limit);
        return NextResponse.json(result);
    } catch (error) {
        return exceptionFilter.catch(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const controller = container.get(OrganizationController);
        const body = await request.json();

        const result = await controller.create(body);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return exceptionFilter.catch(error);
    }
}
```

```typescript
// ❌ FORBIDDEN: Server Action
// app/actions/organizations.ts
'use server';

export async function getOrganizations() {
    // FORBIDDEN - This is a Server Action
    const orgs = await db.organizations.findMany();
    return orgs;
}
```

### Dynamic Route Pattern

```typescript
// app/api/organizations/[id]/route.ts

// With sindarian-server
import { app } from '@/core/infrastructure/app';

export const GET = app.handler.bind(app);
export const PUT = app.handler.bind(app);
export const DELETE = app.handler.bind(app);

// Without sindarian-server
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const controller = container.get(OrganizationController);
        const result = await controller.getById(params.id);

        if (!result) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json(result);
    } catch (error) {
        return exceptionFilter.catch(error);
    }
}
```

### Client-Side Consumption

```typescript
// hooks/use-organizations.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useOrganizations(limit: number = 10) {
    const { data, error, isLoading, mutate } = useSWR(
        `/api/organizations?limit=${limit}`,
        fetcher
    );

    return {
        organizations: data,
        isLoading,
        isError: !!error,
        refresh: mutate,
    };
}

// Usage in component
function OrganizationList() {
    const { organizations, isLoading, isError } = useOrganizations();

    if (isLoading) return <Spinner />;
    if (isError) return <ErrorMessage />;

    return (
        <ul>
            {organizations.map(org => (
                <li key={org.id}>{org.name}</li>
            ))}
        </ul>
    );
}
```

### Anti-Rationalization Table

| Rationalization | Why It's WRONG | Required Action |
|-----------------|----------------|-----------------|
| "Server Actions are simpler" | Simplicity ≠ correctness. API Routes provide necessary middleware. | **Use API Routes. Add proper middleware.** |
| "Just a small feature" | Small features grow. Start with correct architecture. | **API Route from day one.** |
| "No external consumers" | Today internal, tomorrow external. API Routes are future-proof. | **API Routes enable evolution.** |
| "Next.js recommends Server Actions" | For forms. Not for data fetching with complex requirements. | **Different tools for different jobs.** |

---

## Exception Hierarchy

**HARD GATE:** All BFF services MUST use a consistent exception hierarchy with GlobalExceptionFilter.

### Base Exception

```typescript
// src/core/infrastructure/exceptions/api.exception.ts
export class ApiException extends Error {
    constructor(
        message: string,
        public readonly statusCode: number = 500,
        public readonly details?: Record<string, unknown>,
        public readonly code?: string,
    ) {
        super(message);
        this.name = this.constructor.name;
    }

    toJSON() {
        return {
            error: {
                code: this.code ?? this.name,
                message: this.message,
                statusCode: this.statusCode,
                ...(this.details && { details: this.details }),
            },
        };
    }
}
```

### Common Exceptions

```typescript
// src/core/infrastructure/exceptions/index.ts
export class ValidationException extends ApiException {
    constructor(errors: Record<string, string[]>) {
        super('Validation failed', 400, { fields: errors }, 'VALIDATION_ERROR');
    }
}

export class NotFoundException extends ApiException {
    constructor(resource: string, id?: string) {
        super(
            id ? `${resource} with id ${id} not found` : `${resource} not found`,
            404,
            { resource, id },
            'NOT_FOUND'
        );
    }
}

export class UnauthorizedException extends ApiException {
    constructor(message = 'Unauthorized') {
        super(message, 401, undefined, 'UNAUTHORIZED');
    }
}

export class ForbiddenException extends ApiException {
    constructor(message = 'Forbidden') {
        super(message, 403, undefined, 'FORBIDDEN');
    }
}

export class ConflictException extends ApiException {
    constructor(resource: string, field: string) {
        super(
            `${resource} with this ${field} already exists`,
            409,
            { resource, field },
            'CONFLICT'
        );
    }
}

// External service exception
export class MidazApiException extends ApiException {
    constructor(message: string, statusCode: number, details?: Record<string, unknown>) {
        super(message, statusCode, details, 'MIDAZ_API_ERROR');
    }
}
```

### GlobalExceptionFilter

```typescript
// src/core/infrastructure/filters/global-exception.filter.ts
import { NextResponse } from 'next/server';
import { ApiException } from '../exceptions/api.exception';
import { ZodError } from 'zod';

export class GlobalExceptionFilter {
    catch(error: unknown): NextResponse {
        // Known API exceptions
        if (error instanceof ApiException) {
            return NextResponse.json(error.toJSON(), { status: error.statusCode });
        }

        // Zod validation errors
        if (error instanceof ZodError) {
            return NextResponse.json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Validation failed',
                    statusCode: 400,
                    details: { fields: error.flatten().fieldErrors },
                },
            }, { status: 400 });
        }

        // Unknown errors - don't leak details
        console.error('[GlobalExceptionFilter] Unhandled error:', error);

        return NextResponse.json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'An unexpected error occurred',
                statusCode: 500,
            },
        }, { status: 500 });
    }
}
```

### Usage in Controllers

```typescript
// src/core/infrastructure/http/controllers/organization.controller.ts
export class OrganizationController {
    async getById(id: string): Promise<Organization> {
        const organization = await this.repository.findById(id);

        if (!organization) {
            throw new NotFoundException('Organization', id);
        }

        return organization;
    }

    async create(dto: CreateOrganizationDto): Promise<Organization> {
        // Validation
        const parsed = createOrganizationSchema.safeParse(dto);
        if (!parsed.success) {
            throw new ValidationException(parsed.error.flatten().fieldErrors);
        }

        // Check duplicate
        const existing = await this.repository.findByName(dto.name);
        if (existing) {
            throw new ConflictException('Organization', 'name');
        }

        return this.createUseCase.execute(parsed.data);
    }
}
```

---

## Cross-Cutting Decorators

Cross-cutting concerns (logging, caching, metrics) should be handled via decorators to keep business logic clean.

### LogOperation Decorator

```typescript
// src/core/infrastructure/decorators/log-operation.decorator.ts
type Layer = 'controller' | 'application' | 'infrastructure';

interface LogOperationOptions {
    layer: Layer;
    operation?: string;
}

export function LogOperation(options: LogOperationOptions) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        const operation = options.operation ?? propertyKey;

        descriptor.value = async function (...args: any[]) {
            const startTime = Date.now();
            const logger = (this as any).logger ?? console;

            logger.info(`[${options.layer}] Starting ${operation}`, {
                layer: options.layer,
                operation,
                args: args.length,
            });

            try {
                const result = await originalMethod.apply(this, args);
                const duration = Date.now() - startTime;

                logger.info(`[${options.layer}] Completed ${operation}`, {
                    layer: options.layer,
                    operation,
                    duration,
                    success: true,
                });

                return result;
            } catch (error) {
                const duration = Date.now() - startTime;

                logger.error(`[${options.layer}] Failed ${operation}`, {
                    layer: options.layer,
                    operation,
                    duration,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });

                throw error;
            }
        };

        return descriptor;
    };
}
```

### Usage

```typescript
// src/core/application/use-cases/organization/get-organizations.use-case.ts
@injectable()
export class GetOrganizationsUseCase {
    constructor(
        @inject(OrganizationRepository) private repository: OrganizationRepository,
        @inject(Logger) private logger: Logger,
    ) {}

    @LogOperation({ layer: 'application' })
    async execute(params: { limit: number }): Promise<Organization[]> {
        return this.repository.findAll({ limit: params.limit });
    }
}

// src/core/infrastructure/http/controllers/organization.controller.ts
@Controller('/organizations')
export class OrganizationController {
    @LogOperation({ layer: 'controller', operation: 'listOrganizations' })
    @Get('/')
    async list(@Query('limit') limit?: number) {
        return this.getOrganizations.execute({ limit: limit ?? 10 });
    }
}
```

### Without Decorators (Function Wrapper)

For projects without decorator support:

```typescript
// src/core/infrastructure/utils/log-operation.ts
export function withLogging<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options: { layer: string; operation: string; logger?: Logger }
): T {
    return (async (...args: Parameters<T>) => {
        const logger = options.logger ?? console;
        const startTime = Date.now();

        logger.info(`[${options.layer}] Starting ${options.operation}`);

        try {
            const result = await fn(...args);
            logger.info(`[${options.layer}] Completed ${options.operation}`, {
                duration: Date.now() - startTime,
            });
            return result;
        } catch (error) {
            logger.error(`[${options.layer}] Failed ${options.operation}`, {
                duration: Date.now() - startTime,
                error,
            });
            throw error;
        }
    }) as T;
}

// Usage
class GetOrganizationsUseCase {
    execute = withLogging(
        async (params: { limit: number }) => {
            return this.repository.findAll({ limit: params.limit });
        },
        { layer: 'application', operation: 'getOrganizations' }
    );
}
```

### Other Common Decorators

```typescript
// Cache decorator
export function Cached(ttlSeconds: number) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const cache = new Map<string, { value: any; expiry: number }>();
        const original = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const key = JSON.stringify(args);
            const cached = cache.get(key);

            if (cached && cached.expiry > Date.now()) {
                return cached.value;
            }

            const result = await original.apply(this, args);
            cache.set(key, { value: result, expiry: Date.now() + ttlSeconds * 1000 });
            return result;
        };
    };
}

// Retry decorator
export function Retry(maxAttempts: number, delayMs: number = 1000) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            let lastError: Error;

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    return await original.apply(this, args);
                } catch (error) {
                    lastError = error as Error;
                    if (attempt < maxAttempts) {
                        await new Promise(r => setTimeout(r, delayMs * attempt));
                    }
                }
            }

            throw lastError!;
        };
    };
}
```

---

## Checklist

Before submitting TypeScript code, verify:

### Type Safety
- [ ] No `any` types (use `unknown` with narrowing)
- [ ] Strict mode enabled in tsconfig.json
- [ ] Zod validation for all external input
- [ ] Branded types for IDs
- [ ] Discriminated unions for state machines
- [ ] Type inference used where possible (avoid redundant annotations)
- [ ] No `@ts-ignore` or `@ts-expect-error` without explanation

### Error Handling
- [ ] Error classes extend base AppError
- [ ] All async functions have proper error handling
- [ ] Result type used for operations that can fail

### DDD (if enabled)
- [ ] Entities have identity comparison (`equals` method)
- [ ] Value Objects are immutable (private constructor, factory methods)
- [ ] Aggregates enforce invariants before state changes
- [ ] Domain Events emitted for significant state changes
- [ ] Repository interfaces defined in domain layer
- [ ] No infrastructure dependencies in domain layer
