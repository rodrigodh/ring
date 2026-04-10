// Gold standard: Paginated query in a Kysely repository
// Use this as reference for any paginated repository method.
//
// Key rules:
// - Use KyselyDatabasePagination from @v4-company/mars-api/core
// - Store the Kysely instance in a private readonly field (this.db) — do NOT use this.model!
// - Method signature: (params: PaginationParams) => Promise<PaginatedResult<T>>
// - Flow: getTotalCount(baseQuery) -> addPagination(baseQuery, { ...params, total }) -> query.execute()
// - Return { success: true, data, pagination } matching PaginatedResult<T>

import { Kysely } from "kysely";
import {
  BaseRepository,
  type PaginatedResult,
  type PaginationParams,
  KyselyDatabasePagination,
} from "@v4-company/mars-api/core";

// Inside the repository class:
//
// private readonly db: Kysely<DatabaseSchema>;
//
// constructor(
//   @inject(Kysely<DatabaseSchema>)
//   model: Kysely<DatabaseSchema>,
// ) {
//   super(model);
//   this.db = model;  // Store with proper non-null type
// }
//
// public async findByOrganizationIdPaginated(
//   organizationId: string,
//   params: PaginationParams,
// ): Promise<PaginatedResult<User>> {
//   const paginator = new KyselyDatabasePagination(this.db);
//
//   const baseQuery = this.queryBuilder()
//     .selectFrom("users")
//     .innerJoin("memberships", "users.id", "memberships.user_id")
//     .where("memberships.organization_id", "=", organizationId)
//     .where("memberships.deleted_at", "is", null)
//     .selectAll("users")
//     .select((eb) => this.userRelationsSubselects(eb))
//     .groupBy("users.id")
//     .orderBy("users.created_at", "desc");
//
//   const total = await paginator.getTotalCount(baseQuery);
//   const { query, pagination } = paginator.addPagination(baseQuery, {
//     ...params,
//     total,
//   });
//
//   const results = await query.execute();
//
//   const data = results
//     .filter((result) => result.external_accounts[0])
//     .map((result) => this.mapUserResult({ ...result, ... }));
//
//   return { success: true, data, pagination };
// }
