# Gold Standard - Referencia Arquitetural

Arquivos extraidos do `mars-identity` como referencia do padrao arquitetural que todos os repositorios devem seguir. Usado pela skill `dev-codereviewer` como base de comparacao.

Complementa o `mars-server-template.md` que documenta a teoria. Aqui estao os **exemplos reais** de cada conceito.

## Naming dos arquivos

Formato: `tipo--NomeOriginal.ext`

O prefixo antes de `--` indica o conceito arquitetural. Isso permite que a skill referencie rapidamente "o gold standard de aggregate" ou "o gold standard de controller".

## Domain Layer (`domain/`)

| Arquivo | Conceito | O que demonstra |
|---------|----------|----------------|
| `aggregate--User.ts` | Aggregate Root | Factory methods (create/from), domain events, business logic, composicao com entities |
| `entity--EmailAddress.ts` | Entity | Constructor privado, create/from pattern, Value Objects |
| `value-object--AuthProviderVO.ts` | Value Object (enum) | Imutavel, validacao no construtor, type-safe enum |
| `value-object--MetadataVO.ts` | Value Object (behavior) | Metodos has/get/isEmpty em VO |
| `repository--UserRepository.ts` | Repository Interface | Extends UowEntitiesRepository, queries com linguagem de dominio |
| `provider--TokenProvider.ts` | Provider Interface | Abstracao de servico externo, schemas Zod, zero vazamento |

## Application Layer (`app/`)

| Arquivo | Conceito | O que demonstra |
|---------|----------|----------------|
| `usecase--SignUpUseCase.ts` | UseCase | UoW start -> logica -> commit -> publish events -> return DTO |
| `service--CreateUserMembershipService.ts` | Service | Logica reusavel, nested UoW (isUowPrevStarted), composavel |
| `event-handler--UserCreatedEventHandler.ts` | Event Handler | Idempotente, delega pra service, trata erros gracefully |
| `dto-input--SignInInput.ts` | DTO Input | Zod schema + SchemaOpenApi + RequestDto |
| `response-mapper--UserResponseMapper.ts` | Response Mapper | Domain -> API, nested objects, contexto opcional |
| `exception--pattern.md` | Exceptions | 3 tiers: NotFoundException, BadRequestException, HttpException |
| `di-symbols--types.ts` | DI Symbols | Symbols centralizados com naming por categoria |

## Infrastructure Layer (`infra/`)

| Arquivo | Conceito | O que demonstra |
|---------|----------|----------------|
| `controller--AuthController.ts` | Controller | Decorators, auth middleware, request -> DTO -> usecase |
| `kysely-repo--KyselyUserRepository.ts` | Repository Impl | BaseRepository, queryBuilder, subselects, transactions |
| `persistence-mapper--UserPersistenceMapper.ts` | Persistence Mapper | Bidirecional toPersistence/fromPersistence |
| `provider--JoseTokenProvider.ts` | Provider Impl | JWT, validacao de secrets, metodos focados |
| `di--container.ts` | DI Container | Env var validation, binding order, scopes |
| `di--repositories.ts` | DI Config | Binding de repositories |
| `di--services.ts` | DI Config | Binding de services |
| `di--usecases.ts` | DI Config | Binding de usecases |
| `di--controllers.ts` | DI Config | Binding de controllers |
| `di--mappers.ts` | DI Config | Binding de mappers |
| `di--providers.ts` | DI Config | Binding de providers |
| `di--events.ts` | DI Config | Binding de event handlers |
| `events--index.ts` | Event Bus Setup | RabbitMQ, createHandlerScope, subscriptions |
| `server--index.ts` | Server Bootstrap | Builder chain, CORS, Swagger, tracing |
| `prisma--schema.prisma` | Database Schema | Models, indexes, constraints, soft deletes |

## Como a skill usa esses arquivos

1. Le o diff do dev
2. Identifica quais conceitos estao sendo tocados (aggregate? controller? handler?)
3. Compara contra o arquivo gold standard correspondente
4. Reporta divergencias como BLOCK ou WARNING
