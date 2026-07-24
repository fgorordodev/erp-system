import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../security';
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
  @ApiOperation({
    summary: 'Authenticate a user',
  })
  @ApiOkResponse({
    description: 'User authenticated successfully',
  })
  login(
    @Body() dto: LoginDto,
    @CurrentSessionMetadata() metadata: SessionMetadata,
  ): Promise<LoginResponse> {
    return this.authenticationService.login(dto, metadata);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({
    summary: 'Rotate refresh token and issue a new token pair',
  })
  @ApiOkResponse({
    description: 'Tokens refreshed successfully',
  })
  refresh(@Body() dto: RefreshDto): Promise<TokenPair> {
    return this.authenticationService.refresh(dto);
  }
}
