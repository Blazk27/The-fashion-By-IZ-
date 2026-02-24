# 🛍️ MyShop - Setup Guide (Myanmar · Cambodia · Thailand)

## ✅ Changes Made to Your App

### Removed (Cannabis Shop → Fashion Shop):
- ❌ Age verification gate (21+ check) → removed
- ❌ THC/CBD labels → changed to **Sizes** and **Colors**
- ❌ Cambodia-only locations (Phnom Penh, Sihanoukville, Poipet, Bavet)
- ❌ Cannabis categories (Flower, Vape, Concentrates, Edibles)

### Added (Fashion E-commerce):
- ✅ **3 Countries**: Myanmar 🇲🇲, Cambodia 🇰🇭, Thailand 🇹🇭
- ✅ **Fashion Categories**: Clothing, Shoes, Bags, Accessories, Beauty, Electronics
- ✅ **Myanmar Payment**: KBZ Pay (KPay), Wave Pay
- ✅ **Product fields**: Sizes (S,M,L,XL) and Colors instead of THC/CBD
- ✅ **New Hero**: Fashion-focused homepage

---

## 🔧 Setup Steps

### 1. Update Your Supabase Database

Run this SQL in your Supabase dashboard (SQL Editor):

```sql
-- Update orders table to support new locations
ALTER TABLE orders 
  ALTER COLUMN delivery_location TYPE TEXT;

-- Products table stays the same (thc_percent = sizes, cbd_percent = colors)
-- Add Myanmar/Cambodia/Thailand as valid delivery locations
```

### 2. Configure Telegram Bot

In `src/lib/supabase.ts`:
```ts
export const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN'; // from @BotFather
export const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID'; // your Telegram user/group ID
```

### 3. Update Payment Details

In `src/pages/CheckoutPage.tsx`, find and update:
- **KPay number**: `09-XXX-XXX-XXX` → your KPay number
- **WavePay number**: `09-XXX-XXX-XXX` → your WavePay number  
- **ABA account**: `000 000 000` → your ABA number
- **USDT wallet**: `TXXXXX...` → your USDT TRC20 address

### 4. Update Telegram Handle

Search and replace `@your_telegram` with your actual Telegram username in:
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/components/TelegramButton.tsx`
- `src/pages/HomePage.tsx`

### 5. Update Brand Name

Replace `MyShop` with your actual brand name across all files.

### 6. Upload Your Logo

Replace `/public/logo-uploaded.png` with your shop logo.

---

## 📦 Adding Products (Admin Panel)

Go to `/admin` and login with password: `212721` (change in supabase.ts)

When adding products:
- **THC % field** = enter Sizes (e.g. `S, M, L, XL` or `36, 37, 38, 39`)
- **CBD % field** = enter Colors (e.g. `Black, White, Red`)

---

## 🚀 Deploy to Vercel

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Deploy → done!

---

## 💰 Product Pricing Strategy

Buy wholesale price × 2 to 2.5 = Your selling price

Example:
- Buy from Alibaba: $5 → Sell: $12
- Buy from 1688.com: $3 → Sell: $8
