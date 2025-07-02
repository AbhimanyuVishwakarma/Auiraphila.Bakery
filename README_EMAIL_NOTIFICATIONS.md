# Email Notification System for AuIrphila Bakery

This document explains how to set up and use the email notification system for AuIrphila Bakery.

## Features

- Order confirmation emails sent to customers after checkout
- Email includes order details, items purchased, pricing information, and shipping address
- Emails are stored in the database for record-keeping

## Setup Instructions

### 1. Database Setup

Run the SQL script to create the email notifications table:

```sql
-- From file: sql/email_notifications_table.sql
CREATE TABLE IF NOT EXISTS email_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    order_number TEXT REFERENCES orders(order_number),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_notifications_order_number ON email_notifications(order_number);
CREATE INDEX IF NOT EXISTS idx_email_notifications_recipient_email ON email_notifications(recipient_email);
```

You can run this SQL in your Supabase SQL Editor.

### 2. Integration with Email Service Provider

For production use, you should integrate with an email service provider like SendGrid, Mailgun, or AWS SES. 

To do this:
1. Sign up for an email service provider
2. Get your API key
3. Update the `email-service.js` file to use the provider's API

Example integration with SendGrid (requires installing the SendGrid package):

```javascript
// Example SendGrid integration (not included in current implementation)
import sgMail from '@sendgrid/mail';
sgMail.setApiKey('YOUR_SENDGRID_API_KEY');

// Then in the sendOrderConfirmationEmail function:
const msg = {
  to: orderData.email,
  from: 'orders@auirphilabakery.com',
  subject: `AuIrphila Bakery - Order Confirmation #${orderData.orderNumber}`,
  html: emailContent.html,
};

await sgMail.send(msg);
```

## How It Works

1. When a customer completes checkout, the `sendOrderConfirmationEmail` function is called
2. The function formats the order details into a nice HTML email
3. Currently, the email is stored in the database (for demonstration purposes)
4. In production, the email would be sent via an email service provider

## Testing

To test the email notification system:
1. Place an order through the checkout process
2. Check the browser console for confirmation that the email was "sent"
3. Query the `email_notifications` table in Supabase to see the stored email

## Future Enhancements

- Shipping confirmation emails
- Order status update emails
- Marketing emails and newsletters
- Email templates for different types of notifications
