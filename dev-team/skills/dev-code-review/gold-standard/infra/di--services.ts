import { type Container } from "inversify";
import { CreateUserMembershipService } from "../../app/services/CreateUserMembershipService.ts";
import { TYPES } from "../../app/dtos/types.ts";
import { CreateEmailVerificationService } from "../../app/services/CreateEmailVerificationService.ts";
import { CreatePasswordResetService } from "../../app/services/CreatePasswordResetService.ts";
import { CreatePersonalOrganizationService } from "../../app/services/CreatePersonalOrganizationService.ts";
import { CheckUserOrganizationService } from "../../app/services/CheckUserOrganizationService.ts";
import { VerifyUserMembershipService } from "../../app/services/VerifyUserMembershipService.ts";
import { FindPersonalOrganizationService } from "../../app/services/FindPersonalOrganizationService.ts";
import { CompareEmailAddressesService } from "../../app/services/CompareEmailAddressesService.ts";
import { CreateServiceTokenService } from "../../app/services/CreateServiceTokenService.ts";
import { DeactivateServiceTokenService } from "../../app/services/DeactivateServiceTokenService.ts";
import { CreateUserService } from "../../app/services/CreateUserService.ts";
import { CreateOrganizationService } from "../../app/services/CreateOrganizationService.ts";
import { CreateEnterpriseService } from "../../app/services/CreateEnterpriseService.ts";
import { CreateCodeChallengeService } from "../../app/services/CreateCodeChallengeService.ts";
import { VerifyCodeChallengeService } from "../../app/services/VerifyCodeChallengeService.ts";
import { CreateOAuthClientService } from "../../app/services/CreateOAuthClientService.ts";
import { RequireSystemAdminService } from "../../app/services/RequireSystemAdminService.ts";
import { ConsumeInviteService } from "../../app/services/ConsumeInviteService.ts";
import { CreateInviteService } from "../../app/services/CreateInviteService.ts";

export function configureServices(container: Container): void {
  container
    .bind<CreateUserMembershipService>(TYPES.CreateUserMembershipService)
    .to(CreateUserMembershipService)
    .inTransientScope();

  container
    .bind<CreateEmailVerificationService>(TYPES.CreateEmailVerificationService)
    .to(CreateEmailVerificationService)
    .inTransientScope();

  container
    .bind<CreatePasswordResetService>(TYPES.CreatePasswordResetService)
    .to(CreatePasswordResetService)
    .inTransientScope();

  container
    .bind<CreatePersonalOrganizationService>(
      TYPES.CreatePersonalOrganizationService,
    )
    .to(CreatePersonalOrganizationService)
    .inTransientScope();

  container
    .bind<CheckUserOrganizationService>(TYPES.CheckUserOrganizationService)
    .to(CheckUserOrganizationService)
    .inTransientScope();

  container
    .bind<VerifyUserMembershipService>(TYPES.VerifyUserMembershipService)
    .to(VerifyUserMembershipService)
    .inTransientScope();

  container
    .bind<FindPersonalOrganizationService>(
      TYPES.FindPersonalOrganizationService,
    )
    .to(FindPersonalOrganizationService)
    .inTransientScope();

  container
    .bind<CompareEmailAddressesService>(TYPES.CompareEmailAddressesService)
    .to(CompareEmailAddressesService)
    .inTransientScope();

  container
    .bind<CreateServiceTokenService>(TYPES.CreateServiceTokenService)
    .to(CreateServiceTokenService);

  container
    .bind<DeactivateServiceTokenService>(TYPES.DeactivateServiceTokenService)
    .to(DeactivateServiceTokenService)
    .inTransientScope();

  container
    .bind<CreateUserService>(TYPES.CreateUserService)
    .to(CreateUserService)
    .inTransientScope();

  container
    .bind<CreateOrganizationService>(TYPES.CreateOrganizationService)
    .to(CreateOrganizationService)
    .inTransientScope();

  container
    .bind<CreateEnterpriseService>(TYPES.CreateEnterpriseService)
    .to(CreateEnterpriseService)
    .inTransientScope();

  container
    .bind<CreateCodeChallengeService>(TYPES.CreateCodeChallengeService)
    .to(CreateCodeChallengeService)
    .inTransientScope();

  container
    .bind<VerifyCodeChallengeService>(TYPES.VerifyCodeChallengeService)
    .to(VerifyCodeChallengeService)
    .inTransientScope();

  container
    .bind<CreateOAuthClientService>(TYPES.CreateOAuthClientService)
    .to(CreateOAuthClientService)
    .inTransientScope();

  container
    .bind<RequireSystemAdminService>(TYPES.RequireSystemAdminService)
    .to(RequireSystemAdminService)
    .inTransientScope();

  container
    .bind<ConsumeInviteService>(TYPES.ConsumeInviteService)
    .to(ConsumeInviteService)
    .inTransientScope();

  container
    .bind<CreateInviteService>(TYPES.CreateInviteService)
    .to(CreateInviteService)
    .inTransientScope();
}
