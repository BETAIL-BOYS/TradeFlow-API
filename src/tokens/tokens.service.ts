import { Injectable, Logger } from '@nestjs/common';
import { Horizon, Server } from '@stellar/stellar-sdk';

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);
  private readonly server: Server;
  private cachedAssets: any[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Connect to Stellar Horizon Testnet
    this.server = new Server('https://horizon-testnet.stellar.org');
  }

  async searchTokens(searchQuery: string): Promise<{
    message: string;
    searchQuery: string;
    results: any[];
    cached: boolean;
  }> {
    if (!searchQuery) {
      return {
        message: 'No search query provided',
        searchQuery: '',
        results: [],
        cached: false
      };
    }

    // Check if cache is valid
    const currentTime = Date.now();
    const isCacheValid = this.cachedAssets !== null && 
                        (currentTime - this.cacheTimestamp) < this.CACHE_DURATION_MS;

    let assets: any[];
    
    if (isCacheValid) {
      assets = this.cachedAssets;
      this.logger.log('Using cached assets data');
    } else {
      try {
        assets = await this.fetchAssetsFromHorizon();
        this.cachedAssets = assets;
        this.cacheTimestamp = currentTime;
        this.logger.log('Fetched fresh assets from Stellar Horizon API');
      } catch (error) {
        this.logger.error('Failed to fetch assets from Horizon API:', error);
        // Fallback to mock data if API fails
        assets = this.getMockAssets();
      }
    }

    // Filter assets based on search query
    const filteredAssets = assets.filter(asset => 
      asset.asset_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.asset_issuer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.asset_type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      message: `Search results for: ${searchQuery}`,
      searchQuery: searchQuery,
      results: filteredAssets,
      cached: isCacheValid
    };
  }

  private async fetchAssetsFromHorizon(): Promise<any[]> {
    try {
      // Fetch assets from Horizon API
      const assetsResponse = await this.server.assets()
        .limit(20) // Limit to 20 assets for performance
        .call();

      // Transform the data to include relevant information
      return assetsResponse.records.map(asset => ({
        asset_type: asset.asset_type,
        asset_code: asset.asset_code,
        asset_issuer: asset.asset_issuer,
        amount: asset.amount,
        num_accounts: asset.num_accounts,
        flags: asset.flags,
        _links: asset._links
      }));
    } catch (error) {
      this.logger.error('Error fetching assets from Horizon:', error);
      throw error;
    }
  }

  private getMockAssets(): any[] {
    // Fallback mock data that resembles Stellar asset structure
    return [
      {
        asset_type: 'credit_alphanum4',
        asset_code: 'USDC',
        asset_issuer: 'GBBD47F6L3WRUIRDRN4Q3GUMF3VUEQBQO4FSKJ3DFOZQY2E4PWSJD3HU',
        amount: '1000000.0000000',
        num_accounts: 100,
        flags: { auth_required: false, auth_revocable: false }
      },
      {
        asset_type: 'credit_alphanum4',
        asset_code: 'EURT',
        asset_issuer: 'GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S',
        amount: '500000.0000000',
        num_accounts: 50,
        flags: { auth_required: false, auth_revocable: false }
      },
      {
        asset_type: 'credit_alphanum12',
        asset_code: 'TESTUSD',
        asset_issuer: 'GC5SXL4AMDGUCYVQFIOUJDDG2QJGHJQVQIFJ5RJN4722F5QG3XGS5D2',
        amount: '750000.0000000',
        num_accounts: 75,
        flags: { auth_required: false, auth_revocable: false }
      }
    ];
  }

  async getSpecificAsset(assetCode: string, assetIssuer: string): Promise<any> {
    try {
      const assetResponse = await this.server.assets()
        .forCode(assetCode)
        .forIssuer(assetIssuer)
        .call();

      if (assetResponse.records.length === 0) {
        throw new Error(`Asset ${assetCode} from issuer ${assetIssuer} not found`);
      }

      return assetResponse.records[0];
    } catch (error) {
      this.logger.error(`Error fetching asset ${assetCode}:`, error);
      throw error;
    }
  }
}
