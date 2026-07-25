import { Global, Module } from '@nestjs/common';

import { SecurityJwtModule } from './jwt';

@Global()
@Module({
  imports: [SecurityJwtModule],
  exports: [SecurityJwtModule],
})
export class SecurityModule {}
