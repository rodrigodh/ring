import { inject, injectable } from "inversify";
import { EntityIdVO, type EventHandler } from "@v4-company/mars-api/core";
import { type UserCreatedEvent } from "@v4-company/mars-events";

import { TYPES } from "../dtos/types.ts";
import { type UserRepository } from "../../domain/repositories/UserRepository.ts";
import { CreateEmailVerificationService } from "../services/CreateEmailVerificationService.ts";
import { UserNotFoundException } from "../exceptions/UserNotFoundException.ts";
import { EmailNotFoundException } from "../exceptions/UserEmailNotFoundException.ts";
import { EmailAlreadyVerifiedException } from "../exceptions/EmailAlreadyVerifiedException.ts";

@injectable()
export class UserCreatedEventHandler implements EventHandler<UserCreatedEvent> {
  private readonly createEmailVerificationService: CreateEmailVerificationService;
  private readonly userRepository: UserRepository;

  constructor(
    @inject(TYPES.CreateEmailVerificationService)
    createEmailVerificationService: CreateEmailVerificationService,
    @inject(TYPES.UserRepository)
    userRepository: UserRepository,
  ) {
    this.createEmailVerificationService = createEmailVerificationService;
    this.userRepository = userRepository;
  }

  async handle(event: UserCreatedEvent): Promise<void> {
    const user = await this.userRepository.findById({
      id: new EntityIdVO(event.payload.userId),
    });
    if (!user) {
      throw new UserNotFoundException();
    }

    const primaryEmail = user.props.emails.find(
      (email) => email.isPrimary.value,
    );
    if (!primaryEmail) {
      throw new EmailNotFoundException();
    }
    if (primaryEmail.verified.value) {
      return;
    }

    await this.createEmailVerificationService
      .execute({
        email: primaryEmail,
        user: user,
      })
      .catch((error) => {
        if (error instanceof EmailAlreadyVerifiedException) {
          return;
        }

        throw error;
      });
  }
}
