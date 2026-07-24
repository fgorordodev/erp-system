import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../security';
import { AuthService } from './auth.service';
import { CurrentSessionMetadata } from './decorators';
import { LoginDto } from './dto';
import { LoginResponse, type SessionMetadata } from './interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    return this.authService.login(dto, metadata);
  }
}
