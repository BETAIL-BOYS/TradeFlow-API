import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AdminController } from './admin.controller';
import { WebhookController } from './webhook.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController, AdminController, WebhookController],
  providers: [AuthService],
  exports: [AuthService], // Export for middleware use
})
export class AuthModule {}
