# AI Features & Price History Guide

## New Features Added

### 1. AI-Powered Description Summarization
- Uses Hugging Face's free BART model for text summarization
- Automatically summarizes long product descriptions into concise paragraphs
- Fallback to 200-character truncation if API key not configured

### 2. Price History Chart
- Interactive line chart showing price changes over time
- Uses Recharts library for visualization
- Displays only when multiple price points exist
- Shows date/time for each price point

### 3. Real Data Display
- Removed hardcoded "93% of buyers" text
- Heart icon now shows actual number of users tracking the product
- Star rating displays actual Amazon rating (or hidden if 0)
- Review count shows actual Amazon reviews (or hidden if 0)

## Setup Instructions

### Get Hugging Face API Key (Free)

1. Go to [https://huggingface.co/](https://huggingface.co/)
2. Sign up for a free account
3. Navigate to Settings → Access Tokens
4. Click "New token"
5. Give it a name (e.g., "PriceWise")
6. Select "Read" permission
7. Click "Generate token"
8. Copy the token

### Add to Environment

Add to your `.env` file:
```env
HUGGINGFACE_API_KEY=hf_your_token_here
```

### How It Works

#### AI Summarization
```typescript
// Automatically called on product details page
const summarizedDescription = await summarizeDescription(product.description);
```

- Takes full product description
- Sends to Hugging Face BART model
- Returns 50-150 word summary
- Falls back to truncation if API fails

#### Price History Chart
```typescript
<PriceHistoryChart 
  priceHistory={product.priceHistory} 
  currency={product.currency}
/>
```

- Renders interactive line chart
- Shows price trends over time
- Tooltip displays exact price on hover
- Only shows when 2+ price points exist

#### Real Metrics
```typescript
// Users tracking this product
{product.users && product.users.length > 0 && (
  <div className="product-hearts">
    <p>{product.users.length}</p>
  </div>
)}

// Actual star rating
{product.stars > 0 && (
  <p>{product.stars.toFixed(1)}</p>
)}

// Actual review count
{product.reviewsCount > 0 && (
  <p>{product.reviewsCount.toLocaleString()} Reviews</p>
)}
```

## Testing

### Test AI Summarization

1. Add a product with long description
2. View product details page
3. Description should be summarized to 1-2 paragraphs

**Note**: First API call may take 20 seconds (model loading)

### Test Price History Chart

1. Add a product
2. Wait for cron job to run (or manually trigger `/api/cron`)
3. Price history will accumulate over time
4. Chart appears after 2+ price points

### Test Real Metrics

1. **User Tracking**: Add email to track product
   - Heart icon shows count of tracking users
   
2. **Star Rating**: Scrapes from Amazon
   - Shows actual rating (e.g., 4.5)
   - Hidden if no rating available
   
3. **Review Count**: Scrapes from Amazon
   - Shows actual count (e.g., 1,234 Reviews)
   - Hidden if no reviews available

## API Limits

### Hugging Face Free Tier
- 30,000 requests/month
- Rate limit: ~1 request/second
- First request may take 20s (cold start)

### Recommendations
- Cache summaries in database (future enhancement)
- Only summarize on first view
- Consider upgrading for high traffic

## Troubleshooting

### AI Summarization Not Working
1. Check API key is correct
2. Verify internet connection
3. Wait 20 seconds for first request
4. Check console for errors
5. Fallback will show truncated text

### Chart Not Showing
1. Verify product has 2+ price points
2. Check `priceHistory` array in database
3. Ensure dates are being saved
4. Run cron job to add price points

### Metrics Showing 0
1. **Stars/Reviews**: Amazon may not have data
2. **User Count**: No one tracking yet
3. Check scraper is extracting data correctly

## Future Enhancements

- Cache AI summaries in database
- Add more chart types (bar, area)
- Show price drop percentage
- Add price alerts threshold visualization
- Compare prices across similar products
