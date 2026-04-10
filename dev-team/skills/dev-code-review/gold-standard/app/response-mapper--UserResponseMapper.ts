import { type User } from "../../domain/aggregates/User.ts";
import { type UserResponse } from "../dtos/outputs/UserResponse.ts";
import { type ResponseMapper } from "@v4-company/mars-api/core";

type UserParam = {
  user: User;
  organizationNames?: Map<string, string>;
  currentOrgId?: string;
  currentAppId?: string;
};

export class UserResponseMapper
  implements ResponseMapper<UserParam, UserResponse>
{
  toResponse(param: UserParam): UserResponse {
    return {
      id: param.user.id.value,
      firstName: param.user.props.firstName.value,
      lastName: param.user.props.lastName.value,
      metadata: param.user.props.metadata?.value,
      emails: param.user.props.emails.map((email) => ({
        id: email.id.value,
        email: email.props.email.value,
        verified: email.props.verified.value,
        isPrimary: email.props.isPrimary.value,
        verifiedAt: email.props.verifiedAt.value?.toISOString() || null,
      })),
      memberships: param.user.props.memberships.map((membership) => {
        const baseMembership = {
          id: membership.id.value,
          organizationId: membership.props.organizationId.value,
          roleId: membership.props.roleId.value,
          applicationId: membership.props.applicationId.value,
          createdAt: membership.props.createdAt.value.toISOString(),
          updatedAt: membership.props.updatedAt.value.toISOString(),
        };

        if (param.organizationNames && param.currentOrgId) {
          const orgId = membership.props.organizationId.value;
          const appId = membership.props.applicationId.value;

          return {
            ...baseMembership,
            organizationName: param.organizationNames.get(orgId) ?? null,
            isActive:
              orgId === param.currentOrgId && appId === param.currentAppId,
          };
        }

        return baseMembership;
      }),
      imageUrl: param.user.props.imageUrl.value,
      banned: param.user.props.banned.value,
      currentApplicationId: param.currentAppId,
      currentOrganizationId: param.currentOrgId,
      createdAt: param.user.props.createdAt.value.toISOString(),
      updatedAt: param.user.props.updatedAt.value.toISOString(),
    };
  }
}
