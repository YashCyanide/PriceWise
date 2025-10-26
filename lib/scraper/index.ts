// from github gist (above code is working fine)

"use server";

import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractDescription, extractPrice } from "../utils";
import { ScrapedProduct } from "@/types";

/**
 * Validates if a URL is a valid Amazon product URL
 * @param url - URL to validate
 * @returns true if valid Amazon URL, false otherwise
 */
const isValidAmazonUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    return hostname.includes('amazon.com') || hostname.includes('amazon.');
  } catch {
    return false;
  }
};

/**
 * Scrapes product information from an Amazon product page
 * @param url - Amazon product URL to scrape
 * @returns Scraped product data or null if scraping fails
 * @throws {Error} If URL is invalid or credentials are missing
 */
export async function scrapeAmazonProduct(url: string): Promise<ScrapedProduct | null> {
  if (!url || !isValidAmazonUrl(url)) {
    throw new Error('Invalid Amazon URL');
  }

  const username = process.env.BRIGHT_DATA_USERNAME;
  const password = process.env.BRIGHT_DATA_PASSWORD;

  if (!username || !password) {
    throw new Error('BrightData credentials not configured');
  }
  const port = 22225;
  const sessionId = Math.floor(1000000 * Math.random());

  try {
    const response = await axios.get(url, {
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false,
      }),
      proxy: {
        protocol: 'http',
        host: 'brd.superproxy.io',
        port: port,
        auth: {
          username: `${username}-session-${sessionId}`,
          password: password,
        },
      },
      timeout: 15000,
    });
    const $ = cheerio.load(response.data);

    const title = $("#productTitle").text().trim();
    if (!title) {
      throw new Error('Product title not found');
    }

    const currentPrice = extractPrice(
      $(".priceToPay span.a-price-whole"),
      $(".a-size-base.a-color-price"),
      $(".a-button-selected .a-color-base")
    );

    const originalPrice = extractPrice(
      $("#priceblock_ourprice"),
      $(".a-price.a-text-price span.a-offscreen"),
      $(".basisPrice"),
      $("#listPrice"),
      $("#priceblock_dealprice"),
      $(".a-size-base.a-color-price")
    );

    const outOfStock =
      $("#availability span").text().trim().toLowerCase() ===
      "currently unavailable";

    const images =
      $("#imgBlkFront").attr("data-a-dynamic-image") ||
      $("#landingImage").attr("data-a-dynamic-image") ||
      "{}";

    const imageUrls = Object.keys(JSON.parse(images));
    const currency = extractCurrency($(".a-price-symbol"));
    const discountRate = parseFloat($(".savingsPercentage").text().replace(/[-%]/g, "")) || 0;
    const description = extractDescription($);
    const reviewsCount = parseInt(
      $("#acrCustomerReviewText").text().replace(/[^0-9]/g, ""),
      10
    ) || 0;
    const stars = parseFloat($("#acrPopover").attr("title")?.split(' ')[0] || "0") || 0;

    const finalCurrentPrice = currentPrice || originalPrice;
    const finalOriginalPrice = originalPrice || currentPrice;
    const averagePrice = (finalCurrentPrice + finalOriginalPrice) / 2;

    const data: ScrapedProduct = {
      url,
      currency: currency || "$",
      image: imageUrls[0] || "",
      title,
      currentPrice: finalCurrentPrice,
      originalPrice: finalOriginalPrice,
      priceHistory: [],
      discountRate,
      category: "Electronics",
      reviewsCount,
      stars,
      isOutOfStock: outOfStock,
      description,
      lowestPrice: finalCurrentPrice,
      highestPrice: finalOriginalPrice,
      averagePrice,
    };

    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Scraping error:', errorMessage);
    throw new Error(`Failed to scrape product: ${errorMessage}`);
  }
}
