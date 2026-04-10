import { injectable, inject } from "inversify";
import { logger } from "@v4-company/mars-api/infra";
import { type FastifyReply, type FastifyRequest } from "fastify";
import {
  Auth,
  type AuthFastifyRequest,
  AuthMiddlewareBuilder,
} from "@v4-company/mars-api/identity";
import {
  ApiBodySchema,
  ApiQueryParamsSchema,
  ApiResponseSchema,
  ApiTag,
  FastifyController,
  Route,
} from "@v4-company/mars-api/server";

import { SignUpUseCase } from "../../app/usecases/SignUpUseCase.ts";
import { SignInUseCase } from "../../app/usecases/SignInUseCase.ts";
import { RefreshTokenUseCase } from "../../app/usecases/RefreshTokenUseCase.ts";
import { ForceVerifyEmailUseCase } from "../../app/usecases/ForceVerifyEmailUseCase.ts";
import { RequestEmailVerificationUseCase } from "../../app/usecases/RequestEmailVerificationUseCase.ts";
import { VerifyEmailUseCase } from "../../app/usecases/VerifyEmailUseCase.ts";
import { RequestPasswordResetUseCase } from "../../app/usecases/RequestPasswordResetUseCase.ts";
import { ConfirmPasswordResetUseCase } from "../../app/usecases/ConfirmPasswordResetUseCase.ts";
import { IntrospectUseCase } from "../../app/usecases/IntrospectUseCase.ts";
import { GetAuthorizationUrlUseCase } from "../../app/usecases/GetAuthorizationUrlUseCase.ts";
import { AuthCallbackUseCase } from "../../app/usecases/AuthCallbackUseCase.ts";
import { IntrospectRequest } from "../../app/dtos/inputs/IntrospectInput.ts";
import { InvalidTokenException } from "../../app/exceptions/InvalidTokenException.ts";
import { GetAuthorizationUrlResponseSchema } from "../../app/dtos/outputs/GetAuthorizationUrlResponse.ts";
import { IntrospectResponseSchema } from "../../app/dtos/outputs/IntrospectResponse.ts";

import {
  GetAuthorizationUrlDTO,
  GetAuthorizationUrlRequest,
  GetAuthorizationUrlSchemaOpenApi,
} from "../../app/dtos/inputs/GetAuthorizationUrlInput.ts";

import {
  SignInDTO,
  SignInRequest,
  SignInSchemaOpenApi,
} from "../../app/dtos/inputs/SignInInput.ts";

import {
  RefreshTokenDTO,
  RefreshTokenRequest,
  RefreshTokenSchemaOpenApi,
} from "../../app/dtos/inputs/RefreshTokenInput.ts";

import {
  type ForceVerifyEmailDTO,
  ForceVerifyEmailRequest,
  ForceVerifyEmailSchemaOpenApi,
} from "../../app/dtos/inputs/ForceVerifyEmailInput.ts";

import {
  type RequestEmailVerificationDTO,
  RequestEmailVerificationRequest,
  RequestEmailVerificationSchemaOpenApi,
} from "../../app/dtos/inputs/RequestEmailVerificationInput.ts";

import {
  type VerifyEmailDTO,
  VerifyEmailRequest,
  VerifyEmailSchemaOpenApi,
} from "../../app/dtos/inputs/VerifyEmailInput.ts";

import {
  type RequestPasswordResetDTO,
  RequestPasswordResetRequest,
  RequestPasswordResetSchemaOpenApi,
} from "../../app/dtos/inputs/RequestPasswordResetInput.ts";

import {
  type ConfirmPasswordResetDTO,
  ConfirmPasswordResetRequest,
  ConfirmPasswordResetSchemaOpenApi,
} from "../../app/dtos/inputs/ConfirmPasswordResetInput.ts";

import {
  type CreateUserDTO,
  CreateUserRequest,
  CreateUserSchemaOpenApi,
} from "../../app/dtos/inputs/CreateUserInput.ts";

import {
  AuthCallbackDTO,
  AuthCallbackRequest,
  AuthCallbackSchemaOpenApi,
} from "../../app/dtos/inputs/AuthCallbackInput.ts";

@injectable()
export class AuthController extends FastifyController {
  private readonly signUpUseCase: SignUpUseCase;
  private readonly signInUseCase: SignInUseCase;
  private readonly refreshTokenUseCase: RefreshTokenUseCase;
  private readonly forceVerifyEmailUseCase: ForceVerifyEmailUseCase;
  private readonly requestEmailVerificationUseCase: RequestEmailVerificationUseCase;
  private readonly verifyEmailUseCase: VerifyEmailUseCase;
  private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase;
  private readonly confirmPasswordResetUseCase: ConfirmPasswordResetUseCase;
  private readonly introspectUseCase: IntrospectUseCase;
  private readonly getAuthorizationUrlUseCase: GetAuthorizationUrlUseCase;
  private readonly authCallbackUseCase: AuthCallbackUseCase;

