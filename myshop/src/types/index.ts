// Location Types
export type StockLocation =
  | 'myanmar'
  | 'cambodia'
  | 'thailand';

export const STOCK_LOCATIONS: { id: StockLocation; name: string; displayName: string; flag: string; eta: string }[] = [
  { id: 'myanmar', name: 'myanmar', displayName: 'Myanmar', flag: '🇲🇲', eta: 'Same Day' },
  { id: 'cambodia', name: 'cambodia', displayName: 'Cambodia', flag: '🇰🇭', eta: '1-2 Days' },
  { id: 'thailand', name: 'thailand', displayName: 'Thailand', flag: '🇹🇭', eta: '1-2 Days' },
];

export interface ProductInventory {
  myanmar: number;
  cambodia: number;
  thailand: number;
}

export const DEFAULT_INVENTORY: ProductInventory = {
  myanmar: 0,
  cambodia: 0,
  thailand: 0,
};

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  thc_percent: string;   // repurposed as "sizes" e.g. "S,M,L,XL"
  cbd_percent: string;   // repurposed as "colors" e.g. "Black, White"
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  stock: number;
  inventory?: ProductInventory;
  origin?: string;
  created_at: string;
}

export type ProductCategory =
  | 'Clothing'
  | 'Shoes'
  | 'Bags'
  | 'Accessories'
  | 'Beauty'
  | 'Electronics';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Clothing',
  'Shoes',
  'Bags',
  'Accessories',
  'Beauty',
  'Electronics',
];

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'cod' | 'aba' | 'usdt' | 'kpay' | 'wavepay';
export type OrderStatus = 'pending' | 'confirmed' | 'delivering' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  delivery_location: StockLocation;
  notes?: string;
  items: CartItem[];
  total: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  telegram_sent: boolean;
  created_at: string;
}

export interface CheckoutFormData {
  customer_name: string;
  phone: string;
  address: string;
  delivery_location: StockLocation;
  notes: string;
  payment_method: PaymentMethod;
}

export interface AdminProductFormData {
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  thc_percent: string;
  cbd_percent: string;
  image_url: string;
  stock: number;
  inventory: ProductInventory;
  origin: string;
  is_featured: boolean;
}

export interface TelegramOrderMessage {
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  notes?: string;
  items: CartItem[];
  total: number;
  payment_method: PaymentMethod;
  created_at: string;
}
