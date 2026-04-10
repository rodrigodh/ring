import {
  AggregateRoot,
  RequiredBooleanVO,
  RequiredDateVO,
  RequiredStringVO,
  StringVO,
  type ToPrimitives,
  type EntityIdVO,
  DomainException,
} from "@v4-company/mars-api/core";
import { EmailVerifiedEvent, UserCreatedEvent } from "@v4-company/mars-events";

import { EmailAddress } from "../entities/EmailAddress.ts";
import { type ExternalAccount } from "../entities/ExternalAccount.ts";
import { type Membership } from "../entities/Membership.ts";
import { MetadataVO } from "../value-objects/MetadataVO.ts";

type UserProps = {
  firstName: RequiredStringVO;
  lastName: RequiredStringVO;
  imageUrl: StringVO;
  banned: RequiredBooleanVO;
  emails: EmailAddress[];
  externalAccount: ExternalAccount;
  memberships: Membership[];
  metadata?: MetadataVO;
  isSystemAdmin: RequiredBooleanVO; // TODO: Handle it differently when complex admin levels arrive
  createdAt: RequiredDateVO;
  updatedAt: RequiredDateVO;
};

export type PrimitiveUserProps = ToPrimitives<UserProps>;

export type CreateUserInput = Omit<PrimitiveUserProps, "emails"> & {
  email: string;
};

export class User extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id?: EntityIdVO) {
    super(props, id);
  }

  private static build(props: PrimitiveUserProps): UserProps {
    return {
      firstName: new RequiredStringVO(props.firstName),
      lastName: new RequiredStringVO(props.lastName),
      imageUrl: new StringVO(props.imageUrl),
      banned: new RequiredBooleanVO(props.banned),
      emails: props.emails,
      externalAccount: props.externalAccount,
      isSystemAdmin: new RequiredBooleanVO(props.isSystemAdmin),
      memberships: props.memberships,
      metadata: props.metadata ? new MetadataVO(props.metadata) : undefined,
      createdAt: new RequiredDateVO(new Date()),
      updatedAt: new RequiredDateVO(new Date()),
    };
  }

  static from(props: PrimitiveUserProps, id?: EntityIdVO): User {
    return new User(User.build(props), id);
  }

  static create(input: CreateUserInput): User {
    const user = User.from({ ...input, emails: [] });

    const primaryEmail = EmailAddress.create({
      email: input.email,
      userId: user.id.value,
      isPrimary: true,
      verified: false,
      verifiedAt: null,
    });
    user.addEmail(primaryEmail);

    user.raiseEvent(
      new UserCreatedEvent({
        userId: user.id.value,
        email: primaryEmail.email.value,
      }),
    );

    return user;
  }

  get firstName(): string {
    return this.props.firstName.value;
  }

  get lastName(): string {
    return this.props.lastName.value;
  }

  get banned(): boolean {
    return this.props.banned.value;
  }

  get emails(): EmailAddress[] {
    return this.props.emails;
  }

  get primaryEmail(): EmailAddress | undefined {
    if (!this.props.emails?.length) {
      return undefined;
    }

    const primaryEmail = this.props.emails.find((e) => e.isPrimary.value);
    if (!primaryEmail) {
      return undefined;
    }

    return primaryEmail;
  }

  public addEmail(email: EmailAddress): void {
    if (email.isPrimary.value && this.primaryEmail) {
      throw new DomainException("User already has a primary email");
    }

    this.props.emails.push(email);
  }

  public setExternalAccount(externalAccount: ExternalAccount): void {
    this.props.externalAccount = externalAccount;
  }

  public attachMembership(input: Membership): void {
    const inputOrgId = input.props.organizationId.value;
    const inputAppId = input.props.applicationId.value;

    const alreadyMember = this.verifyMembership(inputOrgId, inputAppId);
    if (alreadyMember) {
      throw new DomainException(
        "User is already a member of this organization",
      );
    }

    this.props.memberships.push(input);
  }

  public verifyMembership(
    organizationId: string,
    applicationId: string,
  ): boolean {
    return this.props.memberships.some((membership) => {
      const isOrganizationMember =
        membership.organizationId.value === organizationId;

      const isApplicationMember =
        membership.applicationId.value === applicationId;

      return (
        isOrganizationMember && isApplicationMember && !membership.isDeleted()
      );
    });
  }

  public updateMembershipRole(membershipId: string, roleId: EntityIdVO): void {
    const membership = this.props.memberships.find(
      (m) => m.id.value === membershipId && !m.isDeleted(),
    );

    if (!membership) {
      throw new DomainException("Membership not found");
    }

    membership.setRoleId(roleId);
    this.props.updatedAt = new RequiredDateVO(new Date());
  }

  public removeMembership(membershipId: string): void {
    const membership = this.props.memberships.find(
      (m) => m.id.value === membershipId && !m.isDeleted(),
    );

    if (!membership) {
      throw new DomainException("Membership not found");
    }

    membership.softDelete();
    this.props.updatedAt = new RequiredDateVO(new Date());
  }

  public verifyEmail(email: string): void {
    const emailAddress = this.props.emails.find((e) => e.email.value === email);
    if (!emailAddress) {
      throw new DomainException("Email not found at verification");
    }

    emailAddress.props.verified = new RequiredBooleanVO(true);
    emailAddress.props.verifiedAt = new RequiredDateVO(new Date());
    this.props.updatedAt = new RequiredDateVO(new Date());

    const event = new EmailVerifiedEvent({
      userId: this.id.value,
      emailAddressId: emailAddress.id.value,
    });

    this.raiseEvent(event);
  }
}
