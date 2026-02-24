import { User } from './user.entity';
export declare class Invoice {
    id: number;
    amount: number;
    date: Date;
    customer: string;
    description?: string;
    riskScore: number;
    status: string;
    processedAt: Date;
    user?: User;
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
}
