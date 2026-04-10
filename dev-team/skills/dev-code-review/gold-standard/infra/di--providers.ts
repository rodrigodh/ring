import { type Container } from "inversify";

import { TYPES } from "../../app/dtos/types.ts";
import { type AuthProvider } from "../../domain/providers/AuthProvider.ts";
import { WorkOsAuthProvider } from "../providers/WorkOsAuthProvider.ts";
import { type TokenProvider } from "../../domain/providers/TokenProvider.ts";
import { JoseTokenProvider } from "../providers/JoseTokenProvider.ts";

export function configureProviders(container: Container): void {
  container
    .bind<AuthProvider>(TYPES.AuthProvider)
    .toDynamicValue(() => new WorkOsAuthProvider())
    .inSingletonScope();

  container
    .bind<TokenProvider>(TYPES.TokenProvider)
    .toDynamicValue(() => new JoseTokenProvider())
    .inSingletonScope();
}
