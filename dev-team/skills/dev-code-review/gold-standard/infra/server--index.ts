import { type EventBus } from "@v4-company/mars-api/core";
import { tracer } from "@v4-company/mars-api/infra";
import { FastifyServerBuilder } from "@v4-company/mars-api/server";

import "reflect-metadata";

import { TYPES } from "../../app/dtos/types.ts";
import { container } from "../di/container.ts";
import { HealthController } from "../controllers/HealthController.ts";
import { setupEvents } from "../events/index.ts";
import { UsersController } from "../controllers/UserController.ts";
import { AdminController } from "../controllers/AdminController.ts";
import { OrganizationController } from "../controllers/OrganizationController.ts";
import { EnterpriseController } from "../controllers/EnterpriseController.ts";
import { ApplicationController } from "../controllers/ApplicationController.ts";
import { PermissionController } from "../controllers/PermissionController.ts";
import { RoleController } from "../controllers/RoleController.ts";
import { AuthController } from "../controllers/AuthController.ts";
import { ServiceTokenController } from "../controllers/ServiceTokenController.ts";
import { OAuthClientController } from "../controllers/OAuthClientController.ts";

async function main() {
  await FastifyServerBuilder.create()
    .withConfig({
      port: process.env.PORT ? Number(process.env.PORT) : 3012,
    })
    .withContainer(container)
    .withUow({
      key: TYPES.UnitOfWork,
    })
    .withSwagger({
      enabled: true,
      routePrefix: "/documentation",
    })
    .withCors({
      origin: "*",
      exposedHeaders: ["Authorization", "Content-Type"],
      allowedHeaders: ["Authorization", "Content-Type"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    })
    .withMultipart({
      enabled: true,
      limits: {
        fileSize: 200 * 1024 * 1024, // 200 MB
      },
    })
    .withControllers(
      HealthController,
      AuthController,
      UsersController,
      RoleController,
      OrganizationController,
      EnterpriseController,
      ApplicationController,
      PermissionController,
      ServiceTokenController,
      OAuthClientController,
      AdminController,
    )

    .withTracing(tracer)
    .buildAndListen();

  await setupEvents(container.get<EventBus>(TYPES.EventBus));
}

main();
