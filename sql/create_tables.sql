-- SQL Scripts for creating tables in Supabase

-- 1. Creating a Table for Login Details
CREATE TABLE IF NOT EXISTS logins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Creating a Table for Sign-Up Details
CREATE TABLE IF NOT EXISTS signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Creating a Table for Contact Us Form
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Creating a Table for Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  review TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user_email FOREIGN KEY (user_email) REFERENCES signups(email) ON DELETE CASCADE
);

-- 5. Creating a Table for Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL,
  order_items JSONB NOT NULL,
  total_bill NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user_email FOREIGN KEY (user_email) REFERENCES signups(email) ON DELETE CASCADE
);

-- Create index for faster lookups on order_number
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Logins table policies
CREATE POLICY "Allow public insert to logins" ON logins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to view their own login data" ON logins FOR SELECT USING (auth.email() = email);
CREATE POLICY "Allow admins to view all logins" ON logins FOR SELECT USING (auth.email() IN (SELECT email FROM signups WHERE email LIKE '%admin%'));

-- Signups table policies
CREATE POLICY "Allow public insert to signups" ON signups FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to view their own signup data" ON signups FOR SELECT USING (auth.email() = email);

-- Contacts table policies
CREATE POLICY "Allow public insert to contacts" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admins to view all contacts" ON contacts FOR SELECT USING (auth.email() IN (SELECT email FROM signups WHERE email LIKE '%admin%'));

-- Reviews table policies
CREATE POLICY "Allow public view of reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Allow users to insert their own reviews" ON reviews FOR INSERT WITH CHECK (auth.email() = user_email);
CREATE POLICY "Allow users to update their own reviews" ON reviews FOR UPDATE USING (auth.email() = user_email);
CREATE POLICY "Allow users to delete their own reviews" ON reviews FOR DELETE USING (auth.email() = user_email);

-- Orders table policies
CREATE POLICY "Allow users to insert their own orders" ON orders FOR INSERT WITH CHECK (auth.email() = user_email);
CREATE POLICY "Allow users to view their own orders" ON orders FOR SELECT USING (auth.email() = user_email);
CREATE POLICY "Allow admins to view all orders" ON orders FOR SELECT USING (auth.email() IN (SELECT email FROM signups WHERE email LIKE '%admin%'));

-- Add new column to orders table
ALTER TABLE orders ADD COLUMN order_display_id text;
