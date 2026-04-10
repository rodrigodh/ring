import { type Container } from "inversify";
import { SignUpUseCase } from "../../app/usecases/SignUpUseCase.ts";
import { FindUserByIdUseCase } from "../../app/usecases/FindUserByIdUseCase.ts";
import { CreateOrganizationUseCase } from "../../app/usecases/CreateOrganizationUseCase.ts";
import { FindOrganizationBySlugUseCase } from "../../app/usecases/FindOrganizationBySlugUseCase.ts";
import { CreateEnterpriseUseCase } from "../../app/usecases/CreateEnterpriseUseCase.ts";
import { CreateApplicationUseCase } from "../../app/usecases/CreateApplicationUseCase.ts";
import { CreateUserMembershipUseCase } from "../../app/usecases/CreateUserMembershipUseCase.ts";
import { CreateRoleUseCase } from "../../app/usecases/CreateRoleUseCase.ts";
import { CreatePermissionUseCase } from "../../app/usecases/CreatePermissionUseCase.ts";
import { AttachPermissionToRoleUseCase } from "../../app/usecases/AttachPermissionToRoleUseCase.ts";
import { DetachPermissionFromRoleUseCase } from "../../app/usecases/DetachPermissionFromRoleUseCase.ts";
import { ListRolesUseCase } from "../../app/usecases/ListRolesUseCase.ts";
import { ListPermissionsUseCase } from "../../app/usecases/ListPermissionsUseCase.ts";
import { ListUsersByOrganizationIdUseCase } from "../../app/usecases/ListUsersByOrganizationIdUseCase.ts";
import { SignInUseCase } from "../../app/usecases/SignInUseCase.ts";
import { RefreshTokenUseCase } from "../../app/usecases/RefreshTokenUseCase.ts";
import { ForceVerifyEmailUseCase } from "../../app/usecases/ForceVerifyEmailUseCase.ts";
import { RequestEmailVerificationUseCase } from "../../app/usecases/RequestEmailVerificationUseCase.ts";
import { VerifyEmailUseCase } from "../../app/usecases/VerifyEmailUseCase.ts";
import { RequestPasswordResetUseCase } from "../../app/usecases/RequestPasswordResetUseCase.ts";
import { ConfirmPasswordResetUseCase } from "../../app/usecases/ConfirmPasswordResetUseCase.ts";
import { IntrospectUseCase } from "../../app/usecases/IntrospectUseCase.ts";
import { GetAuthorizationUrlUseCase } from "../../app/usecases/GetAuthorizationUrlUseCase.ts";
import { AuthCallbackUseCase } from "../../app/usecases/AuthCallbackUseCase.ts";
import { CreateServiceTokenUseCase } from "../../app/usecases/CreateServiceTokenUseCase.ts";
import { FindServiceTokensByOrganizationIdUseCase } from "../../app/usecases/FindServiceTokensByOrganizationIdUseCase.ts";
import { FindServiceTokenByClientIdUseCase } from "../../app/usecases/FindServiceTokenByClientIdUseCase.ts";
import { DeactivateServiceTokenUseCase } from "../../app/usecases/DeactivateServiceTokenUseCase.ts";
import { UpdateServiceTokenRoleUseCase } from "../../app/usecases/UpdateServiceTokenRoleUseCase.ts";
import { UpdateMembershipRoleUseCase } from "../../app/usecases/UpdateMembershipRoleUseCase.ts";
import { RemoveMembershipUseCase } from "../../app/usecases/RemoveMembershipUseCase.ts";
import { CompareEmailAddressesUseCase } from "../../app/usecases/CompareEmailAddressesUseCase.ts";
import { MigrateLegacyUsersUseCase } from "../../app/usecases/MigrateLegacyUsersUseCase.ts";
import { MigrateLegacyOrganizationsUseCase } from "../../app/usecases/MigrateLegacyOrganizationsUseCase.ts";
import { MigrateV4MarketingOrganizationsUseCase } from "../../app/usecases/MigrateV4MarketingOrganizationsUseCase.ts";
import { MigrateLegacyMembershipsUseCase } from "../../app/usecases/MigrateLegacyMembershipsUseCase.ts";
import { FindServiceTokenByIdUseCase } from "../../app/usecases/FindServiceTokenByIdUseCase.ts";
import { CreateOAuthClientUseCase } from "../../app/usecases/CreateOAuthClientUseCase.ts";
import { ListOrganizationsUseCase } from "../../app/usecases/ListOrganizationsUseCase.ts";
import { GetOrganizationDefaultByEnterpriseIdUseCase } from "../../app/usecases/GetOrganizationDefaultByEnterpriseIdUseCase.ts";
import { CreateMissingPersonalOrganizationsUseCase } from "../../app/usecases/CreateMissingPersonalOrganizationsUseCase.ts";
import { FindUserByEmailUseCase } from "../../app/usecases/FindUserByEmailUseCase.ts";

