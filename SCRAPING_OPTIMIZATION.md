# Scraping Optimization Guide

## Overview
The scraping system has been optimized for robustness, reliability, and better error handling.

## Key Improvements

### 1. **Retry Logic with Exponential Backoff**
- Automatic retry on failure (up to 3 attempts)
- Exponential delay between retries (2s, 4s, 6s)
- Prevents temporary network issues from causing failures

### 2. **Multiple Selector Fallbacks**
Each data point now has multiple CSS selectors as fallbacks:

#### Title Extraction
```typescript
- #productTitle
- #title
- .product-title-word-break
- h1.a-size-large
- h1 span#productTitle
```

#### Price Extraction (Current)
```typescript
- .priceToPay span.a-price-whole
- .a-price .a-offscreen
- #priceblock_ourprice
- #priceblock_dealprice
- .a-price-whole
- .a-button-selected .a-color-base
```

#### Price Extraction (Original)
```typescript
- .basisPrice .a-offscreen
- .a-price.a-text-price span.a-offscreen
- #listPrice
- #priceblock_ourprice
- .a-text-price .a-offscreen
- span.a-price.a-text-price
```

#### Image Extraction
```typescript
- #imgBlkFront
- #landingImage
- #imageBlock img
- .a-dynamic-image
```

#### Stock Status
```typescript
- Checks for: "unavailable", "out of stock", "currently unavailable"
```

#### Discount Rate
```typescript
- .savingsPercentage
- .a-badge-label
- #dealsAccordionRow .a-color-price
```

#### Reviews Count
```typescript
- #acrCustomerReviewText
- #averageCustomerReviews span.a-size-base
- [data-hook='total-review-count']
```

#### Rating
```typescript
- #acrPopover .a-size-base
- span.a-icon-alt
- [data-hook='rating-out-of-text']
- .a-star-5 .a-icon-alt
```

### 3. **Enhanced Data Validation**
- Validates title length (minimum 3 characters)
- Validates price is positive and reasonable (< $1,000,000)
- Validates image URL format
- Filters invalid data before storage

### 4. **Better Error Handling**
- Detailed error logging with context
- Graceful degradation (returns null instead of crashing)
- Specific error messages for debugging
- Stack trace logging for critical errors

### 5. **Request Optimization**
- 30-second timeout per request
- Proper HTTP headers (User-Agent, Accept, etc.)
- Connection keep-alive
- GZIP compression support

### 6. **Utility Function Improvements**
- Array validation before operations
- NaN and null checks
- Price range validation (0 < price < 1,000,000)
- Currency symbol mapping for common currencies
- Description length limiting (max 1000 chars)

### 7. **Cron Job Optimization**
- Batch processing (5 products at a time)
- 3-second delay between batches
- Rate limiting to avoid IP blocks
- Promise.allSettled for parallel processing
- Detailed progress logging
- Performance metrics (duration, success rate)

## Configuration

### Environment Variables
```env
BRIGHT_DATA_USERNAME=your_username
BRIGHT_DATA_PASSWORD=your_password
```

### Adjustable Parameters

#### Scraper (`lib/scraper/index.ts`)
```typescript
const MAX_RETRIES = 3;           // Number of retry attempts
const RETRY_DELAY = 2000;        // Base delay between retries (ms)
const REQUEST_TIMEOUT = 30000;   // Request timeout (ms)
```

#### Cron Job (`app/api/cron/route.ts`)
```typescript
const BATCH_SIZE = 5;                    // Products per batch
const DELAY_BETWEEN_BATCHES = 3000;      // Delay between batches (ms)
```

## Error Handling Flow

```
1. Validate URL
   ↓
2. Validate Environment Variables
   ↓
3. Attempt Scraping (with retries)
   ↓
4. Parse HTML with Cheerio
   ↓
5. Extract Data (multiple selectors)
   ↓
6. Validate Extracted Data
   ↓
7. Return Result or null
```

## Best Practices

### 1. **URL Validation**
Always validate Amazon URLs before scraping:
```typescript
if (!url || !url.includes('amazon')) {
  return null;
}
```

