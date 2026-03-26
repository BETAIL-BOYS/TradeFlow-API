import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('admin')
@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login for backend dashboard' })
  @ApiResponse({ 
    status: 200, 
    description: 'Admin login successful', 
    schema: { type: 'object', properties: { token: { type: 'string' } } } 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() body: { password: string }) {
    if (!body.password) {
      throw new HttpException('Password is required', HttpStatus.BAD_REQUEST);
    }

    const isValid = await this.authService.verifyAdminPassword(body.password);

    if (!isValid) {
      throw new HttpException('Invalid admin password', HttpStatus.UNAUTHORIZED);
    }

    const token = this.authService.generateAdminJWT();
    return { token };
  }
}
