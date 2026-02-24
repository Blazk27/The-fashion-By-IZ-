import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  Download,
  Lock,
  Loader2,
  Settings,
  Save,
  Store,
  MessageCircle,
  CreditCard,
  Key,
  CheckCircle,
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { Product, Order, ProductCategory, PRODUCT_CATEGORIES, OrderStatus, DEFAULT_INVENTORY, STOCK_LOCATIONS } from '../types';
import { db, ADMIN_PASSWORD } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, addDoc, deleteDoc, query, orderBy, getDoc } from 'firebase/firestore';

// ─── Shop Settings Type ───────────────────────────────────────────────────────
export interface ShopSettings {
  shop_name: string;
  shop_tagline: string;
  slogan1: string;
  slogan2: string;
  slogan3: string;
  phone_number: string;
  shop_address: string;
  tiktok_url: string;
  telegram_handle: string;
  telegram_bot_token: string;
  telegram_chat_id: string;
  kpay_number: string;
  kpay_name: string;
  wavepay_number: string;
  wavepay_name: string;
  aba_account: string;
  aba_name: string;
  usdt_address: string;
  admin_password: string;
}

const DEFAULT_SETTINGS: ShopSettings = {
  shop_name: 'The Fashion',
  shop_tagline: 'Wholesale & Retail Women Clothing',
  slogan1: 'WHOLESALE & RETAIL WOMEN CLOTHING',
  slogan2: 'MADE IN THAILAND 🇹🇭',
  slogan3: 'Quality, Price, Service',
  phone_number: '+95 9 257 128 464',
  shop_address: 'J-30, 3rd Floor, Yuzana Plaza, Banyardala Street, MinglarTaungNyunt, Yangon, Myanmar',
  tiktok_url: 'https://www.tiktok.com/@thefashion_thefashion2',
  telegram_handle: '@thefashion_mm',
  telegram_bot_token: '',
  telegram_chat_id: '',
  kpay_number: '09-257-128-464',
  kpay_name: 'THE FASHION',
  wavepay_number: '09-250-936-673',
  wavepay_name: 'THE FASHION',
  aba_account: '000 000 000',
  aba_name: 'THE FASHION',
  usdt_address: 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  admin_password: '212721',
};

// ─── Helper to load settings (from Supabase cache or defaults) ─────────────
// Settings are stored in Supabase `shop_settings` table (key-value rows)
// We also cache in localStorage so the page loads instantly, then refreshes