export function configureUseCases(container: Container): void {
  container.bind(SignUpUseCase).toSelf().inTransientScope();
  container.bind(FindUserByIdUseCase).toSelf().inTransientScope();
  container.bind(CreateOrganizationUseCase).toSelf().inTransientScope();
  container.bind(FindOrganizationBySlugUseCase).toSelf().inTransientScope();
  container.bind(CreateEnterpriseUseCase).toSelf().inTransientScope();
  container.bind(CreateApplicationUseCase).toSelf().inTransientScope();
  container.bind(CreateUserMembershipUseCase).toSelf().inTransientScope();
  container.bind(CreateRoleUseCase).toSelf().inTransientScope();
  container.bind(CreatePermissionUseCase).toSelf().inTransientScope();
  container.bind(AttachPermissionToRoleUseCase).toSelf().inTransientScope();
  container.bind(DetachPermissionFromRoleUseCase).toSelf().inTransientScope();
  container.bind(ListRolesUseCase).toSelf().inTransientScope();
  container.bind(ListPermissionsUseCase).toSelf().inTransientScope();
  container.bind(SignInUseCase).toSelf().inTransientScope();
  container.bind(RefreshTokenUseCase).toSelf().inTransientScope();
  container.bind(ForceVerifyEmailUseCase).toSelf().inTransientScope();
  container.bind(RequestEmailVerificationUseCase).toSelf().inTransientScope();
  container.bind(VerifyEmailUseCase).toSelf().inTransientScope();
  container.bind(RequestPasswordResetUseCase).toSelf().inTransientScope();
  container.bind(ConfirmPasswordResetUseCase).toSelf().inTransientScope();
  container.bind(IntrospectUseCase).toSelf().inTransientScope();
  container.bind(GetAuthorizationUrlUseCase).toSelf().inTransientScope();
  container.bind(AuthCallbackUseCase).toSelf().inTransientScope();
  container.bind(CreateServiceTokenUseCase).toSelf().inTransientScope();
  container.bind(FindServiceTokenByClientIdUseCase).toSelf().inTransientScope();
  container.bind(DeactivateServiceTokenUseCase).toSelf().inTransientScope();
  container.bind(UpdateServiceTokenRoleUseCase).toSelf().inTransientScope();
  container.bind(UpdateMembershipRoleUseCase).toSelf().inTransientScope();
  container.bind(RemoveMembershipUseCase).toSelf().inTransientScope();
  container.bind(CompareEmailAddressesUseCase).toSelf().inTransientScope();
  container.bind(MigrateLegacyUsersUseCase).toSelf().inTransientScope();
  container.bind(MigrateLegacyOrganizationsUseCase).toSelf().inTransientScope();
  container
    .bind(MigrateV4MarketingOrganizationsUseCase)
    .toSelf()
    .inTransientScope();
  container.bind(MigrateLegacyMembershipsUseCase).toSelf().inTransientScope();
  container.bind(FindServiceTokenByIdUseCase).toSelf().inTransientScope();

  container
    .bind(FindServiceTokensByOrganizationIdUseCase)
    .toSelf()
    .inTransientScope();

  container.bind(CreateOAuthClientUseCase).toSelf().inTransientScope();
  container.bind(ListOrganizationsUseCase).toSelf().inTransientScope();
  container.bind(ListUsersByOrganizationIdUseCase).toSelf().inTransientScope();
  container
    .bind(GetOrganizationDefaultByEnterpriseIdUseCase)
    .toSelf()
    .inTransientScope();
  container
    .bind(CreateMissingPersonalOrganizationsUseCase)
    .toSelf()
    .inTransientScope();
  container.bind(FindUserByEmailUseCase).toSelf().inTransientScope();
}
