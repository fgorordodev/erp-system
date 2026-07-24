import { Module } from '@nestjs/common';

import { UsersModule } from '../users';
import { AuthController } from './auth.controller';
import {
  AuthenticationService,
  CredentialsService,
  SessionService,
} from './services';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthenticationService, CredentialsService, SessionService],
})
export class AuthModule {}
