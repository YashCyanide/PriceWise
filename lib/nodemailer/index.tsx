"use server"

import { EmailContent, EmailProductInfo, NotificationType } from '@/types';
import nodemailer from 'nodemailer';

const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

const Notification = {
  WELCOME: 'WELCOME',
  CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
  LOWEST_PRICE: 'LOWEST_PRICE',
  THRESHOLD_MET: 'THRESHOLD_MET',
}

export async function generateEmailBody(
  product: EmailProductInfo,
  type: NotificationType
): Promise<EmailContent> {
  const THRESHOLD_PERCENTAGE = 40;
  const safeTitle = escapeHtml(product.title);
  const safeUrl = escapeHtml(product.url);
  const shortenedTitle =
    safeTitle.length > 20
      ? `${safeTitle.substring(0, 20)}...`
      : safeTitle;

  let subject = "";
  let body = "";

  switch (type) {
    case Notification.WELCOME:
      subject = `Welcome to Price Tracking for ${shortenedTitle}`;
      body = `
        <div>
          <h2>Welcome to PriceWise 🚀</h2>
          <p>You are now tracking ${safeTitle}.</p>
          <p>Here's an example of how you'll receive updates:</p>
          <div style="border: 1px solid #ccc; padding: 10px; background-color: #f8f8f8;">
            <h3>${safeTitle} is back in stock!</h3>
            <p>We're excited to let you know that ${safeTitle} is now back in stock.</p>
            <p>Don't miss out - <a href="${safeUrl}" target="_blank" rel="noopener noreferrer">buy it now</a>!</p>
          </div>
          <p>Stay tuned for more updates on ${safeTitle} and other products you're tracking.</p>
        </div>
      `;
      break;

    case Notification.CHANGE_OF_STOCK:
      subject = `${shortenedTitle} is now back in stock!`;
      body = `
        <div>
          <h4>Hey, ${safeTitle} is now restocked! Grab yours before they run out again!</h4>
          <p>See the product <a href="${safeUrl}" target="_blank" rel="noopener noreferrer">here</a>.</p>
        </div>
      `;
      break;

    case Notification.LOWEST_PRICE:
      subject = `Lowest Price Alert for ${shortenedTitle}`;
      body = `
        <div>
          <h4>Hey, ${safeTitle} has reached its lowest price ever!!</h4>
          <p>Grab the product <a href="${safeUrl}" target="_blank" rel="noopener noreferrer">here</a> now.</p>
        </div>
      `;
      break;

    case Notification.THRESHOLD_MET:
      subject = `Discount Alert for ${shortenedTitle}`;
      body = `
        <div>
          <h4>Hey, ${safeTitle} is now available at a discount more than ${THRESHOLD_PERCENTAGE}%!</h4>
          <p>Grab it right away from <a href="${safeUrl}" target="_blank" rel="noopener noreferrer">here</a>.</p>
        </div>
      `;
      break;

    default:
      throw new Error("Invalid notification type.");
  }

  return { subject, body };
}

const getTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.warn('Email credentials not configured, skipping email');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword
    }
  });
};

export const sendEmail = async (emailContent: EmailContent, sendTo: string[]): Promise<void> => {
  console.log('📧 Attempting to send email to:', sendTo);
  
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('⚠️ Email transporter not configured - skipping email');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: sendTo,
      subject: emailContent.subject,
      html: emailContent.body
    });
    console.log('✅ Email sent successfully to:', sendTo);
    console.log('Message ID:', info.messageId);
  } catch (error: any) {
    console.error('❌ Email failed to send');
    if (error.code === 'EAUTH') {
      console.error('Auth error: Generate Gmail App Password: https://myaccount.google.com/apppasswords');
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};
