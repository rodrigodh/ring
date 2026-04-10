import { logger } from "@v4-company/mars-api/infra";
import { inject, injectable } from "inversify";
import { type UnityOfWork, type Service } from "@v4-company/mars-api/core";

import { type Organization } from "../../domain/aggregates/Organization.ts";
import { type User } from "../../domain/aggregates/User.ts";
import { type Application } from "../../domain/aggregates/Application.ts";

import { TYPES } from "../dtos/types.ts";
import { type UserRepository } from "../../domain/repositories/UserRepository.ts";
import { type AuthProvider } from "../../domain/providers/AuthProvider.ts";
import { UserAlreadyMemberException } from "../exceptions/UserAlreadyMemberException.ts";
import { UserNotIntegratedException } from "../exceptions/UserNotIntegratedException.ts";
import { Membership } from "../../domain/entities/Membership.ts";
import { OrganizationNotFoundException } from "../exceptions/OrganizationNotFoundException.ts";
import { Role } from "../../domain/aggregates/Role.ts";

export interface CreateUserMembershipServiceInput {
  user: User;
  organization: Organization;
  application: Application;
  role: Role;
}

@injectable()
export class CreateUserMembershipService
  implements Service<CreateUserMembershipServiceInput, User>
{
  private readonly userRepository: UserRepository;
  private readonly authProvider: AuthProvider;
  private readonly uow: UnityOfWork;

  constructor(
    @inject(TYPES.UserRepository)
    userRepository: UserRepository,
    @inject(TYPES.AuthProvider)
    authProvider: AuthProvider,
    @inject(TYPES.UnitOfWork)
    uow: UnityOfWork,
  ) {
    this.userRepository = userRepository;
    this.authProvider = authProvider;
    this.uow = uow;
  }

  async execute(input: CreateUserMembershipServiceInput) {
    const isUowPrevStarted = this.uow.isAlreadyStarted();
    await this.uow.start([this.userRepository], {
      attachToExistantInstance: isUowPrevStarted,
    });

    const user = input.user;
    if (!isUowPrevStarted) {
      this.uow.registerClean(user);
    }

    const orgId = input.organization.id.value;
    const appId = input.application.id.value;
    const alreadyMember = user.verifyMembership(orgId, appId);
    if (alreadyMember) {
      throw new UserAlreadyMemberException();
    }

    const provOrgId = input.organization.props.externalAccount.providerId.value;
    const provUserId = user.props.externalAccount.providerId.value;

    const { membershipId } = await this.findOrCreateMembership(
      provUserId,
      provOrgId,
    );

    const membership = Membership.create({
      organizationId: input.organization.id.value,
      applicationId: input.application.id.value,
      userId: user.id.value,
      authProviderId: membershipId,
      roleId: input.role.id.value,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    user.attachMembership(membership);
    logger.info("User membership created", user.props.memberships);

    this.uow.registerDirty(user);

    if (!isUowPrevStarted) {
      await this.uow.commit();
    }

    return user;
  }

  private async findOrCreateMembership(
    provUserId: string,
    provOrgId: string,
  ): Promise<{ membershipId: string }> {
    const currentProvMemberships =
      await this.authProvider.listOrganizationosMemberships({
        userId: provUserId,
      });

    const isAlreadyMember = currentProvMemberships.some(
      (m) => m.organizationId === provOrgId,
    );

    if (!isAlreadyMember) {
      const createdprovOrgMembership =
        await this.authProvider.createOrganizationMembership({
          userId: provUserId,
          organizationId: provOrgId,
        });

      if (!createdprovOrgMembership) {
        const log = "Failed to create organization membership";
        logger.info(log, { userId: provUserId, organizationId: provOrgId });
        throw new UserNotIntegratedException();
      }

      const membershipId = createdprovOrgMembership.id;
      return { membershipId };
    }

    const foundProvOrgMembership = currentProvMemberships.find(
      (m) => m.organizationId === provOrgId,
    );

    if (!foundProvOrgMembership?.id) {
      logger.warn("Organization not found", {
        userId: provUserId,
        organizationId: provOrgId,
      });
      throw new OrganizationNotFoundException();
    }

    const membershipId = foundProvOrgMembership.id;
    return { membershipId };
  }
}
