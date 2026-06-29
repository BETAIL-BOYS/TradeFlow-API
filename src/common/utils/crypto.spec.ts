import { encryptBuffer, decryptBuffer } from './crypto';

describe('Document Cryptographic Round-Trip Integrity Matrix', () => {
  beforeAll(() => {
    // Set mock local environment key variables for isolation context
    process.env.TRADEFLOW_ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  });

  it('should successfully encrypt and decrypt raw buffers natively in system memory without layout data leakage', () => {
    const rawSecretMessage = 'TradeFlow Confidential Real World Asset (RWA) KYC Data Payload.';
    const bufferData = Buffer.from(rawSecretMessage, 'utf-8');

    // 1. Run server-side memory encryption
    const encrypted = encryptBuffer(bufferData);

    expect(encrypted.iv).toBeDefined();
    expect(encrypted.authTag).toBeDefined();
    expect(encrypted.ciphertext.toString('utf-8')).not.toBe(rawSecretMessage); // Data is safely obfuscated

    // 2. Run matching decryption
    const decryptedBuffer = decryptBuffer(encrypted.ciphertext, encrypted.iv, encrypted.authTag);
    const decryptedMessage = decryptedBuffer.toString('utf-8');

    // 3. Assert full data fidelity recovery
    expect(decryptedMessage).toBe(rawSecretMessage);
  });
});