import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Trade, Pool, Token } from '@prisma/client';

@Injectable()
export class TradeService {
  constructor(private prisma: PrismaService) {}

  async createTrade(data: {
    poolId: string;
    userAddress: string;
    amountIn: string;
    amountOut: string;
  }): Promise<Trade> {
    return this.prisma.trade.create({
      data: {
        ...data,
        timestamp: new Date(),
      },
    });
  }

  async getTradesByUser(userAddress: string): Promise<Trade[]> {
    return this.prisma.trade.findMany({
      where: {
        userAddress,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async getTradesByPool(poolId: string): Promise<Trade[]> {
    return this.prisma.trade.findMany({
      where: {
        poolId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async getAllTrades(): Promise<Trade[]> {
    return this.prisma.trade.findMany({
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async createPool(data: {
    address: string;
    tokenA: string;
    tokenB: string;
    fee: string;
  }): Promise<Pool> {
    return this.prisma.pool.create({
      data,
    });
  }

  async getPoolByAddress(address: string): Promise<Pool | null> {
    return this.prisma.pool.findUnique({
      where: {
        address,
      },
      include: {
        trades: true,
      },
    });
  }

  async createToken(data: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  }): Promise<Token> {
    return this.prisma.token.create({
      data,
    });
  }

  async getTokenByAddress(address: string): Promise<Token | null> {
    return this.prisma.token.findUnique({
      where: {
        address,
      },
    });
  }
}
