import "reflect-metadata";
import { Kysely } from "kysely";
import { type EventBus, RabbitMQEventBus } from "@v4-company/mars-api/core";
import { Container } from "inversify";

import { db } from "../database/connection.ts";
import { type DB as DatabaseSchema } from "../database/kysely/types/types.ts";
import { TYPES } from "../../app/dtos/types.ts";

import { configureRepositories } from "./repositories.ts";
import { configureUseCases } from "./usecases.ts";
import { configureMappers } from "./mappers.ts";
import { configureEventHandlers } from "./events.ts";
import { configureControllers } from "./controllers.ts";
import { configureProviders } from "./providers.ts";
import { configureServices } from "./services.ts";
import {
  AuthMiddlewareBuilder,
  createAuthMiddleware,
} from "@v4-company/mars-api/identity";
import { getFrontendUrl } from "../utils/getFrontendUrl.ts";

export const container = new Container();

// Event Bus
container
  .bind<EventBus>(TYPES.EventBus)
  .toDynamicValue(() => {
    return new RabbitMQEventBus(
      process.env.RABBITMQ_URL || "",
      process.env.SERVICE_NAME || "",
    );
  })
  .inSingletonScope();

// Auth middleware
container
  .bind(AuthMiddlewareBuilder)
  .toDynamicValue(() => {
    return createAuthMiddleware(process.env.IDENTITY_URL || "");
  })
  .inSingletonScope();

// Database
container.bind(Kysely<DatabaseSchema>).toConstantValue(db);

// Encoding Secret
const encodingSecret = process.env.ENCODING_SECRET;
if (!encodingSecret) {
  throw new Error("Panic, Encoding secret is not set, set ENCODING_SECRET env");
}
container.bind<string>(TYPES.EncodingSecret).toConstantValue(encodingSecret);

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("Panic, JWT secret is not set, set JWT_SECRET env");
}
container.bind<string>(TYPES.JWTSecret).toConstantValue(jwtSecret);

// Identity Application ID
const identityApplicationId = process.env.IDENTITY_APPLICATION_ID;
if (!identityApplicationId) {
  throw new Error(
    "Panic, Identity application id is not set, set IDENTITY_APPLICATION_ID env",
  );
}
container
  .bind<string>(TYPES.IdentityApplicationId)
  .toConstantValue(identityApplicationId);

// Identity URL
const identityUrl = process.env.IDENTITY_URL;
if (!identityUrl) {
  throw new Error("Panic, Identity URL is not set, set IDENTITY_URL env");
}
container.bind<string>(TYPES.IdentityUrl).toConstantValue(identityUrl);

// Public URL
const publicUrl = process.env.PUBLIC_URL;
if (!publicUrl) {
  throw new Error("Panic, Public URL is not set, set PUBLIC_URL env");
}
container.bind<string>(TYPES.PublicUrl).toConstantValue(publicUrl);

const frontendUrl = getFrontendUrl(publicUrl);
container.bind<string>(TYPES.FrontendUrl).toConstantValue(frontendUrl);

const mktlabApplicationId = process.env.MKTLAB_APPLICATION_ID;
if (!mktlabApplicationId) {
  throw new Error(
    "Panic, Mktlab application id is not set, set MKTLAB_APPLICATION_ID env",
  );
}
container
  .bind<string>(TYPES.MktlabApplicationId)
  .toConstantValue(mktlabApplicationId);

// Default Role ID
const defaultRoleId = process.env.DEFAULT_ROLE_ID_MKTLAB;
if (!defaultRoleId) {
  throw new Error(
    "Panic, Default role id is not set, set DEFAULT_ROLE_ID_MKTLAB env",
  );
}
container.bind<string>(TYPES.DefaultRoleId).toConstantValue(defaultRoleId);

// Auto Verify Email
container
  .bind<boolean>(TYPES.AutoVerifyEmail)
  .toConstantValue(process.env.AUTO_VERIFY_EMAIL === "true");

// Configure all dependencies
configureProviders(container);
configureMappers(container);
configureRepositories(container);
configureServices(container);
configureUseCases(container);
configureControllers(container);
configureEventHandlers(container);
