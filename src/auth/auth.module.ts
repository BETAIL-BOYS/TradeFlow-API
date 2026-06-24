import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AdminController } from './admin.controller';
import { WebhookController } from './webhook.controller';
import { AuthService } from './auth.service';
import { AdminGuard } from './guards/admin.guard';

@Module({
  controllers: [AuthController, AdminController, WebhookController],
  providers: [AuthService, AdminGuard],
  exports: [AuthService, AdminGuard],
})
export class AuthModule {}
