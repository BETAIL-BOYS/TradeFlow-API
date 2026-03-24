import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Tokens')
@Controller('tokens')
export class TokensController {
  
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
  searchTokens(@Query('search') searchQuery: string) {
    if (!searchQuery) {
      return {
        message: 'No search query provided',
        searchQuery: '',
        results: []
      };
    }

    // Simulate a search operation - in a real app this would query a database
    const mockTokens = ['BTC', 'ETH', 'USDT', 'BNB', 'ADA', 'DOT', 'LINK', 'UNI'];
    const filteredTokens = mockTokens.filter(token => 
      token.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      message: `Search results for: ${searchQuery}`,
      searchQuery: searchQuery,
      results: filteredTokens
    };
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
}
