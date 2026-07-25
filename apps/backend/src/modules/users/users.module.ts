import { Module } from '@nestjs/common';

import { CryptoModule } from '@backend/crypto';
import { DatabaseModule } from '@backend/database';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './persistence';

@Module({
  imports: [DatabaseModule, CryptoModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
