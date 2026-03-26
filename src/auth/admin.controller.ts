import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('admin')
@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login with password' })
  @ApiResponse({ status: 200, description: 'Login successful', schema: { type: 'object', properties: { token: { type: 'string' } } } })
  @ApiResponse({ status: 401, description: 'Invalid password' })
  async adminLogin(@Body() body: { password: string }) {
    const { password } = body;

    if (!password) {
      throw new HttpException('Password is required', HttpStatus.BAD_REQUEST);
    }

    const isValid = await this.authService.verifyAdminPassword(password);

    if (!isValid) {
      throw new HttpException('Invalid admin credentials', HttpStatus.UNAUTHORIZED);
    }

    const token = this.authService.generateAdminJWT();
    return { token };
  }
}
