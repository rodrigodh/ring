import { z } from "zod";

export const JwtTokenResponseSchema = z.object({
  scope: z.string(), // Permissions
  azp: z.string(), // Who is calling (OauthClientId | ServiceAccountId | Users Web app id)
  aud: z.string(), // Target audience (appId that will be called with this token)
  sub: z.string(), // UserId | OauthClient id | ServiceAccountId
  kind: z.enum(["oaclient", "service", "user"]), // Who is the subject of the token
  gty: z.enum(["client_credentials", "password", "authorization_code"]), // Grant type
  iss: z.string(), // Issuer (identity service url)
  exp: z.number(), // Expiration time (epoch)
  iat: z.number(), // Issued at (epoch)

  roleId: z.string().nullish(),
  orgId: z.string().nullish(),
  entId: z.string().nullish(),
});

export const GenerateAccessTokenInputSchema = JwtTokenResponseSchema.omit({
  exp: true,
  iat: true,
});

export type JwtTokenResponse = z.infer<typeof JwtTokenResponseSchema>;
export type GenerateAccessTokenInput = z.infer<
  typeof GenerateAccessTokenInputSchema
>;

export interface TokenProvider {
  decodePayload(token: string): Record<string, string>;
  generateAccessToken(input: GenerateAccessTokenInput): Promise<string>;
  decodeToken(token: string): Promise<JwtTokenResponse | null>;
}
