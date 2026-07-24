import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../security';
import { CurrentSessionMetadata } from './decorators';
import { LoginDto } from './dto';
import { LoginResponse, type SessionMetadata } from './interfaces';
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
}
