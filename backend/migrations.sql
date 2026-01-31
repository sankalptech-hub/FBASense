-- Run this SQL in your Supabase SQL Editor
-- This creates all necessary tables for the Smart Inventory App

-- Enable Row Level Security
ALTER DATABASE postgres SET timezone TO 'UTC';

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  asin TEXT,
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  cost DECIMAL(10, 2) DEFAULT 0,
  price DECIMAL(10, 2) DEFAULT 0,
  status TEXT CHECK (status IN ('OK', 'Low', 'Out')) DEFAULT 'OK',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, sku)
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  date DATE NOT NULL,
  quantity_sold INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Upload history table
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rows_processed INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('Success', 'Failed', 'Partial')) DEFAULT 'Success',
  error_message TEXT
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  low_stock_threshold INTEGER DEFAULT 10,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory table
CREATE POLICY "Users can view their own inventory"
  ON inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory"
  ON inventory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory"
  ON inventory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory"
  ON inventory FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for sales table
CREATE POLICY "Users can view their own sales"
  ON sales FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales"
  ON sales FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales"
  ON sales FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales"
  ON sales FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for uploads table
CREATE POLICY "Users can view their own uploads"
  ON uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploads"
  ON uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies for settings table
CREATE POLICY "Users can view their own settings"
  ON settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_inventory_user_id ON inventory(user_id);
CREATE INDEX idx_inventory_sku ON inventory(sku);
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_uploads_user_id ON uploads(user_id);
CREATE INDEX idx_settings_user_id ON settings(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to inventory table
CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to settings table
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
