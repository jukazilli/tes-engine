import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AuthCsrfResponse,
  AuthGenericMessageResponse,
  AuthLoginResponse,
  AuthMeResponse,
  AuthRegisterResponse,
  AuthSessionResponse,
  AuthVerifyEmailResponse,
} from '@tes-engine/shared/contracts';
import { CORRELATION_ID_HEADER } from '../common/middleware/correlation-id.constants';
import { AppConfigService } from '../config/app-config.service';
import { AuthService } from './auth.service';
import {
  AuthCsrfResponseDto,
  AuthForgotPasswordRequestDto,
  AuthGenericMessageResponseDto,
  AuthMeResponseDto,
  AuthResendVerificationRequestDto,
  AuthResetPasswordRequestDto,
  AuthSessionResponseDto,
} from './dto/auth-common.dto';
import { AuthLoginRequestDto, AuthLoginResponseDto } from './dto/auth-login.dto';
import { AuthRegisterRequestDto, AuthRegisterResponseDto } from './dto/auth-register.dto';
import { AuthVerifyEmailRequestDto, AuthVerifyEmailResponseDto } from './dto/auth-verify-email.dto';

interface ApiRequest {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  socket?: { remoteAddress?: string };
}

interface ApiResponse {
  setHeader(name: string, value: string | string[]): void;
}

@ApiTags('Authentication')
@ApiHeader({
  name: CORRELATION_ID_HEADER,
  required: false,
  description: 'Correlation identifier returned in responses and logs.',
})
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly appConfigService: AppConfigService,
  ) {}

  @Post('register')
  @ApiCreatedResponse({ type: AuthRegisterResponseDto })
  async register(
    @Body() body: AuthRegisterRequestDto,
    @Req() request: ApiRequest,
  ): Promise<AuthRegisterResponse> {
    return await this.authService.register(body, this.metadata(request));
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthGenericMessageResponseDto })
  async resendVerification(
    @Body() body: AuthResendVerificationRequestDto,
    @Req() request: ApiRequest,
  ): Promise<AuthGenericMessageResponse> {
    return await this.authService.resendVerification(body.email, this.metadata(request));
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthVerifyEmailResponseDto })
  async verifyEmail(
    @Body() body: AuthVerifyEmailRequestDto,
    @Req() request: ApiRequest,
  ): Promise<AuthVerifyEmailResponse> {
    return await this.authService.verifyEmail(body, this.metadata(request));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthLoginResponseDto, description: 'Sets an HttpOnly session cookie.' })
  async login(
    @Body() body: AuthLoginRequestDto,
    @Req() request: ApiRequest,
    @Res({ passthrough: true }) response: ApiResponse,
  ): Promise<AuthLoginResponse> {
    const result = await this.authService.login(body, this.metadata(request));
    this.setSessionCookie(response, result.sessionToken);
    return result.response;
  }

  @Get('me')
  @ApiOkResponse({ type: AuthMeResponseDto })
  @ApiUnauthorizedResponse({ description: 'Requires a valid session cookie.' })
  async me(@Req() request: ApiRequest): Promise<AuthMeResponse> {
    return await this.authService.currentUser(this.sessionToken(request));
  }

  @Get('csrf')
  @ApiOkResponse({ type: AuthCsrfResponseDto })
  async csrf(@Req() request: ApiRequest): Promise<AuthCsrfResponse> {
    return await this.authService.csrf(this.sessionToken(request));
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Revokes the current session and clears the cookie.' })
  async logout(
    @Req() request: ApiRequest,
    @Res({ passthrough: true }) response: ApiResponse,
    @Headers() headers?: Record<string, string | string[] | undefined>,
  ): Promise<void> {
    await this.authService.logout(
      this.sessionToken(request),
      this.csrfHeader(headers),
      this.metadata(request),
    );
    this.clearSessionCookie(response);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Revokes all sessions for the current user.' })
  async logoutAll(
    @Req() request: ApiRequest,
    @Res({ passthrough: true }) response: ApiResponse,
    @Headers() headers?: Record<string, string | string[] | undefined>,
  ): Promise<void> {
    await this.authService.logoutAll(
      this.sessionToken(request),
      this.csrfHeader(headers),
      this.metadata(request),
    );
    this.clearSessionCookie(response);
  }

  @Get('sessions')
  @ApiOkResponse({ type: [AuthSessionResponseDto] })
  async sessions(@Req() request: ApiRequest): Promise<AuthSessionResponse[]> {
    return await this.authService.listSessions(this.sessionToken(request));
  }

  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Revokes a session owned by the current user.' })
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @Req() request: ApiRequest,
    @Res({ passthrough: true }) response: ApiResponse,
    @Headers() headers?: Record<string, string | string[] | undefined>,
  ): Promise<void> {
    const revokedCurrent = await this.authService.revokeOwnSession(
      this.sessionToken(request),
      this.csrfHeader(headers),
      sessionId,
      this.metadata(request),
    );
    if (revokedCurrent) {
      this.clearSessionCookie(response);
    }
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthGenericMessageResponseDto })
  async forgotPassword(
    @Body() body: AuthForgotPasswordRequestDto,
    @Req() request: ApiRequest,
  ): Promise<AuthGenericMessageResponse> {
    return await this.authService.forgotPassword(body.email, this.metadata(request));
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthGenericMessageResponseDto })
  async resetPassword(
    @Body() body: AuthResetPasswordRequestDto,
    @Req() request: ApiRequest,
  ): Promise<AuthGenericMessageResponse> {
    return await this.authService.resetPassword(body, this.metadata(request));
  }

  private metadata(request: ApiRequest) {
    return {
      ip: request.ip ?? request.socket?.remoteAddress,
      userAgent: this.header(request, 'user-agent'),
      origin: this.header(request, 'origin'),
    };
  }

  private sessionToken(request: ApiRequest): string | undefined {
    const cookieHeader = this.header(request, 'cookie');
    if (!cookieHeader) {
      return undefined;
    }

    const cookieName = this.appConfigService.value.auth.sessionCookieName;
    return cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${cookieName}=`))
      ?.slice(cookieName.length + 1);
  }

  private setSessionCookie(response: ApiResponse, token: string): void {
    const config = this.appConfigService.value.auth;
    const attributes = [
      `${config.sessionCookieName}=${token}`,
      'HttpOnly',
      `Max-Age=${config.sessionTtlSeconds}`,
      'Path=/',
      `SameSite=${this.cookieSameSite(config.sessionSameSite)}`,
    ];
    if (config.sessionSecureCookie) {
      attributes.push('Secure');
    }
    response.setHeader('Set-Cookie', attributes.join('; '));
  }

  private clearSessionCookie(response: ApiResponse): void {
    const config = this.appConfigService.value.auth;
    response.setHeader(
      'Set-Cookie',
      `${config.sessionCookieName}=; HttpOnly; Max-Age=0; Path=/; SameSite=${this.cookieSameSite(config.sessionSameSite)}`,
    );
  }

  private cookieSameSite(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private header(request: ApiRequest, name: string): string | undefined {
    const value = request.headers[name] ?? request.headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  }

  private csrfHeader(
    headers: Record<string, string | string[] | undefined> = {},
  ): string | undefined {
    const headerName = this.appConfigService.value.auth.csrfHeaderName;
    const value = headers[headerName] ?? headers[headerName.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  }
}
