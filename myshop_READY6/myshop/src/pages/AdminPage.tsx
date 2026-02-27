import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, ShoppingCart, Plus, Edit, Trash2, X, Search, Download,
  Lock, Loader2, Settings, Save, Store, MessageCircle, CreditCard,
  Key, CheckCircle, Phone, MapPin, Globe, Image, Type, LayoutDashboard,
  Eye, EyeOff, RefreshCw
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { Product, Order, ProductCategory, PRODUCT_CATEGORIES, OrderStatus, DEFAULT_INVENTORY, STOCK_LOCATIONS } from '../types';
import { db, ADMIN_PASSWORD } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, orderBy, setDoc, getDoc } from 'firebase/firestore';

// ─── Shop Settings Type ───────────────────────────────────────────────────────
export interface ShopSettings {
  shop_name: string;
  shop_tagline: string;
  slogan1: string;
  slogan2: string;
  slogan3: string;
  hero_subtitle: string;
  phone_number: string;
  shop_address: string;
  facebook_url: string;
  tiktok_url: string;
  telegram_handle: string;
  telegram_bot_token: string;
  telegram_chat_id: string;
  kpay_number: string;
  kpay_name: string;
  wavepay_number: string;
  wavepay_name: string;
  aya_account: string;
  aya_name: string;
  kbz_account: string;
  kbz_name: string;
  admin_password: string;
}

const DEFAULT_SETTINGS: ShopSettings = {
  shop_name: 'The Fashion By IZ',
  shop_tagline: 'Wholesale & Retail Women Clothing',
  slogan1: 'WHOLESALE & RETAIL WOMEN CLOTHING',
  slogan2: 'MADE IN THAILAND 🇹🇭',
  slogan3: 'Quality, Price, Service',
  hero_subtitle: 'Premium fashion at wholesale prices — Made in Thailand',
  phone_number: '+95 9 257 128 464',
  shop_address: 'J-30, 3rd Floor, Yuzana Plaza, Banyardala Street, MinglarTaungNyunt, Yangon, Myanmar',
  facebook_url: 'https://www.facebook.com/TheFashionbyIZ',
  tiktok_url: 'https://www.tiktok.com/@thefashion_thefashion2',
  telegram_handle: '@thefashion_mm',
  telegram_bot_token: '',
  telegram_chat_id: '',
  kpay_number: '09-257-128-464',
  kpay_name: 'The Fashion By IZ',
  wavepay_number: '09-250-936-673',
  wavepay_name: 'The Fashion By IZ',
  aya_account: '',
  aya_name: 'The Fashion By IZ',
  kbz_account: '',
  kbz_name: 'The Fashion By IZ',
  admin_password: '212721',
};