export function loadSettings(): ShopSettings {
  try {
    const raw = localStorage.getItem('myshop_settings_cache');
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettingsCache(s: ShopSettings) {
  localStorage.setItem('myshop_settings_cache', JSON.stringify(s));
}

// Load from Firebase Firestore
export async function loadSettingsFromDB(_unused?: any): Promise<ShopSettings> {
  try {
    const { db: firedb } = await import('../lib/firebase');
    const { doc: fdoc, getDoc: fgetDoc } = await import('firebase/firestore');
    const snap = await fgetDoc(fdoc(firedb, 'config', 'shop_settings'));
    if (!snap.exists()) return loadSettings();
    const data = snap.data() as Partial<ShopSettings>;
    const merged = { ...DEFAULT_SETTINGS, ...data };
    saveSettingsCache(merged);
    return merged;
  } catch {
    return loadSettings();
  }
}

export async function saveSettingsToDB(_unused: any, s: ShopSettings): Promise<void> {
  saveSettingsCache(s);
  const { db: firedb } = await import('../lib/firebase');
  const { doc: fdoc, setDoc: fsetDoc } = await import('firebase/firestore');
  await fsetDoc(fdoc(firedb, 'config', 'shop_settings'), s);
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────
export function AdminPage() {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<ShopSettings>(loadSettings());
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('myshop_admin_auth');
    setIsAuthenticated(auth === 'true');
    // Load settings from Supabase on mount
    loadSettingsFromDB().then(s => setSettings(s));
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchOrders();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'orders') {
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, activeTab]);

  const fetchOrders = async () => {
    setIsRefreshing(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        items: typeof d.data().items === 'string' ? JSON.parse(d.data().items) : d.data().items,
      })) as Order[];
      setOrders(data);
    } catch {
      const local = JSON.parse(localStorage.getItem('myshop_orders') || '[]');
      setOrders(local.reverse());
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const currentPassword = loadSettings().admin_password || ADMIN_PASSWORD;
    if (passwordInput === currentPassword) {
      localStorage.setItem('myshop_admin_auth', 'true');
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('myshop_admin_auth');
    setIsAuthenticated(false);
    navigate('/');
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) => statusFilter === 'all' || o.status === statusFilter
  );

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...productData, inventory: productData.inventory || editingProduct.inventory || DEFAULT_INVENTORY } as Product);
        alert('Product updated!');
      } else {
        await addProduct({
          title: productData.title || '',
          description: productData.description || '',
          price: productData.price || 0,
          category: productData.category || 'Clothing',
          thc_percent: productData.thc_percent || 'S,M,L,XL',
          cbd_percent: productData.cbd_percent || 'Black',
          image_url: productData.image_url || '',
          is_active: true,
          is_featured: productData.is_featured || false,
          stock: productData.stock || 100,
          inventory: productData.inventory || DEFAULT_INVENTORY,
          origin: productData.origin || '',
        });
        alert('Product added!');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch {
      alert('Failed to save product. Please try again.');
    }
  };

  const handleUpdateOrderStatus = async (orderNumber: string, status: OrderStatus) => {
    try {
      const q2 = query(collection(db, 'orders'));
      const snap2 = await getDocs(q2);
      const orderDoc = snap2.docs.find(d => d.data().order_number === orderNumber);
      if (orderDoc) await updateDoc(doc(db, 'orders', orderDoc.id), { status });
      setOrders((prev) => prev.map((o) => o.order_number === orderNumber ? { ...o, status } : o));
      const local = JSON.parse(localStorage.getItem('myshop_orders') || '[]');
      localStorage.setItem('myshop_orders', JSON.stringify(local.map((o: Order) => o.order_number === orderNumber ? { ...o, status } : o)));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const exportOrdersCSV = () => {
    const headers = ['Order #', 'Customer', 'Phone', 'Address', 'Total', 'Payment', 'Status', 'Date'];
    const rows = orders.map((o) => [o.order_number, o.customer_name, o.phone, o.address, o.total.toString(), o.payment_method, o.status, new Date(o.created_at).toLocaleString()]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleSaveSettings = async () => {
    try {
      await saveSettingsToDB(null, settings);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings. Check your connection.');
    }
  };

  // ── Login Screen ─────────────────────────────────────────────────────────────
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="w-full max-w-md mx-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-white">Admin Login</h1>
              <p className="text-zinc-400 mt-2">Enter your password to continue</p>
            </div>
            <form onSubmit={handleLogin}>
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
                className="input-field text-center mb-4" placeholder="Enter admin password" required />
              <button type="submit" disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Logging in...</> : 'Login'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/" className="text-zinc-400 hover:text-white text-sm">← Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated === null) {
    return <div className="min-h-screen pt-24 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500">Manage your shop</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchOrders} disabled={isRefreshing}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm">
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition-colors text-sm">
              Logout
            </button>
            <Link to="/" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm">
              View Site
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: 'products', label: `Products (${products.length})`, icon: Package },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingCart },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── PRODUCTS TAB ─────────────────────────────────────────────────────── */}
        {activeTab === 'products' && (
          <div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input type="text" placeholder="Search products..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10" />
              </div>
              <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Plus className="w-4 h-4" />Add Product
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800">
                    <tr>
                      {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                        <th key={h} className={`text-zinc-400 text-sm font-medium px-4 py-3 ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-zinc-800/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={product.image_url} alt={product.title} className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=N/A'; }} />
                            </div>
                            <div>
                              <p className="text-white font-medium">{product.title}</p>
                              <p className="text-zinc-500 text-xs">Sizes: {product.thc_percent} | Colors: {product.cbd_percent}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-400">{product.category}</td>
                        <td className="px-4 py-3 text-blue-600 font-medium">${product.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-zinc-400">{product.stock}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${product.is_active ? 'bg-emerald-500/20 text-blue-600' : 'bg-red-500/20 text-red-500'}`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                              className="p-2 text-zinc-400 hover:text-white transition-colors"><Edit className="w-4 h-4" /></button>
                            <button onClick={async () => {
                              if (confirm(`Delete "${product.title}"?`)) {
                                try { await deleteProduct(product.id); } catch { alert('Failed to delete.'); }
                              }
                            }} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProducts.length === 0 && (
                  <div className="text-center py-12 text-zinc-500">No products found</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ───────────────────────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="input-field w-auto">
                <option value="all">All Status</option>
                {['pending','confirmed','delivering','completed','cancelled'].map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <button onClick={exportOrdersCSV} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors">
                <Download className="w-4 h-4" />Export CSV
              </button>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12"><ShoppingCart className="w-16 h-16 text-zinc-700 mx-auto mb-4" /><p className="text-gray-500">No orders found</p></div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.order_number} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="text-white font-mono font-bold">{order.order_number}</p>
                        <p className="text-zinc-500 text-sm">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <select value={order.status} onChange={(e) => handleUpdateOrderStatus(order.order_number, e.target.value as OrderStatus)}
                        className="input-field w-auto py-2">
                        {['pending','confirmed','delivering','completed','cancelled'].map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-zinc-500 text-sm mb-1">Customer</p>
                        <p className="text-white font-medium">{order.customer_name}</p>
                        <p className="text-gray-500">{order.phone}</p>
                        <p className="text-zinc-400 text-sm">{order.address}</p>
                        {order.delivery_location && (
                          <p className="text-amber-500 text-sm mt-1">
                            {STOCK_LOCATIONS.find(l => l.id === order.delivery_location)?.flag} {STOCK_LOCATIONS.find(l => l.id === order.delivery_location)?.displayName}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-zinc-500 text-sm mb-1">Items</p>
                        {order.items.map((item, i) => (
                          <p key={i} className="text-zinc-400 text-sm">{item.quantity}x {item.product.title}</p>
                        ))}
                        <p className="text-blue-600 font-bold mt-2">Total: ${order.total.toFixed(2)}</p>
                        <p className="text-zinc-500 text-sm">Payment: {order.payment_method.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS TAB ─────────────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">

            {/* Save Button (top) */}
            <div className="flex items-center justify-between">
              <p className="text-blue-600 text-sm font-medium">✅ Settings are saved to the cloud — all devices update automatically.</p>
              <button onClick={handleSaveSettings}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                {settingsSaved ? <><CheckCircle className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save All Settings</>}
              </button>
            </div>

            {/* Shop Info */}
            <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Store className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">Shop Info</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Shop Name</label>
                  <input type="text" value={settings.shop_name}
                    onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })}
                    className="input-field" placeholder="e.g. The Fashion" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tagline / Main Subtitle</label>
                  <input type="text" value={settings.shop_tagline}
                    onChange={(e) => setSettings({ ...settings, shop_tagline: e.target.value })}
                    className="input-field" placeholder="e.g. Wholesale & Retail Women Clothing" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Slogan 1</label>
                  <input type="text" value={settings.slogan1 || ''}
                    onChange={(e) => setSettings({ ...settings, slogan1: e.target.value })}
                    className="input-field" placeholder="WHOLESALE & RETAIL WOMEN CLOTHING" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Slogan 2</label>
                  <input type="text" value={settings.slogan2 || ''}
                    onChange={(e) => setSettings({ ...settings, slogan2: e.target.value })}
                    className="input-field" placeholder="MADE IN THAILAND 🇹🇭" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Slogan 3</label>
                  <input type="text" value={settings.slogan3 || ''}
                    onChange={(e) => setSettings({ ...settings, slogan3: e.target.value })}
                    className="input-field" placeholder="Quality, Price, Service" />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">Contact Information</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">📞 Phone Number</label>
                  <input type="text" value={settings.phone_number || ''}
                    onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
                    className="input-field" placeholder="+95 9 257 128 464" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">📍 Shop Address</label>
                  <textarea value={settings.shop_address || ''}
                    onChange={(e) => setSettings({ ...settings, shop_address: e.target.value })}
                    className="input-field" rows={2} placeholder="J-30, 3rd Floor, Yuzana Plaza..." />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">🎵 TikTok URL</label>
                  <input type="text" value={settings.tiktok_url || ''}
                    onChange={(e) => setSettings({ ...settings, tiktok_url: e.target.value })}
                    className="input-field" placeholder="https://www.tiktok.com/@thefashion..." />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">✈️ Telegram Handle (for customers)</label>
                  <input type="text" value={settings.telegram_handle}
                    onChange={(e) => setSettings({ ...settings, telegram_handle: e.target.value })}
                    className="input-field" placeholder="@your_telegram" />
                  <p className="text-gray-400 text-xs mt-1">Shown on header, footer & contact buttons</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Bot Token (for order notifications)</label>
                  <input type="text" value={settings.telegram_bot_token}
                    onChange={(e) => setSettings({ ...settings, telegram_bot_token: e.target.value })}
                    className="input-field font-mono" placeholder="1234567890:ABCDEFGHIJK..." />
                  <p className="text-gray-400 text-xs mt-1">Get from @BotFather on Telegram</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Chat ID (where orders are sent)</label>
                  <input type="text" value={settings.telegram_chat_id}
                    onChange={(e) => setSettings({ ...settings, telegram_chat_id: e.target.value })}
                    className="input-field font-mono" placeholder="-1001234567890" />
                  <p className="text-gray-400 text-xs mt-1">Your personal ID or group chat ID</p>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-800">Payment Methods</h2>
              </div>

              {/* KPay */}
              <div className="mb-6 pb-6 border-b border-blue-100">
                <p className="text-gray-800 font-medium mb-3">📱 KBZ Pay (KPay)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                    <input type="text" value={settings.kpay_number}
                      onChange={(e) => setSettings({ ...settings, kpay_number: e.target.value })}
                      className="input-field" placeholder="09-XXX-XXX-XXX" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Account Name</label>
                    <input type="text" value={settings.kpay_name}
                      onChange={(e) => setSettings({ ...settings, kpay_name: e.target.value })}
                      className="input-field" placeholder="Your Name" />
                  </div>
                </div>
              </div>

              {/* WavePay */}
              <div className="mb-6 pb-6 border-b border-blue-100">
                <p className="text-gray-800 font-medium mb-3">🌊 Wave Pay</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                    <input type="text" value={settings.wavepay_number}
                      onChange={(e) => setSettings({ ...settings, wavepay_number: e.target.value })}
                      className="input-field" placeholder="09-XXX-XXX-XXX" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Account Name</label>
                    <input type="text" value={settings.wavepay_name}
                      onChange={(e) => setSettings({ ...settings, wavepay_name: e.target.value })}
                      className="input-field" placeholder="Your Name" />
                  </div>
                </div>
              </div>

              {/* ABA */}
              <div className="mb-6 pb-6 border-b border-blue-100">
                <p className="text-gray-800 font-medium mb-3">🏦 ABA Bank (Cambodia)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Account Number</label>
                    <input type="text" value={settings.aba_account}
                      onChange={(e) => setSettings({ ...settings, aba_account: e.target.value })}
                      className="input-field" placeholder="000 000 000" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Account Name</label>
                    <input type="text" value={settings.aba_name}
                      onChange={(e) => setSettings({ ...settings, aba_name: e.target.value })}
                      className="input-field" placeholder="Your Name" />
                  </div>
                </div>
              </div>

              {/* USDT */}
              <div>
                <p className="text-gray-800 font-medium mb-3">💎 USDT TRC20</p>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Wallet Address</label>
                  <input type="text" value={settings.usdt_address}
                    onChange={(e) => setSettings({ ...settings, usdt_address: e.target.value })}
                    className="input-field font-mono text-sm" placeholder="TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Key className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-semibold text-gray-800">Security</h2>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Admin Password</label>
                <input type="password" value={settings.admin_password}
                  onChange={(e) => setSettings({ ...settings, admin_password: e.target.value })}
                  className="input-field" placeholder="New admin password" />
                <p className="text-red-500 text-xs mt-1">⚠️ After saving, use this new password to login next time</p>
              </div>
            </div>

            {/* Save Button (bottom) */}
            <button onClick={handleSaveSettings}
              className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-lg">
              {settingsSaved ? <><CheckCircle className="w-5 h-5" />Settings Saved!</> : <><Save className="w-5 h-5" />Save All Settings</>}
            </button>

          </div>
        )}

        {/* Product Modal */}
        {isProductModalOpen && (
          <ProductModalForm
            product={editingProduct}
            onSave={handleSaveProduct}
            onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Product Modal Form ───────────────────────────────────────────────────────
function ProductModalForm({ product, onSave, onClose }: { product: Product | null; onSave: (data: Partial<Product>) => void; onClose: () => void; }) {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: (product?.category || 'Clothing') as ProductCategory,
    thc_percent: product?.thc_percent || '',
    cbd_percent: product?.cbd_percent || '',
    image_url: product?.image_url || '',
    stock: product?.stock || 100,
    inventory: product?.inventory || DEFAULT_INVENTORY,
    origin: product?.origin || '',
    is_featured: product?.is_featured || false,
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden animate-slide-in-up">
        <div className="flex items-center justify-between p-4 border-b border-blue-100">
          <h2 className="text-xl font-semibold text-white">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Price ($) *</label>
              <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })} className="input-field">
                {PRODUCT_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Sizes</label>
              <input type="text" value={formData.thc_percent} onChange={(e) => setFormData({ ...formData, thc_percent: e.target.value })} className="input-field" placeholder="S, M, L, XL" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Colors</label>
              <input type="text" value={formData.cbd_percent} onChange={(e) => setFormData({ ...formData, cbd_percent: e.target.value })} className="input-field" placeholder="Black, White" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Image URL</label>
            <input type="url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="input-field" placeholder="https://..." />
            {formData.image_url && (
              <img src={formData.image_url} alt="preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-zinc-700"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Origin (e.g. China, Thailand)</label>
            <input type="text" value={formData.origin} onChange={(e) => setFormData({ ...formData, origin: e.target.value })} className="input-field" placeholder="China" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Stock by Country</label>
            <div className="grid grid-cols-3 gap-2">
              {STOCK_LOCATIONS.map((loc) => (
                <div key={loc.id}>
                  <label className="block text-xs text-gray-600 mb-1">{loc.flag} {loc.displayName}</label>
                  <input type="number" min="0"
                    value={formData.inventory?.[loc.id as keyof typeof formData.inventory] || 0}
                    onChange={(e) => setFormData({ ...formData, inventory: { ...formData.inventory, [loc.id]: parseInt(e.target.value) || 0 } })}
                    className="input-field" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Total Stock</label>
              <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })} className="input-field" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-5">
              <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-600" />
              <span className="text-white">Featured (HOT)</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" className="flex-1 btn-primary">{product ? 'Update' : 'Add'} Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}
