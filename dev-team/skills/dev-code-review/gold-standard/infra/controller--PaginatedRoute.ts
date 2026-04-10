// Gold standard: Paginated route pattern in a controller
// Use this as reference for any paginated list endpoint.
//
// Key rules:
// - Use PaginationParams from @v4-company/mars-api/core as the Querystring type
// - Use @ApiQueryParamsSchema with the QuerySchema for OpenAPI docs
// - Use @Auth(PERMISSIONS.RESOURCES.X, PERMISSIONS.ACTIONS.READ) for permission gating
// - Apply defaults (page ?? 1, limit ?? 10) when constructing the request DTO
// - For org-scoped routes: the use case must verify org exists + caller membership

import { type PaginationParams } from "@v4-company/mars-api/core";
import {
  Auth,
  type AuthFastifyRequest,
} from "@v4-company/mars-api/identity";
import {
  ApiTag,
  ApiQueryParamsSchema,
  Route,
} from "@v4-company/mars-api/server";
import { PERMISSIONS } from "../config/Permissions.ts";
import {
  ListUsersByOrganizationIdRequest,
  ListUsersByOrganizationIdQuerySchema,
} from "../../app/dtos/inputs/ListUsersByOrganizationIdInput.ts";

// Inside the controller class:

// @ApiTag("Users")
// @ApiQueryParamsSchema(ListUsersByOrganizationIdQuerySchema)
// @Auth(PERMISSIONS.RESOURCES.USERS, PERMISSIONS.ACTIONS.READ)
// @Route("get", "/users/organization/:organizationId")
// async listByOrganizationId(
//   req: AuthFastifyRequest<{
//     Params: { organizationId: string };
//     Querystring: PaginationParams;
//   }>,
//   reply: FastifyReply,
// ) {
//   const request = new ListUsersByOrganizationIdRequest({
//     organizationId: req.params.organizationId,
//     page: req.query.page ?? 1,
//     limit: req.query.limit ?? 10,
//   });
//
//   return reply.send(
//     await this.listUsersByOrganizationIdUseCase.execute(request, req.auth),
//   );
// }
