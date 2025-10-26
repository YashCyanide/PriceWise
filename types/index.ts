/**
 * Represents a single price point in the product's price history
 */
export type PriceHistoryItem = {
  price: number;
  date?: Date;
};

/**
 * Represents a user tracking a product
 */
export type User = {
  email: string;
};

/**
 * Complete product information including tracking data
 */
export type Product = {
  _id?: string;
  url: string;
  currency: string;
  image: string;
  title: string;
  currentPrice: number;
  originalPrice: number;
  priceHistory: PriceHistoryItem[];
  highestPrice: number;
  lowestPrice: number;
  averagePrice: number;
  discountRate: number;
  description: string;
  category: string;
  reviewsCount: number;
  stars: number;
  isOutOfStock: boolean;
  users?: User[];
};

/**
 * Types of email notifications sent to users
 */
export type NotificationType =
  | "WELCOME"
  | "CHANGE_OF_STOCK"
  | "LOWEST_PRICE"
  | "THRESHOLD_MET";

/**
 * Email content structure for notifications
 */
export type EmailContent = {
  subject: string;
  body: string;
};

/**
 * Minimal product info needed for email notifications
 */
export type EmailProductInfo = {
  title: string;
  url: string;
};

/**
 * Product data from scraping (before database storage)
 */
export type ScrapedProduct = Omit<Product, '_id' | 'users'>;

/**
 * Next.js dynamic route params for product pages
 */
export type ProductParams = {
  params: { id: string };
};