// ─── Settings helpers ─────────────────────────────────────────────────────────
export function loadSettings(): ShopSettings {
  try {
    const raw = localStorage.getItem('myshop_settings_cache');
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { return DEFAULT_SETTINGS; }
}

export function saveSettingsCache(s: ShopSettings) {
  localStorage.setItem('myshop_settings_cache', JSON.stringify(s));
}

export async function loadSettingsFromDB(_unused?: any): Promise<ShopSettings> {
  try {
    const snap = await getDoc(doc(db, 'config', 'shop_settings'));
    if (!snap.exists()) return loadSettings();
    const data = snap.data() as Partial<ShopSettings>;
    const merged = { ...DEFAULT_SETTINGS, ...data };
    saveSettingsCache(merged);
    return merged;
  } catch { return loadSettings(); }
}

export async function saveSettingsToDB(_unused: any, s: ShopSettings): Promise<void> {
  saveSettingsCache(s);
  await setDoc(doc(db, 'config', 'shop_settings'), s);
}

// ─── AdminPage ────────────────────────────────────────────────────────────────
export function AdminPage() {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'homepage' | 'contact' | 'payment' | 'security'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [settings, setSettings] = useState<ShopSettings>(loadSettings());
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('myshop_admin_auth');
    setIsAuthenticated(auth === 'true');
    loadSettingsFromDB().then(s => setSettings(s));
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setIsRefreshing(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({
        id: d.id, ...d.data(),
        items: typeof d.data().items === 'string' ? JSON.parse(d.data().items) : d.data().items,
      })) as Order[];
      setOrders(data);
    } catch {
      const local = JSON.parse(localStorage.getItem('myshop_orders') || '[]');
      setOrders(local.reverse());
    } finally { setIsRefreshing(false); }
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

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await saveSettingsToDB(null, settings);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch { alert('Failed to save. Check internet connection.'); }
    finally { setIsSaving(false); }
  };

  const handleUpdateStatus = async (orderNumber: string, status: OrderStatus) => {
    try {
      const snap = await getDocs(collection(db, 'orders'));
      const orderDoc = snap.docs.find(d => d.data().order_number === orderNumber);
      if (orderDoc) await updateDoc(doc(db, 'orders', orderDoc.id), { status });
      setOrders(prev => prev.map(o => o.order_number === orderNumber ? { ...o, status } : o));
    } catch (err) { console.error('Error updating status:', err); }
  };

  const handleSaveProduct = async (data: Partial<Product>) => {
    try {
      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...data });
      } else {
        await addProduct(data as Omit<Product, 'id' | 'created_at'>);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (err) { console.error('Error saving product:', err); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await deleteProduct(id);
  };

  const exportOrdersCSV = () => {
    const headers = ['Order #', 'Customer', 'Phone', 'Address', 'Total', 'Payment', 'Status', 'Date'];
    const rows = orders.map(o => [o.order_number, o.customer_name, o.phone, o.address, o.total.toString(), o.payment_method, o.status, new Date(o.created_at).toLocaleString()]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);

  // ── Login ─────────────────────────────────────────────────────────────────
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl shadow-blue-900/30 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
              <p className="text-gray-400 mt-1 text-sm">The Fashion By IZ — Dashboard</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="input-field text-center pr-12"
                  placeholder="Enter admin password"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full btn-primary py-3 rounded-xl">
                {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Logging in...</> : 'Login to Dashboard'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/" className="text-blue-500 hover:text-blue-700 text-sm">← Back to Shop</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: `Products (${products.length})`, icon: Package },
    { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingCart },
    { id: 'homepage', label: 'Homepage', icon: Type },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Key },
  ];

  const SaveButton = ({ full = false }) => (
    <button onClick={handleSaveSettings} disabled={isSaving}
      className={`flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors ${full ? 'w-full justify-center py-4 text-base' : ''}`}>
      {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
        : settingsSaved ? <><CheckCircle className="w-4 h-4" />Saved! ✅</>
        : <><Save className="w-4 h-4" />Save Changes</>}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">The Fashion By IZ — Control Panel</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchOrders} disabled={isRefreshing}
              className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link to="/" className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-blue-50 text-sm font-medium transition-colors">
              View Site
            </Link>
            <button onClick={handleLogout}
              className="px-4 py-2 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-100 text-sm font-medium transition-colors">
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-white text-gray-500 border border-gray-100 hover:bg-blue-50 hover:text-blue-600'
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'orders' && pendingOrders > 0 && (
                <span className="ml-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingOrders}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Products', value: products.length, icon: Package, color: 'bg-blue-500' },
                { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'bg-indigo-500' },
                { label: 'Pending Orders', value: pendingOrders, icon: ShoppingCart, color: 'bg-amber-500' },
                { label: 'Total Revenue', value: `$${totalRevenue.toFixed(0)}`, icon: CreditCard, color: 'bg-emerald-500' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Add Product', icon: Plus, action: () => { setEditingProduct(null); setIsProductModalOpen(true); }, color: 'bg-blue-600' },
                  { label: 'View Orders', icon: ShoppingCart, action: () => setActiveTab('orders'), color: 'bg-indigo-600' },
                  { label: 'Edit Homepage', icon: Type, action: () => setActiveTab('homepage'), color: 'bg-purple-600' },
                  { label: 'Edit Contact', icon: Phone, action: () => setActiveTab('contact'), color: 'bg-emerald-600' },
                ].map((item) => (
                  <button key={item.label} onClick={item.action}
                    className={`${item.color} text-white rounded-xl p-4 flex flex-col items-center gap-2 hover:opacity-90 transition-opacity`}>
                    <item.icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="input-field pl-10" placeholder="Search products..." />
              </div>
              <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                className="btn-primary rounded-xl gap-2 px-5">
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-40 bg-gray-50 overflow-hidden">
                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight">{product.title}</h3>
                      <span className={`ml-2 flex-shrink-0 w-2 h-2 rounded-full mt-1 ${product.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    </div>
                    <p className="text-blue-600 font-bold">${product.price.toFixed(2)}</p>
                    <p className="text-gray-400 text-xs mb-3">{product.category} • Stock: {product.stock}</p>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 text-red-500 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-sm">{orders.length} total orders</p>
              <button onClick={exportOrdersCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-800 font-mono">{order.order_number}</p>
                        <p className="text-gray-600 font-medium">{order.customer_name}</p>
                        <p className="text-gray-400 text-sm">{order.phone}</p>
                        <p className="text-gray-400 text-sm">{order.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-600 font-bold text-lg">${order.total.toFixed(2)}</p>
                        <p className="text-gray-400 text-xs">{order.payment_method.toUpperCase()}</p>
                        <p className="text-gray-300 text-xs mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(['pending', 'confirmed', 'delivering', 'completed', 'cancelled'] as OrderStatus[]).map((status) => (
                        <button key={status} onClick={() => handleUpdateStatus(order.order_number, status)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors ${
                            order.status === status
                              ? status === 'completed' ? 'bg-emerald-100 text-emerald-700'
                                : status === 'cancelled' ? 'bg-red-100 text-red-600'
                                : status === 'delivering' ? 'bg-blue-100 text-blue-700'
                                : status === 'confirmed' ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}>
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HOMEPAGE ── */}
        {activeTab === 'homepage' && (
          <div className="space-y-5 max-w-2xl">
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-sm">☁️ Changes save to cloud — all devices update instantly</p>
              <SaveButton />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-gray-800">Shop Name & Branding</h2>
              </div>
              {[
                { label: 'Shop Name', key: 'shop_name', placeholder: 'The Fashion By IZ' },
                { label: 'Main Tagline (under name)', key: 'shop_tagline', placeholder: 'Wholesale & Retail Women Clothing' },
                { label: 'Hero Subtitle (small text)', key: 'hero_subtitle', placeholder: 'Premium fashion at wholesale prices' },
                { label: 'Slogan Badge 1', key: 'slogan1', placeholder: 'WHOLESALE & RETAIL WOMEN CLOTHING' },
                { label: 'Slogan Badge 2', key: 'slogan2', placeholder: 'MADE IN THAILAND 🇹🇭' },
                { label: 'Slogan Badge 3', key: 'slogan3', placeholder: 'Quality, Price, Service' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-500 mb-1">{label}</label>
                  <input type="text" value={(settings as any)[key] || ''}
                    onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                    className="input-field" placeholder={placeholder} />
                </div>
              ))}
            </div>
            <SaveButton full />
          </div>
        )}

        {/* ── CONTACT ── */}
        {activeTab === 'contact' && (
          <div className="space-y-5 max-w-2xl">
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-sm">☁️ Changes save to cloud — all devices update instantly</p>
              <SaveButton />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-gray-800">Contact Information</h2>
              </div>
              {[
                { label: '📞 Phone Number', key: 'phone_number', placeholder: '+95 9 257 128 464' },
                { label: '📍 Shop Address', key: 'shop_address', placeholder: 'J-30, 3rd Floor, Yuzana Plaza...', textarea: true },
                { label: '✈️ Telegram Handle', key: 'telegram_handle', placeholder: '@thefashion_mm' },
                { label: '📘 Facebook Page URL', key: 'facebook_url', placeholder: 'https://www.facebook.com/TheFashionbyIZ' },
                { label: '🎵 TikTok URL', key: 'tiktok_url', placeholder: 'https://www.tiktok.com/@...' },
              ].map(({ label, key, placeholder, textarea }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-500 mb-1">{label}</label>
                  {textarea ? (
                    <textarea value={(settings as any)[key] || ''}
                      onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                      className="input-field" rows={2} placeholder={placeholder} />
                  ) : (
                    <input type="text" value={(settings as any)[key] || ''}
                      onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                      className="input-field" placeholder={placeholder} />
                  )}
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                <h2 className="font-bold text-gray-800">Telegram Bot (Order Notifications)</h2>
              </div>
              {[
                { label: 'Bot Token', key: 'telegram_bot_token', placeholder: '1234567890:ABCDEF...' },
                { label: 'Chat ID', key: 'telegram_chat_id', placeholder: '-1001234567890' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-500 mb-1">{label}</label>
                  <input type="text" value={(settings as any)[key] || ''}
                    onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                    className="input-field font-mono text-sm" placeholder={placeholder} />
                </div>
              ))}
            </div>
            <SaveButton full />
          </div>
        )}

        {/* ── PAYMENT ── */}
        {activeTab === 'payment' && (
          <div className="space-y-5 max-w-2xl">
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-sm">☁️ Changes save to cloud — all devices update instantly</p>
              <SaveButton />
            </div>

            {/* KPay */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="font-bold text-gray-800 mb-4 flex items-center gap-2">📱 KBZ Pay (KPay)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
                  <input type="text" value={settings.kpay_number}
                    onChange={e => setSettings({ ...settings, kpay_number: e.target.value })}
                    className="input-field" placeholder="09-XXX-XXX-XXX" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Account Name</label>
                  <input type="text" value={settings.kpay_name}
                    onChange={e => setSettings({ ...settings, kpay_name: e.target.value })}
                    className="input-field" placeholder="Your Name" />
                </div>
              </div>
            </div>

            {/* Wave Pay */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="font-bold text-gray-800 mb-4 flex items-center gap-2">🌊 Wave Pay</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
                  <input type="text" value={settings.wavepay_number}
                    onChange={e => setSettings({ ...settings, wavepay_number: e.target.value })}
                    className="input-field" placeholder="09-XXX-XXX-XXX" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Account Name</label>
                  <input type="text" value={settings.wavepay_name}
                    onChange={e => setSettings({ ...settings, wavepay_name: e.target.value })}
                    className="input-field" placeholder="Your Name" />
                </div>
              </div>
            </div>

            {/* AYA Bank */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="font-bold text-gray-800 mb-4 flex items-center gap-2">🏦 AYA Bank Transfer</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Account Number</label>
                  <input type="text" value={settings.aya_account}
                    onChange={e => setSettings({ ...settings, aya_account: e.target.value })}
                    className="input-field" placeholder="AYA account number" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Account Name</label>
                  <input type="text" value={settings.aya_name}
                    onChange={e => setSettings({ ...settings, aya_name: e.target.value })}
                    className="input-field" placeholder="Your Name" />
                </div>
              </div>
            </div>

            {/* KBZ Bank */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="font-bold text-gray-800 mb-4 flex items-center gap-2">🏦 KBZ Bank Transfer</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Account Number</label>
                  <input type="text" value={settings.kbz_account}
                    onChange={e => setSettings({ ...settings, kbz_account: e.target.value })}
                    className="input-field" placeholder="KBZ account number" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Account Name</label>
                  <input type="text" value={settings.kbz_name}
                    onChange={e => setSettings({ ...settings, kbz_name: e.target.value })}
                    className="input-field" placeholder="Your Name" />
                </div>
              </div>
            </div>

            <SaveButton full />
          </div>
        )}

        {/* ── SECURITY ── */}
        {activeTab === 'security' && (
          <div className="space-y-5 max-w-md">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Key className="w-5 h-5 text-red-500" />
                <h2 className="font-bold text-gray-800">Change Admin Password</h2>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">New Password</label>
                <input type="password" value={settings.admin_password}
                  onChange={e => setSettings({ ...settings, admin_password: e.target.value })}
                  className="input-field" placeholder="Enter new password" />
                <p className="text-red-400 text-xs mt-2">⚠️ Write this down — you need it to login next time</p>
              </div>
            </div>
            <SaveButton full />
          </div>
        )}

      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <ProductModalForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
        />
      )}
    </div>
  );
}

// ─── Product Modal Form ───────────────────────────────────────────────────────
function ProductModalForm({ product, onSave, onClose }: {
  product: Product | null;
  onSave: (data: Partial<Product>) => void;
  onClose: () => void;
}) {
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
    is_active: product?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl animate-slide-in-up">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Product Title *</label>
            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="input-field" required />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="input-field" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Price ($) *</label>
              <input type="number" step="0.01" value={formData.price}
                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="input-field" required />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Category</label>
              <select value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                className="input-field">
                {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Sizes</label>
              <input type="text" value={formData.thc_percent}
                onChange={e => setFormData({ ...formData, thc_percent: e.target.value })}
                className="input-field" placeholder="S, M, L, XL" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Colors</label>
              <input type="text" value={formData.cbd_percent}
                onChange={e => setFormData({ ...formData, cbd_percent: e.target.value })}
                className="input-field" placeholder="Black, White" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Image URL</label>
            <input type="url" value={formData.image_url}
              onChange={e => setFormData({ ...formData, image_url: e.target.value })}
              className="input-field" placeholder="https://..." />
            {formData.image_url && (
              <img src={formData.image_url} alt="preview"
                className="mt-2 w-full h-32 object-cover rounded-xl border border-gray-100"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Stock</label>
              <input type="number" value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="input-field" />
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_featured}
                  onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">⭐ Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">✅ Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary rounded-xl py-3">Cancel</button>
            <button type="submit" className="flex-1 btn-primary rounded-xl py-3">
              {product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
