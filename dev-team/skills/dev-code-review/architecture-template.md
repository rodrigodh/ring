# Mars Server Template - Architecture Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Core Principles](#core-principles)
4. [Project Structure](#project-structure)
5. [Domain Layer](#domain-layer)
6. [Application Layer](#application-layer)
7. [Infrastructure Layer](#infrastructure-layer)
8. [Dependency Injection](#dependency-injection)
9. [Adding New Features](#adding-new-features)
10. [Testing](#testing)
11. [Database & Migrations](#database--migrations)
12. [Events & Event Handlers](#events--event-handlers)
13. [Best Practices](#best-practices)
14. [Getting Started](#getting-started)

---

## Introduction

This template demonstrates a production-ready server architecture that combines **Clean Architecture**, **Domain-Driven Design (DDD)**, and **Martin Fowler's enterprise patterns**. It provides a solid foundation for building scalable, maintainable, and testable backend services.

### Key Technologies

- **TypeScript** - Type-safe development
- **Fastify** - High-performance web framework
- **Kysely** - Type-safe SQL query builder
- **Prisma** - Database schema management
- **Inversify** - Dependency injection container
- **RabbitMQ** - Event-driven architecture
- **Zod** - Runtime validation

---

## Architecture Overview

This project follows **Clean Architecture** principles, organizing code into concentric layers with clear dependencies:

```
┌─────────────────────────────────────────────────────────┐
│                    Infrastructure                        │
│  (Controllers, Database, External Services, Events)     │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                   Application                           │
│  (Use Cases, DTOs, Mappers, Event Handlers)            │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                      Domain                             │
│  (Aggregates, Entities, Value Objects, Repositories)    │
└─────────────────────────────────────────────────────────┘
```

### Dependency Rule

**The fundamental rule**: Dependencies point **inward**. The Domain layer has **zero dependencies** on outer layers. The Application layer depends only on the Domain layer. The Infrastructure layer depends on both Application and Domain layers.

This ensures:
- **Testability**: Domain logic can be tested without infrastructure
- **Flexibility**: Easy to swap implementations (e.g., change database)
- **Independence**: Business logic is independent of frameworks and libraries

---

## Core Principles

### 1. Domain-Driven Design (DDD)

DDD focuses on modeling the business domain and its logic. Key concepts:

- **Aggregates**: Cluster of domain objects treated as a single unit (e.g., `User`)
- **Entities**: Objects with unique identity (e.g., `EmailAddress`)
- **Value Objects**: Immutable objects defined by their attributes (e.g., `MetadataVO`)
- **Repositories**: Abstraction for data persistence
- **Domain Events**: Significant business occurrences

### 2. Clean Architecture

Clean Architecture separates concerns into layers:

- **Domain**: Pure business logic, no dependencies
- **Application**: Use cases orchestrate domain logic
- **Infrastructure**: Technical implementations (database, HTTP, messaging)

### 3. Martin Fowler Patterns

This template implements several Fowler patterns:

- **Repository Pattern**: Abstracts data access
- **Unit of Work**: Manages transactions and change tracking
- **Domain Events**: Decouples domain logic from side effects
- **Dependency Injection**: Inversion of Control for loose coupling
- **Mapper Pattern**: Transforms between layers

---

## Project Structure

```
src/
├── domain/              # Pure business logic (no dependencies)
│   ├── aggregates/      # Aggregate roots (User)
│   ├── entities/        # Domain entities (EmailAddress)
│   ├── value-objects/   # Immutable value objects (MetadataVO)
│   ├── repositories/    # Repository interfaces
│   ├── providers/       # External service interfaces
│   └── schemas/         # Zod schemas for validation
│
├── app/                 # Application layer (use cases, orchestration)
│   ├── usecases/        # Application use cases
│   ├── dtos/            # Data Transfer Objects (inputs/outputs)
│   ├── mappers/         # Response mappers (domain → API)
│   ├── events/          # Event handlers
│   ├── exceptions/      # Domain-specific exceptions
│   └── services/        # Shared application services
│
└── infra/               # Infrastructure layer (implementations)
    ├── controllers/     # HTTP controllers
    ├── database/        # Database implementations
    │   ├── kysely/      # Kysely repositories
    │   └── prisma/      # Prisma schema & migrations
    ├── mappers/         # Persistence mappers (domain ↔ database)
    ├── providers/       # External service implementations
    ├── events/          # Event bus setup
    ├── di/              # Dependency injection configuration
    └── server/          # Server bootstrap
```

---

## Domain Layer

The Domain layer contains the **core business logic** and is completely independent of external concerns.

### Aggregates

Aggregates are the **entry points** to the domain model. They ensure consistency boundaries and enforce business rules.

**Example: `User` Aggregate**

```typescript
// src/domain/aggregates/User.ts
export class User extends AggregateRoot<UserProps> {
  // Factory methods
  static create(props: PrimitiveUserProps): User {
    return User.from(props);
  }

  static from(props: PrimitiveUserProps, id?: EntityIdVO): User {
    return new User(User.build(props), id);
  }

  // Business logic
  public addEmail(email: EmailAddress): void {
    this.props.emails.push(email);
  }

  public verifyEmail(email: string): void {
    const emailAddress = this.props.emails.find(e => e.email.value === email);
    if (!emailAddress) {
      throw new DomainException("Email not found at verification");
    }
    
    emailAddress.props.verified = new RequiredBooleanVO(true);
    emailAddress.props.verifiedAt = new RequiredDateVO(new Date());
    
    // Raise domain event
    this.raiseEvent(new EmailVerifiedEvent({
      userId: this.id.value,
      emailAddressId: emailAddress.id.value,
    }));
  }
}
```

**Key Points:**
- Aggregates extend `AggregateRoot` from `@v4-company/mars-api/core`
- They encapsulate business logic and enforce invariants
- They raise domain events for significant occurrences
- Factory methods (`create`, `from`) control object creation

### Entities

Entities have **unique identity** and lifecycle. They are part of an aggregate.

**Example: `EmailAddress` Entity**

```typescript
// src/domain/entities/EmailAddress.ts
export class EmailAddress extends Entity<EmailAddressProps> {
  private constructor(props: EmailAddressProps, id?: EntityIdVO) {
    super(props, id);
  }

  static create(props: EmailAddressPrimitives): EmailAddress {
    const entityProps = this.build(props);
    return new EmailAddress(entityProps);
  }

  static from(props: EmailAddressPrimitives, id: EntityIdVO): EmailAddress {
    const entityProps = this.build(props);
    return new EmailAddress(entityProps, id);
  }
}
```

**Key Points:**
- Entities extend `Entity` from `@v4-company/mars-api/core`
- They have an identity (`id`)
- Use `create()` for new entities, `from()` for existing ones

### Value Objects

Value Objects are **immutable** and defined by their attributes, not identity.

**Example: `MetadataVO`**

```typescript
// src/domain/value-objects/MetadataVO.ts
export class MetadataVO extends ValueObject<MetadataType> {
  static empty(): MetadataVO {
    return new MetadataVO({});
  }

  has(key: string): boolean {
    return key in this.value;
  }

  get(key: string): unknown {
    return this.value[key];
  }
}
```

**Key Points:**
- Value Objects extend `ValueObject`
- They are immutable (no setters)
- Equality is based on values, not identity
- They encapsulate validation and behavior

### Repositories (Interfaces)

Repository interfaces define **contracts** for data access. Implementations live in the Infrastructure layer.

**Example: `UserRepository`**

```typescript
// src/domain/repositories/UserRepository.ts
export interface UserRepository extends UowEntitiesRepository<User> {
  findById(query: Omit<FindEntityById, "organizationId">): Promise<User | null>;
  findByEmail(query: { email: string }): Promise<User | null>;
  findByEmailAddressId(query: { emailAddressId: string }): Promise<User | null>;
}
```

**Key Points:**
- Repositories are **interfaces** in the Domain layer
- They extend `UowEntitiesRepository` for Unit of Work support
- Methods return domain objects, not database models
- Implementations are in `infra/database/kysely/`

### Providers (Interfaces)

Providers abstract external services (e.g., authentication providers).

**Example: `AuthProvider`**

```typescript
// src/domain/providers/AuthProvider.ts
export interface AuthProvider {
  createUser(user: CreateAuthProviderUserInput): Promise<CreateAuthProviderUserOutput>;
}
```

**Key Points:**
- Providers are **interfaces** in the Domain layer
- They define contracts for external services
- Implementations are in `infra/providers/`

---

## Application Layer

The Application layer orchestrates domain logic through **Use Cases** and handles application-specific concerns.

### Use Cases

Use Cases represent **application workflows**. They coordinate domain objects and infrastructure.

**Example: `CreateUserUseCase`**

```typescript
// src/app/usecases/CreateUserUseCase.ts
@injectable()
export class CreateUserUseCase implements UseCase<CreateUserRequest, UserResponse> {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.EventBus) private eventBus: EventBus,
    @inject(TYPES.UnitOfWork) private uow: UnityOfWork,
  ) {}

  async execute(input: CreateUserRequest, _auth: AuthResponse): Promise<UserResponse> {
    // Start Unit of Work
    await this.uow.start([this.userRepository]);

    // Business validation
    const alreadyExists = await this.userRepository.findByEmail({
      email: input.props.email,
    });
    if (alreadyExists) {
      throw new UserAlreadyCreatedException();
    }

    // Create domain objects
    const user = User.create({
      firstName: input.props.firstName,
      lastName: input.props.lastName,
      // ... other props
    });

    const email = EmailAddress.create({
      email: input.props.email,
      userId: user.id.value,
      isPrimary: true,
      verified: false,
    });

    user.addEmail(email);

    // Persist changes
    this.uow.registerNew(user);
    await this.uow.commit();

    // Publish domain events
    await this.eventBus.publish(user.raisedEvents);

    // Map to response
    return new UserResponseMapper().toResponse({ user });
  }
}
```

**Key Points:**
- Use Cases are **injectable** classes implementing `UseCase<I, O>`
- They orchestrate domain logic, don't contain business rules
- They use **Unit of Work** for transaction management
- They publish domain events after committing
- They return DTOs, not domain objects

### DTOs (Data Transfer Objects)

DTOs transfer data between layers. They validate input and structure output.

**Input DTOs:**

```typescript
// src/app/dtos/inputs/CreateUserInput.ts
export const CreateUserSchema = z.object({
  email: z.string().email().toLowerCase(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string().min(8).max(100).optional(),
});

export class CreateUserRequest extends RequestDto<CreateUserDTO> {
  constructor(input: CreateUserDTO) {
    super(input, CreateUserSchema);
  }
}
```

**Output DTOs:**

```typescript
// src/app/dtos/outputs/UserResponse.ts
export const UserResponseSchema = UserSchema.omit({});
export type UserResponse = z.infer<typeof UserResponseSchema>;
```

**Key Points:**
- Input DTOs extend `RequestDto` and validate with Zod
- Output DTOs use Zod schemas for OpenAPI generation
- DTOs are plain objects/interfaces, not domain objects

### Mappers

Mappers transform between layers:
- **Response Mappers**: Domain → API response (`UserResponseMapper`)
- **Persistence Mappers**: Domain ↔ Database (`UserPersistenceMapper`)

**Example: `UserResponseMapper`**

```typescript
// src/app/mappers/UserResponseMapper.ts
export class UserResponseMapper implements ResponseMapper<UserParam, UserResponse> {
  toResponse(param: UserParam): UserResponse {
    return {
      id: param.user.id.value,
      firstName: param.user.props.firstName.value,
      // ... map domain object to response DTO
    };
  }
}
```

**Key Points:**
- Response mappers convert domain objects to API responses
- Persistence mappers convert between domain and database models
- Mappers keep layers decoupled

### Exceptions

Application-specific exceptions extend base exceptions from `@v4-company/mars-api/core`.

**Example:**

```typescript
// src/app/exceptions/UserNotFoundException.ts
export class UserNotFoundException extends NotFoundException {
  constructor() {
    super([{ code: "USER_NOT_FOUND", message: "User not found" }]);
  }
}
```

---

## Infrastructure Layer

The Infrastructure layer provides **technical implementations** of domain abstractions.

### Controllers

Controllers handle HTTP requests and delegate to Use Cases.

**Example: `UsersController`**

```typescript
// src/infra/controllers/UserController.ts
@injectable()
export class UsersController extends FastifyController {
  constructor(
    @inject(FindUserByIdUseCase) private findUserByIdUseCase: FindUserByIdUseCase,
    @inject(CreateUserUseCase) private createUserUseCase: CreateUserUseCase,
    @inject(AuthMiddlewareBuilder) authMiddleware: AuthMiddlewareBuilder,
  ) {
    super(authMiddleware);
  }

  @ApiTag("Users")
  @ApiBodySchema(CreateUserSchemaOpenApi)
  @ApiResponseSchema({ 200: UserResponseSchema })
  @Route("post", "/users")
  async create(req: AuthFastifyRequest<{ Body: CreateUserDTO }>, reply: FastifyReply) {
    const request = new CreateUserRequest({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });

    return reply
      .send(await this.createUserUseCase.execute(request, req.auth))
      .status(200);
  }
}
```

**Key Points:**
- Controllers extend `FastifyController`
- They use decorators for routing and OpenAPI documentation
- They convert HTTP requests to DTOs and call Use Cases
- They handle authentication via `@Auth()` decorator

### Repository Implementations

Repository implementations use Kysely for type-safe database access.

**Example: `KyselyUserRepository`**

```typescript
// src/infra/database/kysely/KyselyUserRepository.ts
@injectable()
export class KyselyUserRepository
  extends BaseRepository<KyselyTransaction, Kysely<DatabaseSchema>>
  implements UserRepository
{
  async findById(input: Omit<FindEntityById, "organizationId">): Promise<User | null> {
    const result = await this.queryBuilder()
      .selectFrom("users")
      .where("id", "=", input.id.value)
      .selectAll("users")
      .select((eb) => [
        jsonArrayFrom(
          eb.selectFrom("email_addresses")
            .selectAll()
            .whereRef("email_addresses.user_id", "=", "users.id")
        ).as("emails_data"),
      ])
      .executeTakeFirst();

    if (!result) return null;

    return this.mapper.fromPersistence({
      user: { /* ... */ },
      emails: result.emails_data,
    });
  }

  async create(input: User): Promise<void> {
    const dbUser = this.mapper.toPersistence(input);
    // ... persist to database
  }
}
```

**Key Points:**
- Repositories extend `BaseRepository` for Unit of Work support
- They use `queryBuilder()` which respects transactions
- They use persistence mappers to convert between domain and database
- They handle transactions via Unit of Work

### Persistence Mappers

Persistence mappers convert between domain objects and database models.

**Example: `UserPersistenceMapper`**

```typescript
// src/infra/mappers/UserPersistenceMapper.ts
export class UserPersistenceMapper {
  toPersistence(user: User): UserPersistence {
    return {
      user: {
        id: user.id.value,
        first_name: user.props.firstName.value,
        // ... map domain to database format
      },
      emails: user.props.emails.map(email => ({
        id: email.id.value,
        email: email.email.value,
        // ...
      })),
    };
  }

  fromPersistence(data: FromPeristenceUser): User {
    return User.from({
      firstName: data.user.first_name,
      // ... map database to domain format
    }, new EntityIdVO(data.user.id));
  }
}
```

---

## Dependency Injection

This project uses **Inversify** for dependency injection. Configuration is centralized in `src/infra/di/`.

### Container Setup

```typescript
// src/infra/di/container.ts
export const container = new Container();

// Event Bus
container.bind<EventBus>(TYPES.EventBus)
  .toDynamicValue(() => new RabbitMQEventBus(...))
  .inSingletonScope();

// Database
container.bind(Kysely<DatabaseSchema>).toConstantValue(db);

// Configure all dependencies
configureProviders(container);
configureMappers(container);
configureRepositories(container);
configureUseCases(container);
configureControllers(container);
configureEventHandlers(container);
```

### Configuration Files

Each layer has a configuration function:

- `configureRepositories()` - Repository bindings
- `configureUseCases()` - Use Case bindings
- `configureControllers()` - Controller bindings
- `configureMappers()` - Mapper bindings
- `configureProviders()` - Provider bindings
- `configureEventHandlers()` - Event handler bindings
- `configureServices()` - Service bindings

**Example:**

```typescript
// src/infra/di/usecases.ts
export function configureUseCases(container: Container): void {
  container.bind(CreateUserUseCase).toSelf().inTransientScope();
  container.bind(FindUserByIdUseCase).toSelf().inTransientScope();
}
```

### Scopes

- **Singleton**: One instance for the application lifetime (e.g., EventBus)
- **Transient**: New instance per request (e.g., Use Cases, Repositories)

---

## Adding New Features

Follow these steps to add a new feature:

### 1. Define Domain Model

**Create Aggregate:**

```typescript
// src/domain/aggregates/Product.ts
export class Product extends AggregateRoot<ProductProps> {
  static create(props: PrimitiveProductProps): Product {
    return Product.from(props);
  }

  // Business logic methods
  public updatePrice(newPrice: MoneyVO): void {
    // Enforce business rules
    this.props.price = newPrice;
    this.props.updatedAt = new RequiredDateVO(new Date());
  }
}
```

**Create Repository Interface:**

```typescript
// src/domain/repositories/ProductRepository.ts
export interface ProductRepository extends UowEntitiesRepository<Product> {
  findById(query: FindEntityById): Promise<Product | null>;
  findBySku(query: { sku: string }): Promise<Product | null>;
}
```

### 2. Create Use Case

```typescript
// src/app/usecases/CreateProductUseCase.ts
@injectable()
export class CreateProductUseCase implements UseCase<CreateProductRequest, ProductResponse> {
  constructor(
    @inject(TYPES.ProductRepository) private productRepository: ProductRepository,
    @inject(TYPES.EventBus) private eventBus: EventBus,
    @inject(TYPES.UnitOfWork) private uow: UnityOfWork,
  ) {}

  async execute(input: CreateProductRequest): Promise<ProductResponse> {
    await this.uow.start([this.productRepository]);

    const product = Product.create(input.props);
    
    this.uow.registerNew(product);
    await this.uow.commit();
    await this.eventBus.publish(product.raisedEvents);

    return new ProductResponseMapper().toResponse({ product });
  }
}
```

### 3. Create DTOs

```typescript
// src/app/dtos/inputs/CreateProductInput.ts
export const CreateProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string(),
  price: z.number().positive(),
});

export class CreateProductRequest extends RequestDto<CreateProductDTO> {
  constructor(input: CreateProductDTO) {
    super(input, CreateProductSchema);
  }
}
```

### 4. Implement Repository

```typescript
// src/infra/database/kysely/KyselyProductRepository.ts
@injectable()
export class KyselyProductRepository
  extends BaseRepository<KyselyTransaction, Kysely<DatabaseSchema>>
  implements ProductRepository
{
  async findById(input: FindEntityById): Promise<Product | null> {
    // Implementation
  }
}
```

### 5. Create Controller

```typescript
// src/infra/controllers/ProductController.ts
@injectable()
export class ProductController extends FastifyController {
  constructor(
    @inject(CreateProductUseCase) private createProductUseCase: CreateProductUseCase,
    @inject(AuthMiddlewareBuilder) authMiddleware: AuthMiddlewareBuilder,
  ) {
    super(authMiddleware);
  }

  @ApiTag("Products")
  @Route("post", "/products")
  async create(req: AuthFastifyRequest<{ Body: CreateProductDTO }>, reply: FastifyReply) {
    const request = new CreateProductRequest(req.body);
    return reply.send(await this.createProductUseCase.execute(request)).status(200);
  }
}
```

### 6. Configure Dependencies

```typescript
// src/infra/di/usecases.ts
export function configureUseCases(container: Container): void {
  container.bind(CreateProductUseCase).toSelf().inTransientScope();
}

// src/infra/di/repositories.ts
export function configureRepositories(container: Container): void {
  container.bind<ProductRepository>(TYPES.ProductRepository)
    .to(KyselyProductRepository)
    .inTransientScope();
}

// src/infra/di/controllers.ts
export function configureControllers(container: Container): void {
  container.bind(ProductController).toSelf().inTransientScope();
}
```

### 7. Register Controller

```typescript
// src/infra/server/index.ts
.withControllers(UsersController, HealthController, ProductController)
```

### 8. Add Database Schema

```prisma
// src/infra/database/prisma/schema.prisma
model Product {
  id        String   @id
  name      String
  sku       String   @unique
  price     Decimal
  created_at DateTime
  updated_at DateTime

  @@map("products")
}
```

Run migration:
```bash
pnpm migrate
```

---

## Testing

### Unit Tests

Test domain logic in isolation:

```typescript
// src/app/usecases/CreateUserUseCase.spec.ts
describe("CreateUserUseCase", () => {
  it("should create a user", async () => {
    // Arrange
    const mockRepository = createMockRepository();
    const useCase = new CreateUserUseCase(mockRepository, ...);

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result).toBeDefined();
  });
});
```

### Integration Tests

Test use cases with real repositories (using test database).

---

## Database & Migrations

### Prisma Schema

Define database schema in `src/infra/database/prisma/schema.prisma`:

```prisma
model User {
  id String @id
  first_name String
  // ...
  EmailAddress EmailAddress[]

  @@map("users")
}
```

### Migrations

**Create migration:**
```bash
pnpm migrate
```

**Apply in production:**
```bash
pnpm migrate:prod
```

### Kysely Types

Kysely types are generated from Prisma schema. After migrate and they will generate automatically.

---

## Events & Event Handlers

### Domain Events

Aggregates raise domain events for significant occurrences:

```typescript
// In aggregate
this.raiseEvent(new UserCreatedEvent({
  userId: this.id.value,
}));
```

### Event Handlers

Event handlers process domain events:

```typescript
// src/app/events/UserCreatedEventHandler.ts
@injectable()
export class UserCreatedEventHandler implements EventHandler<UserCreatedEvent> {
  async handle(event: UserCreatedEvent): Promise<void> {
    // Handle event (e.g., send email, update cache)
  }
}
```

### Event Setup

Register event handlers:

```typescript
// src/infra/events/index.ts
export const setupEvents = async (eventBus: EventBus) => {
  await eventBus.connect();

  eventBus.subscribe(
    UserCreatedEvent.eventName(),
    createHandlerScope(diSettings, TYPES.UserCreatedEventHandler),
  );
};
```

**Key Points:**
- Events are published after Unit of Work commits
- Event handlers run asynchronously
- Handlers have their own Unit of Work scope

---

## Best Practices

### 1. Domain Layer

- ✅ **DO**: Put business logic in aggregates/entities
- ✅ **DO**: Use value objects for validation
- ✅ **DO**: Raise domain events for significant occurrences
- ❌ **DON'T**: Import from `app/` or `infra/`
- ❌ **DON'T**: Use database types in domain

### 2. Application Layer

- ✅ **DO**: Keep use cases focused and single-purpose
- ✅ **DO**: Use Unit of Work for transactions
- ✅ **DO**: Publish events after commit
- ✅ **DO**: Return DTOs, not domain objects
- ❌ **DON'T**: Put business logic in use cases
- ❌ **DON'T**: Import from `infra/` directly (use DI)

### 3. Infrastructure Layer

- ✅ **DO**: Implement domain interfaces
- ✅ **DO**: Use mappers for transformations
- ✅ **DO**: Handle technical concerns (HTTP, database)
- ❌ **DON'T**: Put business logic here

### 4. General

- ✅ **DO**: Use dependency injection
- ✅ **DO**: Write tests for domain logic
- ✅ **DO**: Keep layers decoupled
- ✅ **DO**: Use TypeScript types strictly
- ❌ **DON'T**: Skip validation
- ❌ **DON'T**: Mix concerns across layers

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10.10.0+
- PostgreSQL
- RabbitMQ

### Setup

1. **Clone and install:**
```bash
git clone <repository>
cd mars-server-template
pnpm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Setup database:**
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Run migrations
pnpm migrate
```

4. **Start RabbitMQ:**
```bash
docker-compose up -d rabbitmq
```

5. **Run development server:**
```bash
pnpm dev
```

6. **Access API documentation:**
```
http://localhost:3012/documentation
```

### Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm lint` - Lint code
- `pnpm typecheck` - Type check without emitting
- `pnpm migrate` - Create and run migrations (dev)
- `pnpm migrate:prod` - Run migrations (production)

---

## Architecture Benefits

This architecture provides:

1. **Testability**: Domain logic can be tested without infrastructure
2. **Maintainability**: Clear separation of concerns
3. **Flexibility**: Easy to swap implementations
4. **Scalability**: Event-driven architecture supports growth
5. **Type Safety**: End-to-end type safety with TypeScript
6. **Business Focus**: Domain logic is central and clear

---

## Further Reading

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Martin Fowler's Enterprise Patterns](https://martinfowler.com/eaaCatalog/)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Unit of Work Pattern](https://martinfowler.com/eaaCatalog/unitOfWork.html)

---

## Support

For questions or issues, please contact the development team or create an issue in the repository.