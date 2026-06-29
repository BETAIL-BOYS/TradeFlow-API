import * as nodeCrypto from 'crypto'; // Changed to namespace import to bypass Jest resolver stubs

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

// Strict environment key validation guardrail, checked once at module load.
const MASTER_KEY_HEX = process.env.TRADEFLOW_ENCRYPTION_KEY;
if (!MASTER_KEY_HEX || Buffer.from(MASTER_KEY_HEX, 'hex').length !== 32) {
  throw new Error('CRITICAL: TRADEFLOW_ENCRYPTION_KEY must be a valid 32-byte hex string.');
}
const MASTER_KEY = Buffer.from(MASTER_KEY_HEX, 'hex');

export interface EncryptedArtifact {
  ciphertext: Buffer;
  iv: string;
  authTag: string;
}

/**
 * Encrypts a Buffer using AES-256-GCM.
 * @param buffer The data to encrypt.
 * @returns An object containing the ciphertext, IV, and authentication tag.
 */
export function encryptBuffer(buffer: Buffer): EncryptedArtifact {
  const iv = nodeCrypto.randomBytes(IV_LENGTH);
  const cipher = nodeCrypto.createCipheriv(ALGORITHM, MASTER_KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}
/**
 * Decrypts a Buffer using AES-256-GCM.
 * @param ciphertext The encrypted data.
 * @param ivHex The Initialization Vector in hex format.
 * @param authTagHex The authentication tag in hex format.
 * @returns The decrypted data as a Buffer.
 */
export function decryptBuffer(ciphertext: Buffer, ivHex: string, authTagHex: string): Buffer {
  const decipher = nodeCrypto.createDecipheriv(
    ALGORITHM,
    MASTER_KEY,
    Buffer.from(ivHex, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}