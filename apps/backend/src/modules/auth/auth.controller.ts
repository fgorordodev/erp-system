import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../security';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { UserResponseDto } from '../users/dto';

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
    type: UserResponseDto,
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