  constructor(
    @inject(SignUpUseCase)
    signUpUseCase: SignUpUseCase,
    @inject(SignInUseCase)
    signInUseCase: SignInUseCase,
    @inject(RefreshTokenUseCase)
    refreshTokenUseCase: RefreshTokenUseCase,
    @inject(ForceVerifyEmailUseCase)
    forceVerifyEmailUseCase: ForceVerifyEmailUseCase,
    @inject(RequestEmailVerificationUseCase)
    requestEmailVerificationUseCase: RequestEmailVerificationUseCase,
    @inject(VerifyEmailUseCase)
    verifyEmailUseCase: VerifyEmailUseCase,
    @inject(RequestPasswordResetUseCase)
    requestPasswordResetUseCase: RequestPasswordResetUseCase,
    @inject(ConfirmPasswordResetUseCase)
    confirmPasswordResetUseCase: ConfirmPasswordResetUseCase,
    @inject(IntrospectUseCase)
    introspectUseCase: IntrospectUseCase,
    @inject(GetAuthorizationUrlUseCase)
    getAuthorizationUrlUseCase: GetAuthorizationUrlUseCase,
    @inject(AuthCallbackUseCase)
    authCallbackUseCase: AuthCallbackUseCase,
    @inject(AuthMiddlewareBuilder)
    authMiddleware: AuthMiddlewareBuilder,
  ) {
    super(authMiddleware);
    this.signUpUseCase = signUpUseCase;
    this.signInUseCase = signInUseCase;
    this.refreshTokenUseCase = refreshTokenUseCase;
    this.forceVerifyEmailUseCase = forceVerifyEmailUseCase;
    this.requestEmailVerificationUseCase = requestEmailVerificationUseCase;
    this.verifyEmailUseCase = verifyEmailUseCase;
    this.requestPasswordResetUseCase = requestPasswordResetUseCase;
    this.confirmPasswordResetUseCase = confirmPasswordResetUseCase;
    this.introspectUseCase = introspectUseCase;
    this.getAuthorizationUrlUseCase = getAuthorizationUrlUseCase;
    this.authCallbackUseCase = authCallbackUseCase;
  }

  @ApiBodySchema(CreateUserSchemaOpenApi)
  @ApiTag("Auth")
  @Route("post", "/auth/signup")
  async create(
    req: FastifyRequest<{ Body: CreateUserDTO }>,
    reply: FastifyReply,
  ) {
    const signUpRequest = new CreateUserRequest({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: req.body.password,
    });

    return reply
      .send(await this.signUpUseCase.execute(signUpRequest))
      .status(200);
  }

  @ApiBodySchema(SignInSchemaOpenApi)
  @ApiTag("Auth")
  @Route("post", "/auth/signin")
  async signIn(
    request: FastifyRequest<{
      Body: Omit<SignInDTO, "metadata">;
    }>,
    reply: FastifyReply,
  ) {
    const {
      email,
      password,
      organizationId,
      applicationId,
      codeChallenge,
      codeChallengeMethod,
    } = request.body;

    const ipAddress = request.ip;
    const userAgent = request.headers["user-agent"];
    const metadata = {
      ipAddress,
      userAgent,
    };

    const signInUserRequest = new SignInRequest({
      email,
      password,
      organizationId,
      codeChallenge,
      codeChallengeMethod,
      applicationId,
      metadata,
    });

    const response = await this.signInUseCase.execute(signInUserRequest);

    reply.send(response);
  }

  @ApiBodySchema(RefreshTokenSchemaOpenApi)
  @ApiTag("Auth")
  @Route("post", "/auth/refresh")
  async refreshToken(
    request: FastifyRequest<{
      Body: RefreshTokenDTO;
    }>,
    reply: FastifyReply,
  ) {
    const { refreshToken, applicationId, organizationId } = request.body;

    const ipAddress = request.ip;
    const userAgent = request.headers["user-agent"];
    const metadata = {
      ipAddress,
      userAgent,
    };

    const refreshTokenRequest = new RefreshTokenRequest({
      refreshToken,
      applicationId: applicationId || null,
      organizationId: organizationId || null,
      metadata,
    });

    const response =
      await this.refreshTokenUseCase.execute(refreshTokenRequest);

    reply.send(response);
  }

  @ApiTag("Auth")
  @ApiResponseSchema({
    200: IntrospectResponseSchema,
  })
  @Route("post", "/auth/introspect")
  async introspect(request: FastifyRequest, reply: FastifyReply) {
    const token = request.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new InvalidTokenException();
    }

