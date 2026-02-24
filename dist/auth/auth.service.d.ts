export declare class AuthService {
    private readonly jwtSecret;
    private readonly jwtExpiration;
    generateNonce(): string;
    verifySignature(publicKey: string, signature: string, nonce: string): Promise<boolean>;
    generateJWT(publicKey: string): string;
    verifyJWT(token: string): any;
}
