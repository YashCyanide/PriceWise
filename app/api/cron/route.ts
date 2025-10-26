import { NextResponse } from "next/server";
import { getLowestPrice, getHighestPrice, getAveragePrice, getEmailNotifType } from "@/lib/utils";
import Product from "@/lib/models/product.model";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { connectToDB } from "@/lib/mongoose";
import { User } from "@/types";


export const maxDuration = 300; // This function can run for a maximum of 300 seconds
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    await connectToDB();

    const products = await Product.find({});

    if (!products || products.length === 0) {
      return NextResponse.json({
        message: "No products to scrape",
        data: [],
      });
    }

    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        try {
          const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

          if (!scrapedProduct) {
            console.log(`Failed to scrape product: ${currentProduct.url}`);
            return null;
          }

          const updatedPriceHistory = [
            ...currentProduct.priceHistory,
            {
              price: scrapedProduct.currentPrice,
              date: new Date(),
            },
          ];

          const product = {
            ...scrapedProduct,
            priceHistory: updatedPriceHistory,
            lowestPrice: getLowestPrice(updatedPriceHistory),
            highestPrice: getHighestPrice(updatedPriceHistory),
            averagePrice: getAveragePrice(updatedPriceHistory),
          };

          const updatedProduct = await Product.findOneAndUpdate(
            { url: product.url },
            product,
            { new: true }
          );

          if (!updatedProduct) {
            console.log(`Failed to update product: ${product.url}`);
            return null;
          }

          const emailNotifType = getEmailNotifType(
            scrapedProduct,
            currentProduct
          );

          if (emailNotifType && updatedProduct.users && updatedProduct.users.length > 0) {
            try {
              const productInfo = {
                title: updatedProduct.title,
                url: updatedProduct.url,
              };
              const emailContent = await generateEmailBody(productInfo, emailNotifType);
              const userEmails = updatedProduct.users.map((user: User) => user.email);
              await sendEmail(emailContent, userEmails);
            } catch (emailError) {
              console.error('Error sending email:', emailError);
            }
          }

          return updatedProduct;
        } catch (error) {
          console.error(`Error processing product ${currentProduct.url}:`, error);
          return null;
        }
      })
    );

    const successfulUpdates = updatedProducts.filter(product => product !== null);

    return NextResponse.json({
      message: "Scraping completed",
      data: successfulUpdates,
      total: products.length,
      successful: successfulUpdates.length,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: "Failed to process products" },
      { status: 500 }
    );
  }
}