    const introspectRequest = new IntrospectRequest({
      token,
    });

    const response = await this.introspectUseCase.execute(introspectRequest);

    reply.send(response);
  }

  @ApiTag("Auth")
  @ApiQueryParamsSchema(GetAuthorizationUrlSchemaOpenApi)
  @ApiResponseSchema({
    200: GetAuthorizationUrlResponseSchema,
  })
  @Route("get", "/auth/sso")
  async getAuthorizationUrl(
    request: FastifyRequest<{
      Querystmarsai: GetAuthorizationUrlDTO;
    }>,
    reply: FastifyReply,
  ) {
    const { redirectUri, codeChallenge, codeChallengeMethod } = request.query;

    const getAuthorizationUrlRequest = new GetAuthorizationUrlRequest({
      redirectUri,
      codeChallenge,
      codeChallengeMethod,
    });

    const response = await this.getAuthorizationUrlUseCase.execute(
      getAuthorizationUrlRequest,
    );

    reply.send(response);
  }

  @ApiBodySchema(AuthCallbackSchemaOpenApi)
  @ApiTag("Auth")
  @Route("post", "/auth/token")
  async authCallback(
    request: FastifyRequest<{
      Body: AuthCallbackDTO;
    }>,
    reply: FastifyReply,
  ) {
    const ipAddress = request.ip;
    const userAgent = request.headers["user-agent"];
    const metadata = {
      ipAddress,
      userAgent,
    };

    const authCallbackRequest = new AuthCallbackRequest({
      ...request.body,
      metadata,
    });

    const response =
      await this.authCallbackUseCase.execute(authCallbackRequest);

    reply.send(response);
  }

  @ApiBodySchema(RequestEmailVerificationSchemaOpenApi)
  @ApiTag("Auth")
  @Route("post", "/auth/verifications")
  async requestEmailVerification(
    req: FastifyRequest<{ Body: RequestEmailVerificationDTO }>,
    reply: FastifyReply,
  ) {
    const request = new RequestEmailVerificationRequest({
      email: req.body.email,
    });

    // Sending 204 even if the user does not exist, to avoid leaking information
    try {
      await this.requestEmailVerificationUseCase.execute(request);
      return reply.status(204).send();
    } catch (err) {
      logger.info("[AuthController] Error during requestEmailVerification", {
        err,
      });
      return reply.status(204).send();
    }
  }

  @ApiBodySchema(VerifyEmailSchemaOpenApi)
  @ApiTag("Auth")
  @Route("post", "/auth/verifications/confirm")
  async verifyEmail(
    req: FastifyRequest<{ Body: VerifyEmailDTO }>,
    reply: FastifyReply,
  ) {
    const request = new VerifyEmailRequest({
      email: req.body.email,
      code: req.body.code,
    });

    return reply
      .send(await this.verifyEmailUseCase.execute(request))
      .status(200);
  }

  @ApiBodySchema(ForceVerifyEmailSchemaOpenApi)
  @ApiTag("Auth")
  @Auth()
  @Route("post", "/auth/verifications/force")
  async forceVerifyEmail(
    req: AuthFastifyRequest<{ Body: ForceVerifyEmailDTO }>,
    reply: FastifyReply,
  ) {
    const request = new ForceVerifyEmailRequest({
      email: req.body.email,
    });

    return reply
      .send(await this.forceVerifyEmailUseCase.execute(request, req.auth))
      .status(200);
  }

  @ApiBodySchema(RequestPasswordResetSchemaOpenApi)
  @ApiTag("Auth")
  @Route("post", "/auth/password-reset")
  async requestPasswordReset(
    req: FastifyRequest<{ Body: RequestPasswordResetDTO }>,
    reply: FastifyReply,
  ) {
    const request = new RequestPasswordResetRequest({
      email: req.body.email,
    });

    await this.requestPasswordResetUseCase.execute(request);

    return reply.status(204).send();
  }

  @ApiBodySchema(ConfirmPasswordResetSchemaOpenApi)
  @ApiTag("Auth")
  @Route("post", "/auth/password-reset/confirm")
  async confirmPasswordReset(
    req: FastifyRequest<{ Body: ConfirmPasswordResetDTO }>,
    reply: FastifyReply,
  ) {
    const ipAddress = req.ip;
    const userAgent = req.headers["user-agent"] || "";
    const metadata = {
      ipAddress,
      userAgent,
    };

    const request = new ConfirmPasswordResetRequest({
      email: req.body.email,
      token: req.body.token,
      newPassword: req.body.newPassword,
    });

    await this.confirmPasswordResetUseCase.execute({
      req: request,
      metadata,
    });

    return reply.status(204).send();
  }
}
