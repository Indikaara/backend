# Email Configuration Setup

## Environment Variables Required

Add these variables to your `.env` file:

```env
# Email Configuration (Required)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=orders@indikara.com

# Email Enable/Disable (Optional)
EMAIL_ENABLED=true
```

## Email Provider Setup Options

### Option 1: Gmail SMTP (Quick Start)
1. Use a Gmail account
2. Enable 2-Factor Authentication
3. Generate an App Password: https://myaccount.google.com/apppasswords
4. Use the app password in `EMAIL_PASSWORD`

**Config:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com
```

**Limits:** 500 emails per day

### Option 2: SendGrid (Production Recommended)
1. Sign up at https://sendgrid.com (Free tier: 100 emails/day)
2. Create an API key
3. Use SendGrid SMTP credentials

**Config:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=verified-sender@yourdomain.com
```

### Option 3: Mailtrap (Development/Testing)
1. Sign up at https://mailtrap.io (Free)
2. Get inbox credentials
3. All emails are captured, not sent to real recipients

**Config:**
```env
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password
EMAIL_FROM=test@indikara.com
```

## Features Implemented

### 1. Email Service (`services/email.service.js`)
- Sends order confirmation emails with HTML template
- Determines recipient: registered user email OR guest PayU email
- Customer name fallback: user.name → PayU firstname → "Valued Customer"
- Non-blocking error handling (never disrupts order processing)
- Idempotent (checks `emailSent` flag to prevent duplicates)

### 2. HTML Email Template (`templates/order-confirmation.html`)
- Professional responsive design
- Order details: ID, transaction ID, date
- Payment status badge (Paid/Pending)
- Itemized product table with quantities and prices
- Total amount in ₹ (Rupees)
- Shipping address
- Support contact information

### 3. Order Model Updates (`models/order.model.js`)
- Added `paymentResult.firstname` - stores customer name from PayU
- Added `emailSent` - tracks if confirmation email was sent
- Added `emailSentAt` - timestamp of email delivery

### 4. Controller Integration (`controllers/payu.controller.js`)

**Webhook Handler (Primary):**
- Saves `firstname` and `email_address` from PayU webhook data
- After order confirmation, populates order and sends email
- Fire-and-forget pattern (doesn't block webhook response)

**Redirect Handler (Fallback):**
- Checks if email hasn't been sent yet (`!emailSent`)
- Sends email if webhook hasn't fired
- Handles cases where browser redirect arrives before webhook

## Email Sending Flow

```
Payment Success (PayU)
    ↓
Webhook Received (Primary)
    ↓
Order status → 'confirmed'
Order.paymentResult.firstname saved
    ↓
Populate order (user + products)
    ↓
Send email (non-blocking)
    ↓
emailSent = true
    ↓
Return 200 OK to PayU
```

**Fallback Flow:**
```
Browser Redirect (if webhook delayed)
    ↓
Check: status === 'success' && !emailSent
    ↓
Send email (non-blocking)
```

## Error Handling

- **Email disabled:** Logs info, continues processing
- **No email credentials:** Logs warning, continues
- **Invalid recipient:** Logs warning, skips email
- **Send failure:** Logs error with order ID, continues
- **Template error:** Logs error, continues

All errors are logged via Winston for manual follow-up.

## Testing

### Test with Mailtrap (Recommended for Development)
1. Configure Mailtrap credentials in `.env`
2. Create a test order and complete payment
3. Check Mailtrap inbox for email
4. Verify all order details are correct

### Test with Real SMTP
1. Configure production SMTP credentials
2. Use a test email address
3. Complete a real payment flow
4. Check email delivery

## Monitoring

Check Winston logs for email-related events:

```bash
# Successful email
"Order confirmation email sent successfully"

# Failed email (requires manual follow-up)
"Failed to send order confirmation email"
```

## Currency Format

Default: ₹ (Indian Rupee)
Format: `₹1,234.56`

To change currency, update `email.service.js` line with price formatting.

## Support Email

Currently hardcoded in template: `support@indikara.com`

To customize, add environment variable:
```env
SUPPORT_EMAIL=support@yourdomain.com
```

And update template to use `{{supportEmail}}` variable.

## Notes

- Emails are sent only for **confirmed** orders (isPaid: true)
- Pending orders do NOT receive confirmation emails
- Email sending never blocks order processing or webhook responses
- PayU webhook always returns 200 OK regardless of email status
- Duplicate emails prevented by `emailSent` flag check
