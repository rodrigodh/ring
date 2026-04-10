import { createHandlerScope, type EventBus } from "@v4-company/mars-api/core";
import {
  EmailVerifiedEvent,
  EmployeeCreatedEvent,
  EnterpriseCreatedEvent,
  LegacyUserMigrationDispatchedEvent,
  LegacyOrganizationMigrationDispatchedEvent,
  UserCreatedEvent,
  V4MarketingServiceTokenCreatedEvent,
  V4MarketingOrganizationMigrationDispatchedEvent,
  V4MarketingServiceTokenDeactivatedEvent,
  LegacyMembershipMigrationDispatchedEvent,
} from "@v4-company/mars-events";

import { container } from "../di/container.ts";
import { TYPES } from "../../app/dtos/types.ts";

export const setupEvents = async (eventBus: EventBus) => {
  await eventBus.connect();

  const diSettings = {
    container,
    uowKey: TYPES.UnitOfWork,
  };

  eventBus.subscribe(
    UserCreatedEvent.eventName(),
    createHandlerScope(diSettings, TYPES.UserCreatedEventHandler),
  );

  eventBus.subscribe(
    EmailVerifiedEvent.eventName(),
    createHandlerScope(diSettings, TYPES.EmailVerifiedEventHandler),
  );

  eventBus.subscribe(
    EnterpriseCreatedEvent.eventName(),
    createHandlerScope(diSettings, TYPES.EnterpriseCreatedEventHandler),
  );

  eventBus.subscribe(
    V4MarketingServiceTokenCreatedEvent.eventName(),
    createHandlerScope(
      diSettings,
      TYPES.V4MarketingServiceTokenCreatedEventHandler,
    ),
  );

  eventBus.subscribe(
    LegacyUserMigrationDispatchedEvent.eventName(),
    createHandlerScope(
      diSettings,
      TYPES.LegacyUserMigrationDispatchedEventHandler,
    ),
  );

  eventBus.subscribe(
    LegacyOrganizationMigrationDispatchedEvent.eventName(),
    createHandlerScope(
      diSettings,
      TYPES.LegacyOrganizationMigrationDispatchedEventHandler,
    ),
  );

  eventBus.subscribe(
    LegacyMembershipMigrationDispatchedEvent.eventName(),
    createHandlerScope(
      diSettings,
      TYPES.LegacyMembershipMigrationDispatchedEventHandler,
    ),
  );

  eventBus.subscribe(
    V4MarketingOrganizationMigrationDispatchedEvent.eventName(),
    createHandlerScope(
      diSettings,
      TYPES.V4MarketingOrganizationMigrationDispatchedEventHandler,
    ),
  );

  eventBus.subscribe(
    V4MarketingServiceTokenDeactivatedEvent.eventName(),
    createHandlerScope(
      diSettings,
      TYPES.V4MarketingServiceTokenDeactivatedEventHandler,
    ),
  );

  eventBus.subscribe(
    EmployeeCreatedEvent.eventName(),
    createHandlerScope(diSettings, TYPES.EmployeeInvitedEventHandler),
  );
};
