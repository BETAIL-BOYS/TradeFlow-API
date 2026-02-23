import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('challenge')
  @ApiOperation({ summary: 'Get authentication challenge nonce' })
  @ApiResponse({ status: 200, description: 'Nonce generated successfully', schema: { type: 'object', properties: { nonce: { type: 'string' } } } })
  getChallenge() {
    const nonce = this.authService.generateNonce();
    return { nonce };
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate with wallet signature' })
  @ApiResponse({ status: 200, description: 'Authentication successful', schema: { type: 'object', properties: { token: { type: 'string' } } } })
  @ApiResponse({ status: 401, description: 'Invalid signature' })
  @ApiResponse({ status: 400, description: 'Missing required fields' })
  async login(@Body() body: { publicKey: string; signature: string; nonce: string }) {
    const { publicKey, signature, nonce } = body;

    if (!publicKey || !signature || !nonce) {
      throw new HttpException('Missing required fields: publicKey, signature, nonce', HttpStatus.BAD_REQUEST);
    }

    const isValid = await this.authService.verifySignature(publicKey, signature, nonce);

    if (!isValid) {
      throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }

    const token = this.authService.generateJWT(publicKey);
    return { token };
  }
}
