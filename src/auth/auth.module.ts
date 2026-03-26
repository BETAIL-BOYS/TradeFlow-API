import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AdminController } from './admin.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController, AdminController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
