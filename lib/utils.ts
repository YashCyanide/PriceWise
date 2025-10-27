import { PriceHistoryItem, Product } from "@/types";


const Notification = {
  WELCOME: 'WELCOME',
  CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
  LOWEST_PRICE: 'LOWEST_PRICE',
  THRESHOLD_MET: 'THRESHOLD_MET',
}

const THRESHOLD_PERCENTAGE = 40;

export function extractPrice(...elements: any[]): number {
  for (const element of elements) {
    if (!element || typeof element.text !== 'function') continue;

    const priceText = element.text().trim();
    if (!priceText) continue;

    const cleanPrice = priceText.replace(/[^\d.]/g, '');
    if (!cleanPrice) continue;

    const price = parseFloat(cleanPrice);
    if (!isNaN(price) && price > 0 && price < 1000000) {
      return parseFloat(price.toFixed(2));
    }
  }

  return 0;
}

export function extractCurrency(element: any): string {
  if (!element || typeof element.text !== 'function') return "$";

  const currencyText = element.text().trim();
  if (!currencyText) return "$";

  const currencyMap: { [key: string]: string } = {
    '$': '$', '€': '€', '£': '£', '¥': '¥', '₹': '₹'
  };

  const firstChar = currencyText.charAt(0);
  return currencyMap[firstChar] || "$";
}

export function extractDescription($: any): string {
  const selectors = [
    "#feature-bullets ul li",
    ".a-unordered-list .a-list-item",
    ".a-expander-content p",
    "#productDescription p",
    "#aplus .aplus-module"
  ];

  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      const textContent = elements
        .map((_: any, element: any) => $(element).text().trim())
        .get()
        .filter((text: string) => text.length > 0)
        .join("\n");
      
      if (textContent && textContent.length > 10) {
        return textContent.slice(0, 1000);
      }
    }
  }

  return "No description available";
}

export function getHighestPrice(priceList: PriceHistoryItem[]): number {
  if (!priceList || !Array.isArray(priceList) || priceList.length === 0) {
    return 0;
  }

  const prices = priceList
    .map(item => item?.price)
    .filter(price => typeof price === 'number' && !isNaN(price) && price > 0);

  return prices.length > 0 ? Math.max(...prices) : 0;
}

export function getLowestPrice(priceList: PriceHistoryItem[]): number {
  if (!priceList || !Array.isArray(priceList) || priceList.length === 0) {
    return 0;
  }

  const prices = priceList
    .map(item => item?.price)
    .filter(price => typeof price === 'number' && !isNaN(price) && price > 0);

  return prices.length > 0 ? Math.min(...prices) : 0;
}

export function getAveragePrice(priceList: PriceHistoryItem[]): number {
  if (!priceList || !Array.isArray(priceList) || priceList.length === 0) {
    return 0;
  }

  const prices = priceList
    .map(item => item?.price)
    .filter(price => typeof price === 'number' && !isNaN(price) && price > 0);

  if (prices.length === 0) return 0;

  const sumOfPrices = prices.reduce((acc, curr) => acc + curr, 0);
  const averagePrice = sumOfPrices / prices.length;

  return parseFloat(averagePrice.toFixed(2));
}


/**
 * Determines which type of email notification should be sent based on product changes
 * @param scrapedProduct - Newly scraped product data
 * @param currentProduct - Existing product data from database
 * @returns Notification type or null if no notification needed
 */
export const getEmailNotifType = (
  scrapedProduct: Product,
  currentProduct: Product
): keyof typeof Notification | null => {
  const lowestPrice = getLowestPrice(currentProduct.priceHistory);

  if (scrapedProduct.currentPrice < lowestPrice) {
    return Notification.LOWEST_PRICE as keyof typeof Notification;
  }
  if (!scrapedProduct.isOutOfStock && currentProduct.isOutOfStock) {
    return Notification.CHANGE_OF_STOCK as keyof typeof Notification;
  }
  if (scrapedProduct.discountRate >= THRESHOLD_PERCENTAGE) {
    return Notification.THRESHOLD_MET as keyof typeof Notification;
  }

  return null;
};

/**
 * Formats a number as a currency string with 2 decimal places
 * @param num - Number to format
 * @returns Formatted string (e.g., "1,234.56")
 */
export const formatNumber = (num: number = 0): string => {
  if (isNaN(num)) {
    return '0.00';
  }
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};