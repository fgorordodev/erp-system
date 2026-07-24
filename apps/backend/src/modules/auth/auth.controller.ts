import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiNoContentResponse, ApiTags } from '@nestjs/swagger';

import { type AuthenticatedUser, CurrentUser, Public } from '../../security';
import { CurrentSessionMetadata } from './decorators';
import { LoginDto, RefreshDto } from './dto';
import { LoginResponse, TokenPair, type SessionMetadata } from './interfaces';
import { AuthenticationService } from './services';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Public()
  @Post('login')
  login(
    @Body() dto: LoginDto,
    @CurrentSessionMetadata() metadata: SessionMetadata,
  ): Promise<LoginResponse> {
    return this.authenticationService.login(dto, metadata);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshDto): Promise<TokenPair> {
    return this.authenticationService.refresh(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Session revoked successfully',
  })
  async logout(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.authenticationService.logout(user.sessionId);
  }
}
