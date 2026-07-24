import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../security';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Authenticate a user',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
