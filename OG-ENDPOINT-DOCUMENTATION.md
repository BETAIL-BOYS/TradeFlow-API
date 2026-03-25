# OpenGraph Image Generation Endpoint

## Overview
This feature adds a dynamic OpenGraph image generation endpoint that creates beautiful, branded social media preview images for TradeFlow pools when shared on platforms like Twitter, Telegram, and Discord.

## Endpoint Details

### Route
```
GET /api/v1/og/pool/:poolId
```

### Parameters
- `poolId` (string): The unique identifier of the trading pool

### Response
- **Content-Type**: `image/svg+xml`
- **Cache-Control**: `public, max-age=300` (5 minutes)
- **Body**: SVG string formatted as a social media card

## Features

### Dynamic Data Injection
The endpoint injects the following pool data into the SVG template:
- Token pair symbols (e.g., USDC/XLM)
- Total Value Locked (TVL)
- 24h trading volume
- Annual Percentage Rate (APR)

### SVG Template Design
The generated SVG includes:
- **TradeFlow branding** with logo and tagline
- **Dark theme** with gradient background
- **Token pair display** in large, bold text
- **Key metrics** in a styled container:
  - TVL (blue accent)
  - 24h Volume (green accent)
  - APR (orange accent)
- **Decorative elements** (circles and gradients)
- **Footer** with branding and timestamp

### Sample SVG Structure
```xml
<svg width="1200" height="630" viewBox="0 0 1200 630">
  <!-- Background gradient -->
  <!-- TradeFlow branding -->
  <!-- Token pair -->
  <!-- Stats container with TVL, Volume, APR -->
  <!-- Decorative elements -->
  <!-- Footer with timestamp -->
</svg>
```

## Implementation Details

### Files Created
1. `src/og/og.controller.ts` - Controller handling the GET route
2. `src/og/og.service.ts` - Service with SVG generation logic
3. `src/og/og.module.ts` - NestJS module definition
4. `test-og-endpoint.js` - Test file for endpoint validation

### Integration
- Added `OgModule` to `AppModule` imports
- Follows existing codebase patterns and structure
- Uses NestJS decorators for Swagger documentation
- Implements proper error handling and HTTP status codes

### Data Source
Currently uses dummy data as specified:
```javascript
// Example dummy data for pool1
{
  token0Symbol: 'USDC',
  token1Symbol: 'XLM',
  tvl: '$1,234,567',
  volume24h: '$456,789',
  apr: '12.5%'
}
```

## Usage Examples

### Direct Access
```
http://localhost:3000/api/v1/og/pool/pool1
```

### HTML Meta Tags for Social Media
```html
<meta property="og:image" content="https://your-domain.com/api/v1/og/pool/pool1">
<meta property="og:image:type" content="image/svg+xml">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://your-domain.com/api/v1/og/pool/pool1">
```

## Testing

### Manual Testing
1. Start the development server: `npm run start:dev`
2. Access the endpoint in a browser: `http://localhost:3000/api/v1/og/pool/pool1`
3. Verify the SVG renders correctly

### Automated Testing
Run the test file:
```bash
node test-og-endpoint.js
```

### Expected Behavior
- Returns SVG with proper `Content-Type: image/svg+xml` header
- Includes cache headers for performance
- Handles invalid pool IDs with 404 status
- Generates consistent, branded images

## Future Enhancements

### Production Improvements
1. **Real Data Integration**: Connect to actual pool data from database
2. **PNG Generation**: Use Puppeteer for raster image generation if needed
3. **Caching Strategy**: Implement Redis caching for better performance
4. **Customization**: Add theme options or custom branding
5. **Analytics**: Track OG image generation metrics

### Performance Optimizations
1. **SVG Compression**: Minify SVG output
2. **CDN Integration**: Serve via CDN for global performance
3. **Async Generation**: Background processing for complex designs

## Social Media Compatibility

### Twitter/X
- SVG format supported
- 1200x630 aspect ratio optimized
- Proper meta tags for preview

### Discord
- SVG rendering supported
- Large image preview in embeds

### Telegram
- SVG preview supported
- Shows in link previews

## Security Considerations

- Input validation for pool ID parameter
- XSS protection through SVG sanitization
- Rate limiting via existing ThrottlerGuard
- Content-Type headers to prevent MIME-sniffing

## Browser Compatibility

The generated SVG is compatible with:
- Chrome/Chromium (full support)
- Firefox (full support)
- Safari (full support)
- Edge (full support)

## Deployment Notes

- No additional dependencies required
- Works with existing NestJS setup
- Compatible with Docker deployment
- No external services needed for SVG generation
