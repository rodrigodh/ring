import { type Container } from "inversify";
import { KyselyUnitOfWork, type UnityOfWork } from "@v4-company/mars-api/core";
import { TYPES } from "../../app/dtos/types.ts";
import { type UserRepository } from "../../domain/repositories/UserRepository.ts";
import { type OrganizationRepository } from "../../domain/repositories/OrganizationRepository.ts";
import { type EnterpriseRepository } from "../../domain/repositories/EnterpriseRepository.ts";
import { type ApplicationRepository } from "../../domain/repositories/ApplicationRepository.ts";
import { type RoleRepository } from "../../domain/repositories/RoleRepository.ts";
import { type PermissionRepository } from "../../domain/repositories/PermissionRepository.ts";
import { type SessionRepository } from "../../domain/repositories/SessionRepository.ts";
import { type ServiceTokenRepository } from "../../domain/repositories/ServiceTokenRepository.ts";
import { type EmailVerificationRepository } from "../../domain/repositories/EmailVerificationRepository.ts";
import { type PasswordResetRepository } from "../../domain/repositories/PasswordResetRepository.ts";
import { type EmailAddressRepository } from "../../domain/repositories/EmailAddressRepository.ts";
import { KyselyUserRepository } from "../database/kysely/KyselyUserRepository.ts";
import { KyselyOrganizationRepository } from "../database/kysely/KyselyOrganizationRepository.ts";
import { KyselyEnterpriseRepository } from "../database/kysely/KyselyEnterpriseRepository.ts";
import { KyselyApplicationRepository } from "../database/kysely/KyselyApplicationRepository.ts";
import { KyselyRoleRepository } from "../database/kysely/KyselyRoleRepository.ts";
import { KyselyPermissionRepository } from "../database/kysely/KyselyPermissionRepository.ts";
import { KyselySessionRepository } from "../database/kysely/KyselySessionRepository.ts";
import { KyselyServiceTokenRepository } from "../database/kysely/KyselyServiceTokenRepository.ts";
import { KyselyEmailVerificationRepository } from "../database/kysely/KyselyEmailVerificationRepository.ts";
import { KyselyPasswordResetRepository } from "../database/kysely/KyselyPasswordResetRepository.ts";
import { KyselyEmailAddressRepository } from "../database/kysely/KyselyEmailAddressRepository.ts";
import { Kysely } from "kysely";
import { type DB } from "../database/kysely/types/types.ts";
import { type CodeChallengeRepository } from "../../domain/repositories/CodeChallengeRepository.ts";
import { KyselyCodeChallengeRepository } from "../database/kysely/KyselyCodeChallengeRepository.ts";
import { type OAuthClientRepository } from "../../domain/repositories/OAuthClientRepository.ts";
import { KyselyOAuthClientRepository } from "../database/kysely/KyselyOAuthClientRepository.ts";
import { type InviteRepository } from "../../domain/repositories/InviteRepository.ts";
import { KyselyInviteRepository } from "../database/kysely/KyselyInviteRepository.ts";

export function configureRepositories(container: Container): void {
  container
    .bind<UnityOfWork>(TYPES.UnitOfWork)
    .toDynamicValue(
      () => new KyselyUnitOfWork(container.get<Kysely<DB>>(Kysely<DB>)),
    )
    .inTransientScope();

  container
    .bind<UserRepository>(TYPES.UserRepository)
    .to(KyselyUserRepository)
    .inTransientScope();

  container
    .bind<OrganizationRepository>(TYPES.OrganizationRepository)
    .to(KyselyOrganizationRepository)
    .inTransientScope();

  container
    .bind<EnterpriseRepository>(TYPES.EnterpriseRepository)
    .to(KyselyEnterpriseRepository)
    .inTransientScope();

  container
    .bind<ApplicationRepository>(TYPES.ApplicationRepository)
    .to(KyselyApplicationRepository)
    .inTransientScope();

  container
    .bind<RoleRepository>(TYPES.RoleRepository)
    .to(KyselyRoleRepository)
    .inTransientScope();

  container
    .bind<PermissionRepository>(TYPES.PermissionRepository)
    .to(KyselyPermissionRepository)
    .inTransientScope();

  container
    .bind<SessionRepository>(TYPES.SessionRepository)
    .to(KyselySessionRepository)
    .inTransientScope();

  container
    .bind<ServiceTokenRepository>(TYPES.ServiceTokenRepository)
    .to(KyselyServiceTokenRepository)
    .inTransientScope();

  container
    .bind<EmailVerificationRepository>(TYPES.EmailVerificationRepository)
    .to(KyselyEmailVerificationRepository)
    .inTransientScope();

  container
    .bind<PasswordResetRepository>(TYPES.PasswordResetRepository)
    .to(KyselyPasswordResetRepository)
    .inTransientScope();

  container
    .bind<EmailAddressRepository>(TYPES.EmailAddressRepository)
    .to(KyselyEmailAddressRepository)
    .inTransientScope();

  container
    .bind<CodeChallengeRepository>(TYPES.CodeChallengeRepository)
    .to(KyselyCodeChallengeRepository)
    .inTransientScope();

  container
    .bind<OAuthClientRepository>(TYPES.OAuthClientRepository)
    .to(KyselyOAuthClientRepository)
    .inTransientScope();

  container
    .bind<InviteRepository>(TYPES.InviteRepository)
    .to(KyselyInviteRepository)
    .inTransientScope();
}
