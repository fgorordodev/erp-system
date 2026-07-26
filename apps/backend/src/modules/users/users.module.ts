import { Module } from '@nestjs/common';

import { CryptoModule } from '@backend/crypto';
import { DatabaseModule } from '@backend/database';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from './persistence/user.repository';

@Module({
  imports: [DatabaseModule, CryptoModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}
