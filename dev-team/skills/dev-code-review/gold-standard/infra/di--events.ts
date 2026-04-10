import { type Container } from "inversify";

import { UserCreatedEventHandler } from "../../app/events/UserCreatedEventHandler.ts";
import { EmailVerifiedEventHandler } from "../../app/events/EmailVerifiedEventHandler.ts";
import { EnterpriseCreatedEventHandler } from "../../app/events/EnterpriseCreatedEventHandler.ts";
import { LegacyUserMigrationDispatchedEventHandler } from "../../app/events/LegacyUserMigrationDispatchedEventHandler.ts";
import { LegacyOrganizationMigrationDispatchedEventHandler } from "../../app/events/LegacyOrganizationMigrationDispatchedEventHandler.ts";
import { V4MarketingOrganizationMigrationDispatchedEventHandler } from "../../app/events/V4MarketingOrganizationMigrationDispatchedEventHandler.ts";
import { LegacyMembershipMigrationDispatchedEventHandler } from "../../app/events/LegacyMembershipMigrationDispatchedEventHandler.ts";
import { EmployeeInvitedEventHandler } from "../../app/events/EmployeeInvitedEventHandler.ts";
import { TYPES } from "../../app/dtos/types.ts";
import { V4MarketingServiceTokenDeactivatedEventHandler } from "../../app/events/V4MarketingServiceTokenDeactivatedEventHandler.ts";
import { V4MarketingServiceTokenCreatedEventHandler } from "../../app/events/V4MarketingServiceTokenCreatedEventHandler.ts";

export function configureEventHandlers(container: Container): void {
  container
    .bind<EmailVerifiedEventHandler>(TYPES.EmailVerifiedEventHandler)
    .to(EmailVerifiedEventHandler)
    .inTransientScope();

  container
    .bind<UserCreatedEventHandler>(TYPES.UserCreatedEventHandler)
    .to(UserCreatedEventHandler)
    .inTransientScope();

  container
    .bind<EnterpriseCreatedEventHandler>(TYPES.EnterpriseCreatedEventHandler)
    .to(EnterpriseCreatedEventHandler)
    .inTransientScope();

  container
    .bind<V4MarketingServiceTokenCreatedEventHandler>(
      TYPES.V4MarketingServiceTokenCreatedEventHandler,
    )
    .to(V4MarketingServiceTokenCreatedEventHandler);

  container
    .bind<LegacyUserMigrationDispatchedEventHandler>(
      TYPES.LegacyUserMigrationDispatchedEventHandler,
    )
    .to(LegacyUserMigrationDispatchedEventHandler)
    .inTransientScope();

  container
    .bind<LegacyOrganizationMigrationDispatchedEventHandler>(
      TYPES.LegacyOrganizationMigrationDispatchedEventHandler,
    )
    .to(LegacyOrganizationMigrationDispatchedEventHandler)
    .inTransientScope();

  container
    .bind<V4MarketingOrganizationMigrationDispatchedEventHandler>(
      TYPES.V4MarketingOrganizationMigrationDispatchedEventHandler,
    )
    .to(V4MarketingOrganizationMigrationDispatchedEventHandler)
    .inTransientScope();

  container
    .bind<V4MarketingServiceTokenDeactivatedEventHandler>(
      TYPES.V4MarketingServiceTokenDeactivatedEventHandler,
    )
    .to(V4MarketingServiceTokenDeactivatedEventHandler)
    .inTransientScope();

  container
    .bind<LegacyMembershipMigrationDispatchedEventHandler>(
      TYPES.LegacyMembershipMigrationDispatchedEventHandler,
    )
    .to(LegacyMembershipMigrationDispatchedEventHandler)
    .inTransientScope();

  container
    .bind<EmployeeInvitedEventHandler>(TYPES.EmployeeInvitedEventHandler)
    .to(EmployeeInvitedEventHandler)
    .inTransientScope();
}
