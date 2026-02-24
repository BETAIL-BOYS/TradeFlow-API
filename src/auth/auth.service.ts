import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { Keypair } from '@stellar/stellar-sdk';

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
  private readonly jwtExpiration = '1h';

  generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  async verifySignature(publicKey: string, signature: string, nonce: string): Promise<boolean> {
    try {
      const message = `Sign in to TradeFlow with nonce: ${nonce}`;
      const messageBuffer = Buffer.from(message);
      const signatureBuffer = Buffer.from(signature, 'base64');
      
      // Create a keypair from the public key to verify the signature
      const keypair = Keypair.fromPublicKey(publicKey);
      const isValid = keypair.verify(messageBuffer, signatureBuffer);
      
      return isValid;
    } catch (error) {
      return false;
    }
  }

  generateJWT(publicKey: string): string {
    const payload = {
      publicKey,
      sub: publicKey,
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiration,
    });
  }

  verifyJWT(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
