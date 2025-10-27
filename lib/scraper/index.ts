"use server";

import axios, { AxiosError } from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractDescription, extractPrice } from "../utils";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const REQUEST_TIMEOUT = 30000;

interface ScrapedProduct {
  url: string;
  currency: string;
  image: string;
  title: string;
  currentPrice: number;
  originalPrice: number;
  priceHistory: [];
  discountRate: number;
  category: string;
  reviewsCount: number;
  stars: number;
  isOutOfStock: boolean;
  description: string;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function validateEnv(): { username: string; password: string } {
  const username = process.env.BRIGHT_DATA_USERNAME;
  const password = process.env.BRIGHT_DATA_PASSWORD;

  if (!username || !password) {
    throw new Error("Missing BrightData credentials in environment variables");
  }

  return { username, password };
}

function extractTitle($: cheerio.CheerioAPI): string {
  const selectors = [
    "#productTitle",
    "#title",
    ".product-title-word-break",
    "h1.a-size-large",
    "h1 span#productTitle"
  ];

  for (const selector of selectors) {
    const title = $(selector).text().trim();
    if (title) return title;
  }

  return "";
}

function extractCurrentPrice($: cheerio.CheerioAPI): number {
  return extractPrice(
    $(".priceToPay span.a-price-whole"),
    $(".a-price .a-offscreen"),
    $("#priceblock_ourprice"),
    $("#priceblock_dealprice"),
    $(".a-price-whole"),
    $(".a-button-selected .a-color-base")
  );
}

function extractOriginalPrice($: cheerio.CheerioAPI): number {
  return extractPrice(
    $(".basisPrice .a-offscreen"),
    $(".a-price.a-text-price span.a-offscreen"),
    $("#listPrice"),
    $("#priceblock_ourprice"),
    $(".a-text-price .a-offscreen"),
    $("span.a-price.a-text-price")
  );
}

function extractStockStatus($: cheerio.CheerioAPI): boolean {
  const availabilityText = $("#availability span").text().trim().toLowerCase();
  return (
    availabilityText.includes("unavailable") ||
    availabilityText.includes("out of stock") ||
    availabilityText.includes("currently unavailable")
  );
}

function extractImage($: cheerio.CheerioAPI): string {
  const imageSelectors = [
    "#imgBlkFront",
    "#landingImage",
    "#imageBlock img",
    ".a-dynamic-image"
  ];

  for (const selector of imageSelectors) {
    const dynamicImage = $(selector).attr("data-a-dynamic-image");
    if (dynamicImage) {
      try {
        const imageUrls = Object.keys(JSON.parse(dynamicImage));
        if (imageUrls.length > 0) return imageUrls[0];
      } catch {}
    }

    const src = $(selector).attr("src");
    if (src && src.startsWith("http")) return src;
  }

  return "https://via.placeholder.com/300";
}

function extractDiscount($: cheerio.CheerioAPI): number {
  const discountSelectors = [
    ".savingsPercentage",
    ".a-badge-label",
    "#dealsAccordionRow .a-color-price"
  ];

  for (const selector of discountSelectors) {
    const text = $(selector).text().replace(/[-%]/g, "").trim();
    const discount = parseFloat(text);
    if (!isNaN(discount) && discount > 0) return discount;
  }

  return 0;
}

function extractReviewsCount($: cheerio.CheerioAPI): number {
  const reviewSelectors = [
    "#acrCustomerReviewText",
    "#averageCustomerReviews span.a-size-base",
    "[data-hook='total-review-count']"
  ];

  for (const selector of reviewSelectors) {
    const text = $(selector).text().trim().replace(/[^0-9]/g, "");
    const count = parseInt(text, 10);
    if (!isNaN(count) && count > 0) return count;
  }

  return 0;
}

function extractRating($: cheerio.CheerioAPI): number {
  const ratingSelectors = [
    "#acrPopover .a-size-base",
    "span.a-icon-alt",
    "[data-hook='rating-out-of-text']",
    ".a-star-5 .a-icon-alt"
  ];

  for (const selector of ratingSelectors) {
    const text = $(selector).text().trim();
    const match = text.match(/([0-9.]+)/);
    if (match) {
      const rating = parseFloat(match[1]);
      if (!isNaN(rating) && rating >= 0 && rating <= 5) return rating;
    }
  }

  return 0;
}

function validateScrapedData(data: Partial<ScrapedProduct>): boolean {
  if (!data.title || data.title.length < 3) {
    console.error("Invalid title:", data.title);
    return false;
  }

  if (!data.currentPrice || data.currentPrice <= 0) {
    console.error("Invalid price:", data.currentPrice);
    return false;
  }

  if (!data.image || !data.image.startsWith("http")) {
    console.error("Invalid image URL:", data.image);
    return false;
  }

  return true;
}

async function fetchWithRetry(
  url: string,
  options: any,
  retries = MAX_RETRIES
): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        ...options,
        timeout: REQUEST_TIMEOUT,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive"
        }
      });

      if (response.status === 200 && response.data) {
        return response.data;
      }

      throw new Error(`Invalid response status: ${response.status}`);
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const axiosError = error as AxiosError;

      console.error(`Scraping attempt ${attempt}/${retries} failed:`, {
        url,
        error: axiosError.message,
        status: axiosError.response?.status
      });

      if (isLastAttempt) {
        throw new Error(
          `Failed after ${retries} attempts: ${axiosError.message}`
        );
      }

      await delay(RETRY_DELAY * attempt);
    }
  }

  throw new Error("Unexpected error in fetchWithRetry");
}

export async function scrapeAmazonProduct(
  url: string
): Promise<ScrapedProduct | null> {
  if (!url || !url.includes("amazon")) {
    console.error("Invalid Amazon URL:", url);
    return null;
  }

  try {
    const { username, password } = validateEnv();
    const session_id = Math.floor(Math.random() * 1000000);

    const options = {
      auth: {
        username: `${username}-session-${session_id}`,
        password
      },
      host: "brd.superproxy.io",
      port: 22225,
      rejectUnauthorized: false
    };

    const html = await fetchWithRetry(url, options);
    const $ = cheerio.load(html);

    const title = extractTitle($);
    const currentPrice = extractCurrentPrice($);
    const originalPrice = extractOriginalPrice($);
    const currency = extractCurrency($(".a-price-symbol"));
    const image = extractImage($);
    const isOutOfStock = extractStockStatus($);
    const discountRate = extractDiscount($);
    const description = extractDescription($);
    const reviewsCount = extractReviewsCount($);
    const stars = extractRating($);

    const finalCurrentPrice = currentPrice || originalPrice;
    const finalOriginalPrice = originalPrice || currentPrice;

    const data: ScrapedProduct = {
      url,
      currency: currency || "$",
      image,
      title,
      currentPrice: finalCurrentPrice,
      originalPrice: finalOriginalPrice,
      priceHistory: [],
      discountRate,
      category: "category",
      reviewsCount,
      stars,
      isOutOfStock,
      description,
      lowestPrice: finalCurrentPrice,
      highestPrice: finalOriginalPrice,
      averagePrice: (finalCurrentPrice + finalOriginalPrice) / 2
    };

    if (!validateScrapedData(data)) {
      console.error("Scraped data validation failed for:", url);
      return null;
    }

    return data;
  } catch (error) {
    const err = error as Error;
    console.error("Scraping error:", {
      url,
      error: err.message,
      stack: err.stack
    });
    return null;
  }
}