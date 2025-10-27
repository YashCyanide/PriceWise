# Scraping Quick Reference Card

## 🚀 Quick Start

### Scrape a Product
```typescript
import { scrapeAndStoreProduct } from '@/lib/actions';

const productId = await scrapeAndStoreProduct(amazonUrl);
```

### Run Cron Job
```bash
curl http://localhost:3000/api/cron
```

## ⚙️ Configuration

### Retry Settings
```typescript
// lib/scraper/index.ts
MAX_RETRIES = 3          // Number of retry attempts
RETRY_DELAY = 2000       // Base delay (ms)
REQUEST_TIMEOUT = 30000  // Request timeout (ms)
```

### Batch Settings
```typescript
// app/api/cron/route.ts
BATCH_SIZE = 5                   // Products per batch
DELAY_BETWEEN_BATCHES = 3000     // Delay between batches (ms)
```

## 📊 Performance

| Operation | Time | Success Rate |
|-----------|------|--------------|
| Single Product | 2-5s | 95%+ |
| Batch (5) | 10-15s | 90%+ |
| Cron (20) | 60-90s | 90%+ |

## 🔍 Selectors

### Title (5)
`#productTitle`, `#title`, `.product-title-word-break`, `h1.a-size-large`, `h1 span#productTitle`

### Current Price (6)
`.priceToPay span.a-price-whole`, `.a-price .a-offscreen`, `#priceblock_ourprice`, `#priceblock_dealprice`, `.a-price-whole`, `.a-button-selected .a-color-base`

### Original Price (6)
`.basisPrice .a-offscreen`, `.a-price.a-text-price span.a-offscreen`, `#listPrice`, `#priceblock_ourprice`, `.a-text-price .a-offscreen`, `span.a-price.a-text-price`

### Image (4)
`#imgBlkFront`, `#landingImage`, `#imageBlock img`, `.a-dynamic-image`

### Stock (1)
`#availability span` → checks for "unavailable", "out of stock"

### Discount (3)
`.savingsPercentage`, `.a-badge-label`, `#dealsAccordionRow .a-color-price`

### Reviews (3)
`#acrCustomerReviewText`, `#averageCustomerReviews span.a-size-base`, `[data-hook='total-review-count']`

### Rating (4)
`#acrPopover .a-size-base`, `span.a-icon-alt`, `[data-hook='rating-out-of-text']`, `.a-star-5 .a-icon-alt`

### Description (5)
`#feature-bullets ul li`, `.a-unordered-list .a-list-item`, `.a-expander-content p`, `#productDescription p`, `#aplus .aplus-module`

## ✅ Validation Rules

| Field | Rule |
|-------|------|
| Title | Length ≥ 3 |
| Price | 0 < price < 1,000,000 |
| Image | Starts with "http" |
| Currency | One of: $, €, £, ¥, ₹ |
| Rating | 0 ≤ rating ≤ 5 |
| Description | Max 1000 chars |

## 🐛 Troubleshooting

### All Scrapes Fail
→ Check BrightData credentials in `.env`

### Some Products Fail
→ Amazon changed HTML, update selectors

### Slow Performance
→ Reduce `BATCH_SIZE` or increase `DELAY_BETWEEN_BATCHES`

### IP Blocks
→ Increase `DELAY_BETWEEN_BATCHES`, reduce `BATCH_SIZE`

## 📝 Response Format

### Success
```json
{
  "message": "Scraping completed",
  "total": 15,
  "successful": 14,
  "failed": 1,
  "duration": 45
}
```

### Error
```json
{
  "error": "Failed to process products",
  "details": "Connection timeout",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔐 Environment Variables

```env
BRIGHT_DATA_USERNAME=your_username
BRIGHT_DATA_PASSWORD=your_password
```

## 📊 Log Messages

### Info
- `Starting cron job for X products`
- `Processing batch X/Y`
- `Cron job completed: X/Y successful`

### Warning
- `Failed to scrape: [url]`
- `Failed to update: [url]`

### Error
- `Scraping attempt X/Y failed`
- `Invalid title: ...`
- `Invalid price: ...`

## 🎯 Best Practices

### DO ✅
- Validate URLs before scraping
- Use batch processing
- Monitor logs
- Keep selectors updated

### DON'T ❌
- Scrape too many at once
- Ignore validation errors
- Skip retry logic
- Remove error logging

## 📚 Full Documentation

- [SCRAPING_OPTIMIZATION.md](SCRAPING_OPTIMIZATION.md) - Complete guide
- [OPTIMIZATION_SUMMARY.md](OPTIMIZATION_SUMMARY.md) - Changes overview

---

**Quick Help:** Check logs → Verify .env → Test single URL → Review selectors
