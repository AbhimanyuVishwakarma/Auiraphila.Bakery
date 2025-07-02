-- Create email_notifications table for storing sent emails
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

-- Create index on order_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_notifications_order_number ON email_notifications(order_number);

-- Create index on recipient_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_notifications_recipient_email ON email_notifications(recipient_email);

-- Add comment to table
COMMENT ON TABLE email_notifications IS 'Stores email notifications sent to customers';
