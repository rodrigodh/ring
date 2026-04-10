import { type User as UserModel } from "../database/kysely/types/types.ts";
import { type EmailAddress as EmailAddressModel } from "../database/kysely/types/types.ts";
import { type ExternalAccount as ExternalAccountModel } from "../database/kysely/types/types.ts";
import { type Membership as MembershipModel } from "../database/kysely/types/types.ts";

import { User } from "../../domain/aggregates/User.ts";
import { EntityIdVO } from "@v4-company/mars-api/core";
import { type MetadataType } from "../../domain/value-objects/MetadataVO.ts";
import { EmailAddress } from "../../domain/entities/EmailAddress.ts";
import { ExternalAccount } from "../../domain/entities/ExternalAccount.ts";
import { Membership } from "../../domain/entities/Membership.ts";

type IEmailAddressModel = Omit<EmailAddressModel, "verified_at"> & {
  verified_at: string | null;
};

type IExternalAccountModel = Omit<
  ExternalAccountModel,
  "created_at" | "updated_at"
> & {
  created_at: string;
  updated_at: string;
};

type IMembershipModel = Omit<
  MembershipModel,
  "created_at" | "updated_at" | "deleted_at"
> & {
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type IUserModel = Omit<
  UserModel,
  "created_at" | "updated_at" | "is_system_admin"
> & {
  is_system_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type FromPeristenceUser = {
  user: IUserModel;
  emails: IEmailAddressModel[];
  externalAccount: IExternalAccountModel;
  memberships: IMembershipModel[];
};

type UserPersistence = {
  user: Omit<UserModel, "is_system_admin"> & {
    is_system_admin: boolean;
  };
  emails: EmailAddressModel[];
  externalAccount: ExternalAccountModel;
  memberships: MembershipModel[];
};

export class UserPersistenceMapper {
  toPersistence(user: User): UserPersistence {
    const userData = {
      id: user.id.value,
      first_name: user.props.firstName.value,
      last_name: user.props.lastName.value,
      image_url: user.props.imageUrl.value,
      is_system_admin: user.props.isSystemAdmin.value,
      banned: user.props.banned.value,
      metadata: user.props.metadata?.value,
      created_at: user.props.createdAt.value,
      updated_at: user.props.updatedAt.value,
    };

    const externalAccount = {
      id: user.props.externalAccount.id.value,
      provider: user.props.externalAccount.provider.value,
      provider_id: user.props.externalAccount.providerId.value,
      recipient_type: user.props.externalAccount.recipientType.value,
      recipient_id: user.props.externalAccount.recipientId.value,
      created_at: user.props.externalAccount.createdAt.value,
      updated_at: user.props.externalAccount.updatedAt.value,
    };

    const memberships = user.props.memberships.map((m) => {
      return {
        id: m.id.value,
        auth_provider_id: m.authProviderId.value,
        user_id: m.userId.value,
        role_id: m.roleId.value,
        organization_id: m.organizationId.value,
        application_id: m.applicationId.value,
        created_at: m.createdAt.value,
        updated_at: m.updatedAt.value,
        deleted_at: m.deletedAt.value,
      };
    });

    const emails = user.props.emails.map((email) => {
      return {
        id: email.id.value,
        user_id: email.userId.value,
        email: email.email.value,
        verified: email.verified.value,
        verified_at: email.verifiedAt.value,
        is_primary: email.isPrimary.value,
      };
    });

    return {
      user: userData,
      emails,
      externalAccount,
      memberships,
    };
  }

  fromPersistence(user: FromPeristenceUser): User {
    const emails = user.emails.map((email) => {
      return EmailAddress.from(
        {
          email: email.email,
          verified: email.verified,
          verifiedAt: email.verified_at ? new Date(email.verified_at) : null,
          isPrimary: email.is_primary,
          userId: email.user_id,
        },
        new EntityIdVO(email.id),
      );
    });

    const externalAccount = ExternalAccount.from(
      {
        provider: user.externalAccount.provider,
        providerId: user.externalAccount.provider_id,
        recipientType: user.externalAccount.recipient_type,
        recipientId: user.externalAccount.recipient_id,
        createdAt: new Date(user.externalAccount.created_at),
        updatedAt: new Date(user.externalAccount.updated_at),
      },
      new EntityIdVO(user.externalAccount.id),
    );

    const memberships = user.memberships.map((m) => {
      return Membership.from(
        {
          userId: m.user_id,
          authProviderId: m.auth_provider_id,
          roleId: m.role_id,
          organizationId: m.organization_id,
          applicationId: m.application_id,
          createdAt: new Date(m.created_at),
          updatedAt: new Date(m.updated_at),
          deletedAt: m.deleted_at ? new Date(m.deleted_at) : null,
        },
        new EntityIdVO(m.id),
      );
    });

    return User.from(
      {
        firstName: user.user.first_name,
        lastName: user.user.last_name,
        imageUrl: user.user.image_url,
        banned: user.user.banned,
        metadata: user.user.metadata as MetadataType,
        createdAt: new Date(user.user.created_at),
        updatedAt: new Date(user.user.updated_at),
        isSystemAdmin: user.user.is_system_admin,
        emails,
        externalAccount,
        memberships,
      },
      new EntityIdVO(user.user.id),
    );
  }
}
