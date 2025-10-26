# Security Policy

## Reporting Security Issues

If you discover a security vulnerability, please email the maintainers directly. Do not open a public issue.

## Security Best Practices

### Environment Variables
- Never commit `.env` files to version control
- Use different credentials for development and production
- Rotate credentials regularly
- Use strong, unique passwords

### Database Security
- Use MongoDB Atlas with IP whitelisting
- Enable authentication on all database connections
- Use connection pooling to prevent connection exhaustion
- Regularly backup your database

### API Security
- Validate all user inputs
- Sanitize data before storing in database
- Use HTTPS in production
- Implement rate limiting on API endpoints

### Email Security
- Use app-specific passwords instead of main account passwords
- Sanitize all user-provided content in emails
- Validate email addresses before sending

### Scraping Security
- Validate URLs before scraping
- Use proxy services to protect your IP
- Respect robots.txt and rate limits
- Handle errors gracefully

## Known Security Considerations

1. **URL Validation**: All Amazon URLs are validated before scraping
2. **XSS Protection**: Email content is sanitized to prevent XSS attacks
3. **Input Validation**: Email addresses and product IDs are validated
4. **Error Handling**: Errors are logged without exposing sensitive information

## Dependencies

Keep all dependencies up to date:
```bash
npm audit
npm audit fix
```

## Production Checklist

- [ ] All environment variables are set
- [ ] `.env` file is not committed
- [ ] HTTPS is enabled
- [ ] Database has authentication enabled
- [ ] IP whitelisting is configured
- [ ] Error messages don't expose sensitive data
- [ ] Rate limiting is implemented
- [ ] Logging is configured properly
