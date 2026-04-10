import { type Container } from "inversify";
import { UserPersistenceMapper } from "../mappers/UserPersistenceMapper.ts";
import { OrganizationPersistenceMapper } from "../mappers/OrganizationPersistenceMapper.ts";
import { EnterprisePersistenceMapper } from "../mappers/EnterprisePersistenceMapper.ts";
import { ApplicationPersistenceMapper } from "../mappers/ApplicationPersistenceMapper.ts";
import { RolePersistenceMapper } from "../mappers/RolePersistenceMapper.ts";
import { PermissionPersistenceMapper } from "../mappers/PermissionPersistenceMapper.ts";
import { SessionPersistenceMapper } from "../mappers/SessionPersistenceMapper.ts";
import { ServiceTokenPersistenceMapper } from "../mappers/ServiceTokenPersistenceMapper.ts";
import { EmailVerificationPersistenceMapper } from "../mappers/EmailVerificationPersistenceMapper.ts";
import { PasswordResetPersistenceMapper } from "../mappers/PasswordResetPersistenceMapper.ts";
import { EmailAddressPersistenceMapper } from "../mappers/EmailAddressPersistenceMapper.ts";
import { CodeChallengePersistenceMapper } from "../mappers/CodeChallengePersistenceMapper.ts";
import { OAuthClientPersistenceMapper } from "../mappers/OAuthClientPersistenceMapper.ts";
import { InvitePersistenceMapper } from "../mappers/InvitePersistenceMapper.ts";

export function configureMappers(container: Container): void {
  container.bind(UserPersistenceMapper).toSelf();
  container.bind(OrganizationPersistenceMapper).toSelf();
  container.bind(EnterprisePersistenceMapper).toSelf();
  container.bind(ApplicationPersistenceMapper).toSelf();
  container.bind(RolePersistenceMapper).toSelf();
  container.bind(PermissionPersistenceMapper).toSelf();
  container.bind(SessionPersistenceMapper).toSelf();
  container.bind(ServiceTokenPersistenceMapper).toSelf();
  container.bind(EmailVerificationPersistenceMapper).toSelf();
  container.bind(PasswordResetPersistenceMapper).toSelf();
  container.bind(EmailAddressPersistenceMapper).toSelf();
  container.bind(CodeChallengePersistenceMapper).toSelf();
  container.bind(OAuthClientPersistenceMapper).toSelf();
  container.bind(InvitePersistenceMapper).toSelf();
}
