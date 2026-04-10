import { jsonArrayFrom } from "kysely/helpers/postgres";
import { type ControlledTransaction, Kysely, ExpressionBuilder } from "kysely";
import { injectable, inject } from "inversify";
import {
  BaseRepository,
  EntityIdVO,
  type FindEntityById,
} from "@v4-company/mars-api/core";

import { type DB as DatabaseSchema } from "./types/types.ts";
import { type UserRepository } from "../../../domain/repositories/UserRepository.ts";
import { type User } from "../../../domain/aggregates/User.ts";
import { type User as UserModel } from "./types/types.ts";

import {
  type FromPeristenceUser,
  UserPersistenceMapper,
} from "../../mappers/UserPersistenceMapper.ts";

type KyselyTransaction = ControlledTransaction<DatabaseSchema>;

type UserMapperInput = Omit<FromPeristenceUser, "user"> &
  Omit<UserModel, "is_system_admin"> & {
    is_system_admin: boolean;
  };

@injectable()
export class KyselyUserRepository
  extends BaseRepository<KyselyTransaction, Kysely<DatabaseSchema>>
  implements UserRepository
{
  private readonly mapper: UserPersistenceMapper;

  constructor(
    @inject(UserPersistenceMapper)
    mapper: UserPersistenceMapper,
    @inject(Kysely<DatabaseSchema>)
    model: Kysely<DatabaseSchema>,
  ) {
    super(model);
    this.mapper = mapper;
  }

  private mapUserResult(result: UserMapperInput): User {
    return this.mapper.fromPersistence({
      user: {
        id: result.id,
        is_system_admin: result.is_system_admin,
        first_name: result.first_name,
        last_name: result.last_name,
        image_url: result.image_url,
        banned: result.banned,
        metadata: result.metadata,
        created_at: result.created_at.toISOString(),
        updated_at: result.updated_at.toISOString(),
      },
      emails: result.emails,
      externalAccount: result.externalAccount,
      memberships: result.memberships,
    });
  }

  private userRelationsSubselects(
    eb: ExpressionBuilder<DatabaseSchema, "users">,
  ) {
    return [
      jsonArrayFrom(
        eb
          .selectFrom("memberships")
          .selectAll()
          .whereRef("memberships.user_id", "=", "users.id")
          .where("memberships.deleted_at", "is", null),
      ).as("memberships"),

      jsonArrayFrom(
        eb
          .selectFrom("external_accounts")
          .selectAll()
          .whereRef("recipient_id", "=", "users.id"),
      ).as("external_accounts"),

      jsonArrayFrom(
        eb
          .selectFrom("email_addresses")
          .selectAll()
          .whereRef("email_addresses.user_id", "=", "users.id"),
      ).as("emails"),
    ];
  }

  public async findByAuthProviderId(query: {
    authProviderId: string;
  }): Promise<User | null> {
    const queryBuilder = this.queryBuilder();

    const result = await queryBuilder
      .selectFrom("users")
      .innerJoin(
        "external_accounts",
        "users.id",
        "external_accounts.recipient_id",
      )
      .where("external_accounts.provider_id", "=", query.authProviderId)
      .where("external_accounts.recipient_type", "=", "USER")
      .selectAll("users")
      .select((eb) => this.userRelationsSubselects(eb))
      .executeTakeFirst();

    if (!result || !result.external_accounts[0]) {
      return null;
    }

    return this.mapUserResult({
      ...result,
      externalAccount: result.external_accounts[0],
    });
  }

  public async findById(input: FindEntityById): Promise<User | null> {
    const queryBuilder = this.queryBuilder();

    const result = await queryBuilder
      .selectFrom("users")
      .where("id", "=", input.id.value)
      .selectAll("users")
      .select((eb) => this.userRelationsSubselects(eb))
      .executeTakeFirst();

    if (!result || !result.external_accounts[0]) return null;

    return this.mapUserResult({
      ...result,
      externalAccount: result.external_accounts[0],
    });
  }

  public async findByEmail(query: { email: string }): Promise<User | null> {
    const queryBuilder = this.queryBuilder();

    const email = await queryBuilder
      .selectFrom("email_addresses")
      .selectAll()
      .where("email", "=", query.email)
      .executeTakeFirst();

    if (!email) {
      return null;
    }

    return this.findById({
      id: new EntityIdVO(email.user_id),
      organizationId: new EntityIdVO(),
    });
  }

  public async findByMembershipId(query: {
    membershipId: string;
  }): Promise<User | null> {
    const queryBuilder = this.queryBuilder();

    const membership = await queryBuilder
      .selectFrom("memberships")
      .selectAll()
      .where("id", "=", query.membershipId)
      .where("deleted_at", "is", null)
      .executeTakeFirst();

    if (!membership) {
      return null;
    }

    return this.findById({
      id: new EntityIdVO(membership.user_id),
      organizationId: new EntityIdVO(),
    });
  }

  public async findByEmailAddressId(query: {
    emailAddressId: string;
  }): Promise<User | null> {
    const queryBuilder = this.queryBuilder();

    const email = await queryBuilder
      .selectFrom("email_addresses")
      .selectAll()
      .where("id", "=", query.emailAddressId)
      .executeTakeFirst();

    if (!email) {
      return null;
    }

    return this.findById({
      id: new EntityIdVO(email.user_id),
      organizationId: new EntityIdVO(),
    });
  }

  public async findByOrganizationId(query: {
    organizationId: string;
  }): Promise<User[]> {
    const queryBuilder = this.queryBuilder();

    const results = await queryBuilder
      .selectFrom("users")
      .innerJoin("memberships", "users.id", "memberships.user_id")
      .where("memberships.organization_id", "=", query.organizationId)
      .where("memberships.deleted_at", "is", null)
      .selectAll("users")
      .select((eb) => this.userRelationsSubselects(eb))
      .groupBy("users.id")
      .execute();

    return results
      .filter((result) => result.external_accounts[0])
      .map((result) =>
        this.mapUserResult({
          ...result,
          is_system_admin: result.is_system_admin,
          externalAccount: result.external_accounts[0],
        }),
      );
  }

  public async findAll(): Promise<User[]> {
    const results = await this.queryBuilder()
      .selectFrom("users")
      .selectAll("users")
      .select((eb) => this.userRelationsSubselects(eb))
      .execute();

    return results
      .filter((result) => result.external_accounts[0])
      .map((result) =>
        this.mapUserResult({
          ...result,
          externalAccount: result.external_accounts[0],
        }),
      );
  }

  public async findWithoutEnterprise(): Promise<User[]> {
    const results = await this.queryBuilder()
      .selectFrom("users")
      .leftJoin("enterprises", "enterprises.user_id", "users.id")
      .where("enterprises.id", "is", null)
      .selectAll("users")
      .select((eb) => this.userRelationsSubselects(eb))
      .execute();

    return results
      .filter((result) => result.external_accounts[0])
      .map((result) =>
        this.mapUserResult({
          ...result,
          externalAccount: result.external_accounts[0],
        }),
      );
  }

  public async create(input: User): Promise<void> {
    const dbUser = this.mapper.toPersistence(input);
    const query = this.queryBuilder();

    async function performQuery(trx: KyselyTransaction) {
      await trx
        .insertInto("users")
        .values(dbUser.user)
        .executeTakeFirstOrThrow();

      if (dbUser.emails.length > 0) {
        await trx
          .insertInto("email_addresses")
          .values(dbUser.emails)
          .executeTakeFirstOrThrow();
      }

      if (dbUser.externalAccount) {
        await trx
          .insertInto("external_accounts")
          .values(dbUser.externalAccount)
          .executeTakeFirstOrThrow();
      }

      if (dbUser.memberships.length > 0) {
        await trx
          .insertInto("memberships")
          .values(dbUser.memberships)
          .executeTakeFirstOrThrow();
      }
    }

    if (query.isTransaction) {
      await performQuery(query as KyselyTransaction);
      return;
    }

    await query.transaction().execute(async (trx) => {
      await performQuery(trx as KyselyTransaction);
    });
  }

  delete(_: Partial<User>): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public async update(input: User): Promise<void> {
    const userId = input.id.value;
    const dbUser = this.mapper.toPersistence(input as User);
    const query = this.queryBuilder();

    async function performQuery(trx: KyselyTransaction) {
      await trx
        .updateTable("users")
        .set({
          first_name: dbUser.user.first_name,
          last_name: dbUser.user.last_name,
          image_url: dbUser.user.image_url,
          banned: dbUser.user.banned,
          metadata: dbUser.user.metadata,
          updated_at: dbUser.user.updated_at,
        })
        .where("id", "=", userId)
        .executeTakeFirstOrThrow();

      await trx
        .deleteFrom("email_addresses")
        .where("user_id", "=", userId)
        .executeTakeFirstOrThrow();
      if (dbUser.emails.length > 0) {
        await trx
          .insertInto("email_addresses")
          .values(dbUser.emails)
          .executeTakeFirstOrThrow();
      }

      await trx
        .updateTable("external_accounts")
        .set({
          provider: dbUser.externalAccount.provider,
          provider_id: dbUser.externalAccount.provider_id,
          recipient_type: dbUser.externalAccount.recipient_type,
          updated_at: dbUser.externalAccount.updated_at,
        })
        .where("recipient_id", "=", userId)
        .executeTakeFirstOrThrow();

      await trx
        .deleteFrom("memberships")
        .where("user_id", "=", userId)
        .where("deleted_at", "is", null)
        .executeTakeFirstOrThrow();
      if (dbUser.memberships.length > 0) {
        await trx
          .insertInto("memberships")
          .values(dbUser.memberships)
          .executeTakeFirstOrThrow();
      }
    }

    if (query.isTransaction) {
      await performQuery(query as KyselyTransaction);
      return;
    }

    await query.transaction().execute(async (trx) => {
      await performQuery(trx as KyselyTransaction);
    });
  }
}
