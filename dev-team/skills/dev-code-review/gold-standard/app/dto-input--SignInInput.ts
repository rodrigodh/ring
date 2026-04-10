import { z } from "zod";
import { RequestDto } from "@v4-company/mars-api/core";

export const SignInSchemaOpenApi = z.object({
  email: z.string().email(),
  password: z.string().min(8),

  organizationId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),

  codeChallenge: z.string().max(255),
  codeChallengeMethod: z.enum(["plain", "S256"]),
});

export const SignInSchema = SignInSchemaOpenApi.extend({
  metadata: z.object({
    ipAddress: z.string().max(255).min(1).optional(),
    userAgent: z.string().max(255).min(1).optional(),
  }),
});

export type SignInDTO = z.infer<typeof SignInSchema>;

export class SignInRequest extends RequestDto<SignInDTO> {
  constructor(input: SignInDTO) {
    super(input, SignInSchema);
  }
}
