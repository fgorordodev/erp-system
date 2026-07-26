import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PasswordResetService } from './services/password-reset.service';

import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './types/authenticated-user.type';
import { CurrentSessionMetadata } from './decorators/session-metadata.decorator';
import { AuthenticationService } from './services/authentication.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { SessionMetadata } from './interfaces/session-metadata.interface';
import { TokenPairResponseDto } from './dto/token-pair-response.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  ApiErrorResponseDto,
  ApiInternalError,
  ApiOkEnvelope,
  ApiProtectedErrors,
  ApiValidationError,
} from '@backend/common';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate a user',
    description:
      'Validates email/password credentials, creates a persistent session and returns an access token plus a one-time refresh token.',
  })
  @ApiOkEnvelope({
    description: 'Authentication succeeded and a session was created.',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Credentials are invalid or the account is disabled.',
    type: ApiErrorResponseDto,
  })
  @ApiValidationError()
  @ApiInternalError()
  login(
    @Body() dto: LoginDto,
    @CurrentSessionMetadata() metadata: SessionMetadata,
  ): Promise<LoginResponseDto> {
    return this.authenticationService.login(dto, metadata);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate a refresh token',
    description:
      'Consumes the supplied refresh token exactly once and returns a new access/refresh token pair. Invalid, expired or reused tokens are rejected.',
  })
  @ApiOkEnvelope({
    description: 'The refresh token was rotated successfully.',
    type: TokenPairResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'The refresh token is invalid, expired, revoked or reused.',
    type: ApiErrorResponseDto,
  })
  @ApiValidationError()
  @ApiInternalError()
  refresh(@Body() dto: RefreshDto): Promise<TokenPairResponseDto> {
    return this.authenticationService.refresh(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Log out the current session',
    description:
      'Revokes the authenticated persistent session and every refresh token in that session.',
  })
  @ApiNoContentResponse({
    description: 'Session revoked successfully. No response body is returned.',
  })
  @ApiProtectedErrors()
  @ApiInternalError()
  async logout(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.authenticationService.logout(user.sessionId);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Reset account password',
  })
  @ApiNoContentResponse({
    description: 'Password successfully reset.',
  })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.passwordResetService.reset(dto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Request a password reset',
  })
  @ApiNoContentResponse({
    description:
      'The request was accepted regardless of whether the account exists.',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    await this.passwordResetService.request(dto.email);
  }
}
