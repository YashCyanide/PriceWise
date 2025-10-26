import { PriceHistoryItem, Product } from "@/types";


const Notification = {
  WELCOME: 'WELCOME',
  CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
  LOWEST_PRICE: 'LOWEST_PRICE',
  THRESHOLD_MET: 'THRESHOLD_MET',
}

const THRESHOLD_PERCENTAGE = 40;

// Extracts and returns the price from a list of possible elements.

export function extractPrice(...elements: any[]): number {
  for (const element of elements) {
    const priceText = element.text().trim();

    if (priceText) {
      const cleanPrice = priceText.replace(/[^\d.]/g, '');
      const price = parseFloat(cleanPrice);

      if (!isNaN(price) && price > 0) {
        return parseFloat(price.toFixed(2));
      }
    }
  }

  return 0;
}

// Extracts and returns the currency symbol from an element.
export function extractCurrency(element: any): string {
  const currencyText = element.text().trim().slice(0, 1);
  return currencyText || "$";
}

// Extracts description from two possible elements from amazon
export function extractDescription($: any): string {
  const selectors = [
    ".a-unordered-list .a-list-item",
    ".a-expander-content p",
    "#feature-bullets ul li",
  ];

  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      const textContent = elements
        .map((_: any, element: any) => $(element).text().trim())
        .get()
        .join("\n");
      if (textContent) {
        return textContent;
      }
    }
  }

  return "No description available";
}

export function getHighestPrice(priceList: PriceHistoryItem[]): number {
  if (!priceList || priceList.length === 0) {
    return 0;
  }

  return Math.max(...priceList.map(item => item.price));
}

export function getLowestPrice(priceList: PriceHistoryItem[]): number {
  if (!priceList || priceList.length === 0) {
    return 0;
  }

  return Math.min(...priceList.map(item => item.price));
}

export function getAveragePrice(priceList: PriceHistoryItem[]): number {
  if (!priceList || priceList.length === 0) {
    return 0;
  }

  const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
  const averagePrice = sumOfPrices / priceList.length;

  return parseFloat(averagePrice.toFixed(2));
}


export const getEmailNotifType = (
  scrapedProduct: Product,
  currentProduct: Product
) => {
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

export const formatNumber = (num: number = 0): string => {
  if (isNaN(num)) {
    return '0.00';
  }
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};