import { injectable, inject } from "inversify";
import { logger } from "@v4-company/mars-api/infra";

import { TYPES } from "../dtos/types.ts";
import { type CreateUserRequest } from "../dtos/inputs/CreateUserInput.ts";
import { type UserResponse } from "../dtos/outputs/UserResponse.ts";
import { type InviteRepository } from "../../domain/repositories/InviteRepository.ts";
import { type User } from "../../domain/aggregates/User.ts";
import {
  type UnityOfWork,
  type EventBus,
  type UseCase,
} from "@v4-company/mars-api/core";

import { UserResponseMapper } from "../mappers/UserResponseMapper.ts";
import { CreateUserService } from "../services/CreateUserService.ts";
import { ConsumeInviteService } from "../services/ConsumeInviteService.ts";
import { Invite } from "../../domain/aggregates/Invite.ts";

@injectable()
export class SignUpUseCase implements UseCase<CreateUserRequest, UserResponse> {
  private readonly createUserService: CreateUserService;
  private readonly consumeInviteService: ConsumeInviteService;
  private readonly inviteRepository: InviteRepository;
  private readonly eventBus: EventBus;
  private readonly autoVerifyEmail: boolean;
  private readonly uow: UnityOfWork;

  constructor(
    @inject(TYPES.CreateUserService)
    createUserService: CreateUserService,
    @inject(TYPES.ConsumeInviteService)
    consumeInviteService: ConsumeInviteService,
    @inject(TYPES.InviteRepository)
    inviteRepository: InviteRepository,
    @inject(TYPES.UnitOfWork)
    uow: UnityOfWork,
    @inject(TYPES.EventBus)
    eventBus: EventBus,
    @inject(TYPES.AutoVerifyEmail)
    autoVerifyEmail: boolean,
  ) {
    this.createUserService = createUserService;
    this.consumeInviteService = consumeInviteService;
    this.inviteRepository = inviteRepository;
    this.autoVerifyEmail = autoVerifyEmail;
    this.eventBus = eventBus;
    this.uow = uow;
  }

  async execute(input: CreateUserRequest): Promise<UserResponse> {
    await this.uow.start([]);

    const user = await this.createUserService.execute({
      firstName: input.props.firstName,
      lastName: input.props.lastName,
      email: input.props.email,
      password: input.props.password,
      autoVerifyEmail: this.autoVerifyEmail,
    });

    const invites = await this.consumePendingInvites(user);

    await this.uow.commit();
    await this.eventBus.publish(user.raisedEvents);
    invites.forEach((invite) => {
      this.eventBus.publish(invite.raisedEvents);
    });

    return new UserResponseMapper().toResponse({
      user,
    });
  }

  // TODO: Move to user created event handler.
  private async consumePendingInvites(user: User): Promise<Invite[]> {
    const primaryEmail = user.primaryEmail;
    if (!primaryEmail) {
      return [];
    }

    const pendingInvites = await this.inviteRepository.findAllPendingByEmail({
      email: primaryEmail.email.value,
    });
    pendingInvites.forEach((invite) => {
      this.uow.registerClean(invite);
    });

    if (pendingInvites.length === 0) {
      logger.info(
        "[SignUpUseCase] NO_PENDING_INVITES | No pending invites found for user",
        { userId: user.id.value },
      );
      return [];
    }

    const consumedInvites = [];

    for (const invite of pendingInvites) {
      try {
        const consumedInvite = await this.consumeInviteService.execute({
          user,
          invite,
        });
        consumedInvites.push(consumedInvite);
      } catch (err) {
        logger.warn(
          "[SignUpUseCase] ERROR_CONSUMING_INVITE | Error consuming invite",
          {
            userId: user.id.value,
            inviteId: invite.id.value,
            email: primaryEmail.email.value,
            errMessage: err instanceof Error ? err.message : String(err),
            error: err,
          },
        );
      }
    }

    return consumedInvites;
  }
}
