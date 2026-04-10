import type {
  FindEntityById,
  PaginatedResult,
  PaginationParams,
  UowEntitiesRepository,
} from "@v4-company/mars-api/core";
import { type User } from "../aggregates/User.ts";

export interface UserRepository extends UowEntitiesRepository<User> {
  findById(query: Omit<FindEntityById, "organizationId">): Promise<User | null>;
  findByEmail(query: { email: string }): Promise<User | null>;
  findByAuthProviderId(query: { authProviderId: string }): Promise<User | null>;
  findByMembershipId(query: { membershipId: string }): Promise<User | null>;
  findByEmailAddressId(query: { emailAddressId: string }): Promise<User | null>;
  findByOrganizationId(query: { organizationId: string }): Promise<User[]>;
  findByOrganizationIdPaginated(
    organizationId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<User>>;
  findAll(): Promise<User[]>;
  findWithoutEnterprise(): Promise<User[]>;
}
