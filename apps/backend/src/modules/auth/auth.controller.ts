import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  ApiInternalError,
  ApiOkEnvelope,
  ApiProtectedErrors,
  ApiValidationError,
  ApiErrorResponseDto,
} from '@backend/common';
import { CurrentSessionMetadata } from '@backend/modules/auth/decorators';
import {
  LoginDto,
  LoginResponseDto,
  RefreshDto,
  TokenPairResponseDto,
} from '@backend/modules/auth/dto';
import { AuthenticationService } from '@backend/modules/auth/services';
import { type AuthenticatedUser, CurrentUser, Public } from '@backend/security';
import type { SessionMetadata } from './interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authenticationService: AuthenticationService) {}

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
}
