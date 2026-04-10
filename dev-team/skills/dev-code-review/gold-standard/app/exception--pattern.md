# Exception Pattern - Gold Standard

Exceptions seguem 3 tiers baseados no HTTP status code. Todas extendem classes base de `@v4-company/mars-api/core`.

## Tier 1: NotFoundException (HTTP 404)

Recurso nao encontrado. Padrao mais comum.

```typescript
import { NotFoundException } from "@v4-company/mars-api/core";

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super([{ code: "USER_NOT_FOUND", message: "User not found" }]);
  }
}
```

## Tier 2: BadRequestException (HTTP 400)

Input invalido ou regra de negocio violada.

```typescript
import { BadRequestException } from "@v4-company/mars-api/core";

export class InvalidCredentialsException extends BadRequestException {
  constructor() {
    super([
      {
        code: "INVALID_CREDENTIALS",
        message: "Invalid credentials",
      },
    ]);
  }
}
```

## Tier 3: HttpException (HTTP custom)

Para status codes especificos (401, 403, etc). Aceita mensagem customizada.

```typescript
import { HttpException } from "@v4-company/mars-api/core";

export class UnauthorizedAccessException extends HttpException {
  constructor(customMessage?: string) {
    const errors = [
      {
        code: "UNAUTHORIZED_ACCESS",
        message: customMessage || "Unauthorized access",
      },
    ];

    super(errors, 401);
  }
}
```

## Regras

- Naming: `[Descricao]Exception` (PascalCase)
- Code: `UPPER_SNAKE_CASE` descritivo
- Sempre array de errors (mesmo com 1 erro) — consistencia na API
- Mensagem em ingles
- Usar Tier 1 ou 2 quando possivel. Tier 3 so para status codes fora do 400/404
