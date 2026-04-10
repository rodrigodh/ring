import { type Container } from "inversify";
import { HealthController } from "../controllers/HealthController.ts";
import { UsersController } from "../controllers/UserController.ts";
import { AdminController } from "../controllers/AdminController.ts";
import { OrganizationController } from "../controllers/OrganizationController.ts";
import { EnterpriseController } from "../controllers/EnterpriseController.ts";
import { ApplicationController } from "../controllers/ApplicationController.ts";
import { RoleController } from "../controllers/RoleController.ts";
import { PermissionController } from "../controllers/PermissionController.ts";
import { AuthController } from "../controllers/AuthController.ts";
import { ServiceTokenController } from "../controllers/ServiceTokenController.ts";
import { OAuthClientController } from "../controllers/OAuthClientController.ts";

export function configureControllers(container: Container): void {
  container.bind(HealthController).toSelf();
  container.bind(UsersController).toSelf().inTransientScope();
  container.bind(AdminController).toSelf().inTransientScope();
  container.bind(OrganizationController).toSelf().inTransientScope();
  container.bind(EnterpriseController).toSelf().inTransientScope();
  container.bind(ApplicationController).toSelf().inTransientScope();
  container.bind(RoleController).toSelf().inTransientScope();
  container.bind(PermissionController).toSelf().inTransientScope();
  container.bind(AuthController).toSelf().inTransientScope();
  container.bind(ServiceTokenController).toSelf().inTransientScope();
  container.bind(OAuthClientController).toSelf().inTransientScope();
}
