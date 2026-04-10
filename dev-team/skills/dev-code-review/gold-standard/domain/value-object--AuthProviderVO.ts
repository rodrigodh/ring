import { RequiredStringVO } from "@v4-company/mars-api/core";

export const AuthProvider = {
  CLERK: "CLERK",
  WORKOS: "WORKOS",
} as const;

export class AuthProviderVO extends RequiredStringVO {
  constructor(value: (string & {}) | keyof typeof AuthProvider) {
    super(value, Object.values(AuthProvider));
  }
}

export type AuthProviderType = (typeof AuthProvider)[keyof typeof AuthProvider];
