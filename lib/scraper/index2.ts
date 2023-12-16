// import axios from "axios";
// import * as cheerio from "cheerio";
// import { extractCurrency, extractPrice } from "../utils";

// export async function scrapeAmazonProduct(url: string) {
//   if (!url) return;

//   // Bright Data Proxy Configuration

//   // curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_df1eefd8-zone-unblocker:v4a51hqa82lj -k https://lumtest.com/myip.json

//   const username = String(process.env.BRIGHT_DATA_USERNAME);
//   const password = String(process.env.BRIGHT_DATA_PASSWORD);
//   const port = 22225;
//   const session_id = (1000000 * Math.random()) | 0;

//   const options = {
//     auth: {
//       username: `${username}-session-${session_id}`,
//       password,
//     },
//     host: "brd.superproxy.io",
//     port,
//     rejectUnauthorized: false,
//   };

//   try {
//     const response = await axios.get(url, options);
//     const $ = cheerio.load(response.data);
//     //extract the title of the product
//     const title = $("#productTitle").text().trim();
//     const currentPrice = extractPrice(
//       $(".priceToPay span.a-price-whole"),
//       $("a.size.base.a-color-price"),
//       $(".a-button-selected .a-color-base")
//     );

//     const original_price = extractPrice(
//       $("#priceblock_ourprice"),
//       $(".a-price.a-text-price span.a-offscreen"),
//       $(".basisPrice"),
//       $(".a-price.a-text-price span.a-offscreen"),
//       $("#listPrice"),
//       $("#priceblock_dealprice"),
//       $(".a-size-base.a-color-price")
//     );

//     const outOfStock = $("#availability span").text().trim().toLowerCase() === "out of stock" && $("#availability").text().trim().toLowerCase() === "currently unavailable";

//     const images =
//       $("#imgBlkFront").attr("data-a-dynamic-image")
//       || $("#landingImage").attr("data-a-dynamic-image")
//       || '{}';

//     const imageUrls = Object.keys(JSON.parse(images));

//     const currency = extractCurrency($('.a-price-symbol'));

//     const discountRate = $(' .savingsPercentage ').text().replace(/[-%]/g," ");

//     const reviewsCount = $("#acrCustomerReviewText.a-size-base").text();

//     // const stars = $("#averageCustomerReviews.a-size-base.a-color-base");

//     // console.log("title", { title, currentPrice, original_price, outOfStock, imageUrls, currency, discountRate,reviewsCount });
    
//     //construct data object with scraped information
//     const data = {
//       url,
//       currency: currency || '$',
//       image: imageUrls[0],
//       currentPrice: Number(currentPrice),
//       original_price: Number(original_price),
//       priceHistory: [],
//       discountRate: Number(discountRate),
//       category: "category",
//       reviewsCount: reviewsCount || 100,
//       stars: 4.5,
//       outOfStock: outOfStock,
      
//     }
//     console.log("data", {data});
//     // console.log("response", response.data);
//   } catch (error: any) {
//     throw new Error(`failed to scrape product : ${error.message}`);
//   }
// }