import { Module } from '@nestjs/common';

import { CryptoModule } from '@backend/crypto';
import { DatabaseModule } from '@backend/database';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule, CryptoModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