### 2. **Null Checks**
Check for null/undefined before operations:
```typescript
if (!element || typeof element.text !== 'function') return "$";
```

### 3. **Array Validation**
Validate arrays before using array methods:
```typescript
if (!priceList || !Array.isArray(priceList) || priceList.length === 0) {
  return 0;
}
```

### 4. **Price Validation**
Ensure prices are reasonable:
```typescript
if (!isNaN(price) && price > 0 && price < 1000000) {
  return parseFloat(price.toFixed(2));
}
```

### 5. **Graceful Degradation**
Return sensible defaults instead of throwing errors:
```typescript
return {
  currency: currency || "$",
  stars: stars || 0,
  reviewsCount: reviewsCount || 0
};
```

## Monitoring & Debugging

### Log Levels

#### Info Logs
- Batch processing progress
- Successful scrapes
- Performance metrics

#### Warning Logs
- Failed scrape attempts
- Missing data fields
- Validation failures

#### Error Logs
- Network errors
- Database errors
- Critical failures

### Example Log Output
```
Starting cron job for 15 products
Processing batch 1/3
Scraping attempt 1/3 failed: { url: '...', error: 'timeout' }
Scraping attempt 2/3 succeeded
Processing batch 2/3
Cron job completed: 14/15 successful in 45s
```

## Performance Metrics

### Expected Performance
- Single product scrape: 2-5 seconds
- Batch of 5 products: 10-15 seconds
- 20 products (4 batches): 60-90 seconds

### Optimization Tips
1. Increase `BATCH_SIZE` for faster processing (risk: IP blocks)
2. Decrease `DELAY_BETWEEN_BATCHES` for speed (risk: rate limiting)
3. Reduce `MAX_RETRIES` for faster failures
4. Increase `REQUEST_TIMEOUT` for slow connections

## Troubleshooting

### Issue: All scrapes failing
**Solution:** Check BrightData credentials and proxy status

### Issue: Intermittent failures
**Solution:** Increase retry count or delay between batches

### Issue: Missing data fields
**Solution:** Check if Amazon changed their HTML structure, update selectors

### Issue: Slow performance
**Solution:** Reduce batch size or increase parallel processing

### Issue: IP blocks
**Solution:** Increase delay between batches, reduce batch size

## Future Improvements

1. **Dynamic Selector Discovery**
   - Automatically detect new selectors
   - Machine learning for selector optimization

2. **Caching Layer**
   - Cache recently scraped products
   - Reduce redundant requests

3. **Health Monitoring**
   - Real-time scraping success rate
   - Alert system for failures

4. **A/B Testing**
   - Test different selector combinations
   - Optimize for success rate

5. **Distributed Scraping**
   - Multiple proxy providers
   - Load balancing across regions

## Security Considerations

1. **Never commit credentials**
2. **Rotate proxy sessions**
3. **Respect robots.txt**
4. **Implement rate limiting**
5. **Monitor for IP blocks**
6. **Use HTTPS only**
7. **Validate all inputs**
8. **Sanitize scraped data**

## API Response Format

### Success Response
```json
{
  "message": "Scraping completed",
  "total": 15,
  "successful": 14,
  "failed": 1,
  "duration": 45
}
```

### Error Response
```json
{
  "error": "Failed to process products",
  "details": "Connection timeout",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Testing

### Manual Testing
```bash
# Test single product scrape
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.amazon.com/dp/B08N5WRWNW"}'

# Test cron job
curl http://localhost:3000/api/cron
```

### Validation Checklist
- [ ] Title extracted correctly
- [ ] Current price is valid number
- [ ] Original price is valid number
- [ ] Image URL is valid
- [ ] Stock status is boolean
- [ ] Currency symbol is correct
- [ ] Discount rate is percentage
- [ ] Description is not empty
- [ ] Reviews count is number
- [ ] Rating is between 0-5

## Support

For issues or questions:
1. Check logs for error details
2. Verify environment variables
3. Test with known working Amazon URL
4. Review selector updates in Amazon's HTML
5. Check BrightData proxy status

---

**Last Updated:** 2024
**Version:** 2.0
