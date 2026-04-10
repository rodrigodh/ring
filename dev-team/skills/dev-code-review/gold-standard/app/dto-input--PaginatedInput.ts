// Gold standard: Paginated DTO input pattern
// Use this as reference for any paginated list route.
//
// Key rules:
// - SchemaOpenApi uses z.coerce.number() (query params come as strings)
// - QuerySchema uses z.number() (for @ApiQueryParamsSchema OpenAPI docs)
// - Defaults: page = 1, limit = 10, max limit = 100
// - Request class extends RequestDto validating against the full schema
// - Export QueryDTO type for reuse if needed

import { z } from "zod";
import { RequestDto } from "@v4-company/mars-api/core";

export const ListUsersByOrganizationIdSchemaOpenApi = z.object({
  organizationId: z.string().uuid(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const ListUsersByOrganizationIdQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export type ListUsersByOrganizationIdQueryDTO = z.infer<
  typeof ListUsersByOrganizationIdQuerySchema
>;

export const ListUsersByOrganizationIdSchema =
  ListUsersByOrganizationIdSchemaOpenApi;

export type ListUsersByOrganizationIdDTO = z.infer<
  typeof ListUsersByOrganizationIdSchema
>;

export class ListUsersByOrganizationIdRequest extends RequestDto<ListUsersByOrganizationIdDTO> {
  constructor(input: ListUsersByOrganizationIdDTO) {
    super(input, ListUsersByOrganizationIdSchema);
  }
}
