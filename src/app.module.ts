import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { IndexerService } from './indexer.service';

@Module({
  imports: [HealthModule],
  controllers: [AppController],
  providers: [AppService, IndexerService],
})
export class AppModule {}
