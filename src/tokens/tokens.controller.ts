import { Controller, Get, Query, HttpException, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Tokens')
@Controller('api/v1/tokens')
export class TokensController {
  private cachedTokens: string[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
  
  // Hardcoded verified Stellar contract addresses
  private readonly verifiedAddresses = [
    'GBBDN5LQJ3FOJJNGZAKDRJMBJN5P6LIXZ6NFUGZU6J3E3MNJNGHG35TV',
    'GDTNJZK5MHCJKGV6O7G7LXKXVYJU2R2H5N5JQ6LQ5J3E3MNJNGHG35TV',
    'GD5DJQD6K3XV5FJ2RQ7J7LXKXVYJU2R2H5N5JQ6LQ5J3E3MNJNGHG35TV',
    'GA6HCMBLTZS5VYYBCATRBRZB5J2J2F2ZQ5JQ6LQ5J3E3MNJNGHG35TV'
  ];
  
  @Get()
  @ApiOperation({ summary: 'Search for tokens by symbol', description: 'Search for tokens using a symbol query parameter' })
  @ApiQuery({ name: 'search', required: false, description: 'Token symbol to search for' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tokens retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        searchQuery: { type: 'string' },
        results: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid search query' })
  searchTokens(@Query('search') searchQuery: string, @Res() res: Response) {
    // Set Cache-Control header for 5 minutes
    res.set('Cache-Control', 'public, max-age=300');
    
    if (!searchQuery) {
      return res.json({
        message: 'No search query provided',
        searchQuery: '',
        results: []
      });
    }

    // Check if cache is valid (exists and not expired)
    const currentTime = Date.now();
    const isCacheValid = this.cachedTokens !== null && 
                        (currentTime - this.cacheTimestamp) < this.CACHE_DURATION_MS;

    let tokens: string[];
    
    if (isCacheValid) {
      // Use cached tokens
      tokens = this.cachedTokens;
    } else {
      // Cache miss or expired - fetch fresh data
      tokens = ['BTC', 'ETH', 'USDT', 'BNB', 'ADA', 'DOT', 'LINK', 'UNI']; // Simulate database query
      this.cachedTokens = tokens;
      this.cacheTimestamp = currentTime;
    }

    const filteredTokens = tokens.filter(token => 
      token.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return res.json({
      message: `Search results for: ${searchQuery}`,
      searchQuery: searchQuery,
      results: filteredTokens,
      cached: isCacheValid // Include cache status for debugging
    });
  }

  @Get('vulnerable')
  @ApiOperation({ summary: 'Vulnerable endpoint for testing XSS', description: 'This endpoint reflects user input without sanitization (for testing purposes)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search query that will be reflected back' })
  @ApiResponse({ status: 200, description: 'Query reflected back (vulnerable to XSS)' })
  vulnerableEndpoint(@Query('search') searchQuery: string) {
    // This is intentionally vulnerable for testing XSS protection
    const message = searchQuery ? `You searched for: ${searchQuery}` : 'No search query provided';
    
    return {
      message: message,
      searchQuery: searchQuery,
      timestamp: new Date().toISOString()
    };
  }

  @Get('verify/:address')
  @ApiOperation({ summary: 'Verify if a token contract address is whitelisted', description: 'Check if a Stellar contract address is officially verified and safe to trade' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token verification result',
    schema: {
      type: 'object',
      properties: {
        isVerified: { type: 'boolean', example: true },
        riskLevel: { type: 'string', example: 'LOW' }
      }
    }
  })
  verifyToken(@Param('address') address: string) {
    const isVerified = this.verifiedAddresses.includes(address);
    const riskLevel = isVerified ? 'LOW' : 'HIGH';
    
    return {
      isVerified,
      riskLevel
    };
  }
}
