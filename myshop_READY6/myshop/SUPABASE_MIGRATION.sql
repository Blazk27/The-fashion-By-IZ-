-- Run this SQL in your Supabase SQL Editor
-- https://supabase.com/dashboard → SQL Editor

-- Create shop_settings table for cloud-synced settings
CREATE TABLE IF NOT EXISTS shop_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to READ settings (so all customers see updates)
CREATE POLICY "Public can read settings"
  ON shop_settings FOR SELECT
  USING (true);

-- Allow service role (your admin) to write
CREATE POLICY "Service role can write settings"
  ON shop_settings FOR ALL
  USING (true)
  WITH CHECK (true);

-- Pre-populate with The Fashion defaults
INSERT INTO shop_settings (key, value) VALUES
  ('shop_name', 'The Fashion'),
  ('shop_tagline', 'Wholesale & Retail Women Clothing'),
  ('slogan1', 'WHOLESALE & RETAIL WOMEN CLOTHING'),
  ('slogan2', 'MADE IN THAILAND 🇹🇭'),
  ('slogan3', 'Quality, Price, Service'),
  ('phone_number', '+95 9 257 128 464'),
  ('shop_address', 'J-30, 3rd Floor, Yuzana Plaza, Banyardala Street, MinglarTaungNyunt, Yangon, Myanmar'),
  ('tiktok_url', 'https://www.tiktok.com/@thefashion_thefashion2'),
  ('telegram_handle', '@thefashion_mm'),
  ('telegram_bot_token', ''),
  ('telegram_chat_id', ''),
  ('kpay_number', '09-257-128-464'),
  ('kpay_name', 'THE FASHION'),
  ('wavepay_number', '09-250-936-673'),
  ('wavepay_name', 'THE FASHION'),
  ('aba_account', '000 000 000'),
  ('aba_name', 'THE FASHION'),
  ('usdt_address', 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'),
  ('admin_password', '212721')
ON CONFLICT (key) DO NOTHING;
