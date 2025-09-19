# Email Service Documentation

## Overview
The email service automatically sends donation receipts to donors after successful payment verification. It uses Hostinger mail service with professional email templates.

## Email Configuration

### SMTP Settings
- **Host**: smtp.hostinger.com
- **Port**: 587
- **Security**: STARTTLS
- **From Email**: noreply_donations@harekrishnavidya.org
- **Reply-To**: aikyavidya@hkmhyderabad.org

### Authentication
- **Username**: noreply_donations@harekrishnavidya.org
- **Password**: RadhaKrishna#108

## Features

### 1. Automatic Receipt Sending
- Sends receipt email immediately after successful payment verification
- Only sends to completed donations with valid email addresses
- Professional HTML email template with Hare Krishna branding

### 2. Email Template
The receipt email includes:
- HARE KRISHNA MOVEMENT INDIA branding and logo
- Complete donation details (amount, donor info, transaction ID)
- Receipt number with timestamp format: `HKVIDYA/YYYY/HHMM`
- Contact information for the temple
- Sacred mantra at the bottom

### 3. Error Handling
- Graceful error handling if email fails to send
- Logging of email send attempts and results
- Non-blocking email sending (donation still saves even if email fails)

## API Endpoints

### Test Email Service
```http
GET /api/donations/test-email
```
Tests the email configuration by sending a test email to admin.

### Send Receipt for Existing Donation
```http
POST /api/donations/:donationId/send-receipt
```
Manually sends a receipt email for an existing donation.

## Usage

### Automatic Email Sending
Emails are automatically sent when:
1. Payment is verified successfully (`verifyPayment` endpoint)
2. Donation status is 'completed'
3. Donor email address exists

### Manual Email Sending
```javascript
// Send receipt for existing donation
const response = await fetch('/api/donations/DONATION_ID/send-receipt', {
  method: 'POST'
});
```

### Testing Email Service
```javascript
// Test email configuration
const response = await fetch('/api/donations/test-email');
```

## Testing

### Run Email Service Test
```bash
node test-email-service.js
```

This script will:
1. Test email configuration
2. Send a test donation receipt email
3. Verify both emails are delivered

### Expected Response
```json
{
  "success": true,
  "message": "Receipt email sent successfully",
  "details": {
    "success": true,
    "messageId": "email_message_id",
    "message": "Receipt email sent successfully"
  }
}
```

## Email Template Customization

### Template Structure
- **Header**: HARE KRISHNA MOVEMENT INDIA branding
- **Receipt Details**: Donation information in formatted table
- **Mantra**: Sacred Hare Krishna mantra
- **Footer**: Contact information and disclaimer

### Customization Options
Edit `utils/emailService.js` to modify:
- Email styling (CSS in HTML template)
- Template content and layout
- Email subject line format
- Sender information

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check SMTP credentials
   - Verify network connectivity
   - Check spam folder

2. **Authentication failed**
   - Verify email and password
   - Check if 2FA is enabled (disable for SMTP)

3. **Template not rendering**
   - Check HTML syntax in template
   - Verify all donation fields exist

### Logs
Check server logs for email-related messages:
```bash
# Look for email send attempts
grep "Sending receipt email" server.log

# Look for email errors
grep "Error sending" server.log
```

## Security Notes

1. **Email Credentials**: Store in environment variables in production
2. **Rate Limiting**: Consider implementing rate limiting for email endpoints
3. **Validation**: Email addresses are validated before sending
4. **Privacy**: Respect donor privacy preferences (anonymous donations)

## Production Deployment

### Environment Variables
```env
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_USER=noreply_donations@harekrishnavidya.org
EMAIL_PASS=RadhaKrishna#108
```

### Monitoring
- Monitor email delivery rates
- Set up alerts for email failures
- Track bounce rates and invalid emails

## Support

For issues with the email service:
1. Check server logs for error messages
2. Test email configuration endpoint
3. Verify SMTP settings with Hostinger
4. Contact system administrator

---

**Note**: This service is designed to work seamlessly with the existing donation flow. Receipt emails are sent automatically after successful payment verification, ensuring donors receive their receipts promptly.
