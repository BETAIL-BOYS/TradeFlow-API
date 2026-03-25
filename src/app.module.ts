import { Module } from '@nestjs/common';
import { TokensModule } from './tokens/tokens.module';

@Module({
  imports: [TokensModule],
})
export class AppModule {}
