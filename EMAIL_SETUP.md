# Email Setup Guide - Outlook/Hotmail

## Issue
Outlook/Hotmail has disabled basic authentication. You need to use an **App Password** instead of your regular password.

## Solution: Generate App Password

### Step 1: Enable Two-Factor Authentication
1. Go to [Microsoft Account Security](https://account.microsoft.com/security)
2. Sign in with your Outlook account
3. Click on **Advanced security options**
4. Under **Two-step verification**, click **Turn on** (if not already enabled)

### Step 2: Generate App Password
1. Go to [App Passwords](https://account.microsoft.com/security)
2. Click on **Advanced security options**
3. Scroll down to **App passwords**
4. Click **Create a new app password**
5. Copy the generated password (it will look like: `abcd-efgh-ijkl-mnop`)

### Step 3: Update .env File
```env
EMAIL_USER=pricewise-india@outlook.com
EMAIL_PASSWORD=abcd-efgh-ijkl-mnop
```

Replace `EMAIL_PASSWORD` with the App Password you generated (not your regular password).

## Alternative: Use Gmail

If you prefer Gmail, it's easier to set up:

### Gmail Setup
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Sign in to your Google account
3. Select **Mail** and **Other (Custom name)**
4. Enter "PriceWise" as the name
5. Click **Generate**
6. Copy the 16-character password

### Update .env for Gmail
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### Update nodemailer config for Gmail
In `lib/nodemailer/index.tsx`, change the transporter to:
```typescript
return nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPassword,
  }
});
```

## Testing Email

After updating your credentials, test the email:

1. Start your dev server: `npm run dev`
2. Add a product to track
3. Subscribe with your email
4. Check if you receive the welcome email

## Troubleshooting

### Error: EAUTH
- **Cause**: Invalid credentials or basic auth disabled
- **Solution**: Use App Password (see steps above)

### Error: ETIMEDOUT
- **Cause**: Network/firewall blocking SMTP
- **Solution**: Check firewall settings, try different network

### Error: ECONNREFUSED
- **Cause**: Wrong SMTP settings
- **Solution**: Verify host and port in nodemailer config

### No Error but No Email
- **Cause**: Email in spam folder
- **Solution**: Check spam/junk folder, add sender to contacts

## Current Configuration

The app is configured for Outlook with:
- **Host**: smtp-mail.outlook.com
- **Port**: 587
- **Security**: STARTTLS

## Disable Email (Optional)

If you don't want email notifications:

1. Remove or comment out EMAIL_USER and EMAIL_PASSWORD from .env
2. The app will skip email sending automatically

```env
# EMAIL_USER=pricewise-india@outlook.com
# EMAIL_PASSWORD=your-app-password
```

## Support Links

- [Microsoft App Passwords](https://support.microsoft.com/account-billing/using-app-passwords-with-apps-that-don-t-support-two-step-verification)
- [Google App Passwords](https://support.google.com/accounts/answer/185833)
- [Nodemailer Documentation](https://nodemailer.com/about/)

---

**Quick Fix**: Generate App Password → Update .env → Restart server
