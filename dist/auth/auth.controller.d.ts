import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getChallenge(): {
        nonce: string;
    };
    login(body: {
        publicKey: string;
        signature: string;
        nonce: string;
    }): Promise<{
        token: string;
    }>;
}
