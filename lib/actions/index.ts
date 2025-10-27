"use server";

import { revalidatePath } from "next/cache";
import { scrapeAmazonProduct } from "../scraper";
import { connectToDB } from "../mongoose";
import Product from "../models/product.model";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { generateEmailBody, sendEmail } from "../nodemailer";
import { User, Product as ProductType } from "@/types";


export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl || typeof productUrl !== 'string') {
    throw new Error('Valid product URL is required');
  }

  if (!productUrl.includes('amazon')) {
    throw new Error('Only Amazon URLs are supported');
  }

  try {
    await connectToDB();
    const scrapedProduct = await scrapeAmazonProduct(productUrl);

    if (!scrapedProduct) {
      throw new Error('Failed to scrape product. Please check the URL and try again.');
    }

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    let product;
    if (existingProduct) {
      const updatedPriceHistory = [
        ...(existingProduct.priceHistory || []),
        { price: scrapedProduct.currentPrice, date: new Date() }
      ];
      
      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory)
      };
    } else {
      product = {
        ...scrapedProduct,
        priceHistory: [{ price: scrapedProduct.currentPrice, date: new Date() }]
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );

    if (!newProduct) {
      throw new Error('Failed to save product to database');
    }

    revalidatePath(`/products/${newProduct._id}`);
    return newProduct._id.toString();
  } catch (error) {
    const err = error as Error;
    console.error('Error scraping and storing product:', {
      url: productUrl,
      error: err.message
    });
    throw new Error(err.message || 'Failed to scrape and store product');
  }
}

export async function getProductById(productId: string): Promise<ProductType | null> {
  if (!productId) {
    throw new Error('Product ID is required');
  }

  try {
    await connectToDB();
    const product = await Product.findById(productId).lean();

    if (!product) {
      return null;
    }

    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
}

export async function getAllProducts(): Promise<ProductType[]> {
  try {
    await connectToDB();
    const products = await Product.find()
      .select('_id title image currentPrice currency originalPrice category')
      .sort({ _id: -1 })
      .limit(20)
      .lean();
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error('Error getting all products:', error);
    return [];
  }
}

export async function getSimilarProducts(productId: string): Promise<ProductType[]> {
  if (!productId) {
    return [];
  }

  try {
    await connectToDB();
    const currentProduct = await Product.findById(productId).select('category').lean() as { category?: string } | null;

    if (!currentProduct || !currentProduct.category) {
      return [];
    }

    const similarProducts = await Product.find({
      _id: { $ne: productId },
      category: currentProduct.category,
    })
    .select('_id title image currentPrice currency originalPrice category')
    .limit(6)
    .lean();

    return JSON.parse(JSON.stringify(similarProducts));
  } catch (error) {
    console.error('Error getting similar products:', error);
    return [];
  }
}

export async function addUserEmailToProduct(
  productId: string,
  userEmail: string
): Promise<void> {
  if (!productId || !userEmail) {
    throw new Error('Product ID and email are required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    throw new Error('Invalid email address');
  }

  try {
    await connectToDB();
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    const userExists = product.users?.some(
      (user: User) => user.email === userEmail
    );

    if (!userExists) {
      product.users = product.users || [];
      product.users.push({ email: userEmail });
      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");
      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.error('Error adding user email:', error);
    throw error;
  }
}
