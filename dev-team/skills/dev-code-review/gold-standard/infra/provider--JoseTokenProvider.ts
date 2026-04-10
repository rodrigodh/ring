import { injectable } from "inversify";
import { SignJWT, decodeJwt, jwtVerify } from "jose";

import {
  GenerateAccessTokenInput,
  JwtTokenResponse,
  TokenProvider,
} from "../../domain/providers/TokenProvider.ts";

const encoder = new TextEncoder();

@injectable()
export class JoseTokenProvider implements TokenProvider {
  private readonly secret: Uint8Array;

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not set");
    }
    this.secret = encoder.encode(secret);
  }

  public async decodeToken(token: string): Promise<JwtTokenResponse | null> {
    try {
      const { payload } = await jwtVerify(token, this.secret);

      return payload as JwtTokenResponse;
    } catch (err) {
      const typedError = err as { code: string; payload: JwtTokenResponse };

      const expiredCode = "ERR_JWT_EXPIRED";
      if (typedError?.code === expiredCode) {
        return typedError?.payload;
      }

      return null;
    }
  }

  public async generateAccessToken(
    input: GenerateAccessTokenInput,
  ): Promise<string> {
    return new SignJWT(input)
      .setProtectedHeader({ alg: "HS256" }) // Use HS256 here
      .setIssuedAt()
      .setExpirationTime("1m")
      .sign(this.secret);
  }

  public decodePayload(token: string): Record<string, string> {
    const payload = decodeJwt(token);
    return payload as unknown as Record<string, string>;
  }
}
