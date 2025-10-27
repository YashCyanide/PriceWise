import { NextResponse } from "next/server";
import { getLowestPrice, getHighestPrice, getAveragePrice, getEmailNotifType } from "@/lib/utils";
import Product from "@/lib/models/product.model";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { connectToDB } from "@/lib/mongoose";
import { User } from "@/types";

export const maxDuration = 300;
export const dynamic = "force-dynamic";
export const revalidate = 0;

const BATCH_SIZE = 5;
const DELAY_BETWEEN_BATCHES = 3000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function processBatch(products: any[]) {
  const results = await Promise.allSettled(
    products.map(async (currentProduct) => {
      try {
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

        if (!scrapedProduct) {
          console.warn(`Failed to scrape: ${currentProduct.url}`);
          return null;
        }

        const updatedPriceHistory = [
          ...(currentProduct.priceHistory || []),
          { price: scrapedProduct.currentPrice, date: new Date() }
        ];

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory)
        };

        const updatedProduct = await Product.findOneAndUpdate(
          { url: product.url },
          product,
          { new: true }
        );

        if (!updatedProduct) {
          console.warn(`Failed to update: ${product.url}`);
          return null;
        }

        const emailNotifType = getEmailNotifType(scrapedProduct, currentProduct);

        if (emailNotifType && updatedProduct.users?.length > 0) {
          try {
            const productInfo = { title: updatedProduct.title, url: updatedProduct.url };
            const emailContent = await generateEmailBody(productInfo, emailNotifType);
            const userEmails = updatedProduct.users.map((user: User) => user.email);
            await sendEmail(emailContent, userEmails);
          } catch (emailError) {
            console.error(`Email error for ${updatedProduct.url}:`, emailError);
          }
        }

        return updatedProduct;
      } catch (error) {
        console.error(`Error processing ${currentProduct.url}:`, error);
        return null;
      }
    })
  );

  return results
    .filter(result => result.status === 'fulfilled' && result.value !== null)
    .map(result => (result as PromiseFulfilledResult<any>).value);
}

export async function GET(request: Request) {
  const startTime = Date.now();
  
  try {
    await connectToDB();

    const products = await Product.find({}).lean();

    if (!products || !Array.isArray(products)) {
      console.error('Invalid products data from database');
      return NextResponse.json(
        { error: "Failed to fetch products", timestamp: new Date().toISOString() },
        { status: 500 }
      );
    }

    if (products.length === 0) {
      return NextResponse.json({
        message: "No products to scrape",
        total: 0,
        successful: 0,
        failed: 0,
        duration: 0
      });
    }

    console.log(`Starting cron job for ${products.length} products`);

    const allResults = [];
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(products.length / BATCH_SIZE)}`);
      
      const batchResults = await processBatch(batch);
      allResults.push(...batchResults);

      if (i + BATCH_SIZE < products.length) {
        await delay(DELAY_BETWEEN_BATCHES);
      }
    }

    const duration = Date.now() - startTime;
    const successful = allResults.filter(r => r !== null).length;

    console.log(`Cron job completed: ${successful}/${products.length} successful in ${duration}ms`);

    return NextResponse.json({
      message: "Scraping completed",
      total: products.length,
      successful,
      failed: products.length - successful,
      duration: Math.round(duration / 1000)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Cron job error:', errorMessage);
    return NextResponse.json(
      { 
        error: "Failed to process products",
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}