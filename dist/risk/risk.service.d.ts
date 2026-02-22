export declare class RiskService {
    private readonly LCG_A;
    private readonly LCG_C;
    private readonly LCG_M;
    calculateScore(amount: number, date: Date): number;
    private validateInputs;
    private generateSeed;
    private seededRandom;
}
