import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, CreditCard, Check, Loader2, Smartphone, Building2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CheckoutFormData, PaymentMethod, Order, CartItem } from '../types';
import { db, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { loadSettings, loadSettingsFromDB } from './AdminPage';

type MyanmarPayment = 'cod' | 'kpay' | 'wavepay' | 'aya' | 'kbz_bank';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState(loadSettings());

  useEffect(() => {
    loadSettingsFromDB().then(s => setSettings(s));
  }, []);

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    notes: '',
    payment_method: 'cod' as MyanmarPayment,
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const total = getTotalPrice();

  const generateOrderNumber = () => {
    const t = Date.now().toString(36).toUpperCase();
    const r = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${t}${r}`;
  };

  const validateForm = () => {
    const e: Partial<Record<string, string>> = {};
    if (!formData.customer_name.trim()) e.customer_name = 'Name is required';
    if (!formData.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^[0-9+\-\s]{8,}$/.test(formData.phone)) e.phone = 'Please enter a valid phone number';
    if (!formData.address.trim()) e.address = 'Delivery address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const sendTelegramNotification = async (order: any) => {
    const token = settings.telegram_bot_token || TELEGRAM_BOT_TOKEN;
    const chatId = settings.telegram_chat_id || TELEGRAM_CHAT_ID;
    if (!token || !chatId) return false;
    const msg = `🛍️ NEW ORDER: #${order.order_number}
━━━━━━━━━━━━━━━━━━━━━━
👤 ${order.customer_name}
📱 ${order.phone}
📍 ${order.address}${order.notes ? `\n💬 ${order.notes}` : ''}
━━━━━━━━━━━━━━━━━━━━━━
🛒 ITEMS:
${order.items.map((i: CartItem) => `${i.quantity}x ${i.product.title} ($${(i.product.price * i.quantity).toFixed(2)})`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━
💰 TOTAL: $${order.total.toFixed(2)}
💳 PAYMENT: ${order.payment_method.toUpperCase()}
⏰ ${new Date(order.created_at).toLocaleString()}`;
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg }),
      });
      return res.ok;
    } catch { return false; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const orderNumber = generateOrderNumber();
    const orderData: any = {
      id: Date.now().toString(),
      order_number: orderNumber,
      customer_name: formData.customer_name,
      phone: formData.phone,
      address: formData.address,
      delivery_location: 'myanmar',
      notes: formData.notes || '',
      items: items as CartItem[],
      total,
      payment_method: formData.payment_method,
      status: 'pending',
      telegram_sent: false,
      created_at: new Date().toISOString(),
    };
    try {
      await addDoc(collection(db, 'orders'), { ...orderData, items: JSON.stringify(orderData.items) });
      await sendTelegramNotification(orderData);
      clearCart();
      navigate(`/invoice?order=${orderNumber}`);
    } catch (err) {
      console.error('Order failed', err);
      alert('Failed to place order. Please try again.');
    } finally { setIsSubmitting(false); }
  };

  const paymentMethods = [
    {
      id: 'kpay', label: 'KBZ Pay (KPay)', icon: Smartphone, emoji: '📱',
      color: 'from-blue-500 to-blue-600',
      detail: settings.kpay_number ? { line1: settings.kpay_number, line2: `Name: ${settings.kpay_name}` } : null
    },
    {
      id: 'wavepay', label: 'Wave Pay', icon: Smartphone, emoji: '🌊',
      color: 'from-cyan-500 to-blue-500',
      detail: settings.wavepay_number ? { line1: settings.wavepay_number, line2: `Name: ${settings.wavepay_name}` } : null
    },
    {
      id: 'aya', label: 'AYA Bank Transfer', icon: Building2, emoji: '🏦',
      color: 'from-indigo-500 to-blue-600',
      detail: settings.aya_account ? { line1: `Account: ${settings.aya_account}`, line2: `Name: ${settings.aya_name}` } : null
    },
    {
      id: 'kbz_bank', label: 'KBZ Bank Transfer', icon: Building2, emoji: '🏦',
      color: 'from-blue-600 to-indigo-600',
      detail: settings.kbz_account ? { line1: `Account: ${settings.kbz_account}`, line2: `Name: ${settings.kbz_name}` } : null
    },
    {
      id: 'cod', label: 'Cash on Delivery', icon: CreditCard, emoji: '💵',
      color: 'from-emerald-500 to-green-600',
      detail: null
    },
  ];

  const selectedPayment = paymentMethods.find(p => p.id === formData.payment_method);

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-blue-50">
        <div className="text-center bg-white rounded-2xl p-10 shadow-sm border border-blue-100">
          <ShoppingCart className="w-16 h-16 text-blue-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Add some products first</p>
          <Link to="/shop" className="btn-primary rounded-xl px-8">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-blue-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout 🛍️</h1>

        <div className="grid lg:grid-cols-5 gap-8">

          {/* ── Form ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Customer Info */}
            <div className="bg-white rounded-2xl border border-blue-50 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Your Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Full Name *</label>
                  <input type="text" name="customer_name" value={formData.customer_name} onChange={handleChange}
                    className={`input-field ${errors.customer_name ? 'border-red-400' : ''}`}
                    placeholder="Your full name" />
                  {errors.customer_name && <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Phone Number * (Myanmar)</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    className={`input-field ${errors.phone ? 'border-red-400' : ''}`}
                    placeholder="09-XXX-XXX-XXX" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Delivery Address * 🇲🇲</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={3}
                    className={`input-field ${errors.address ? 'border-red-400' : ''}`}
                    placeholder="Township, City, Myanmar" />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Notes (optional)</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2}
                    className="input-field" placeholder="Size, color, special instructions..." />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-blue-50 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">💳 Payment Method</h2>
              <div className="space-y-3">
                {paymentMethods.map((m) => (
                  <label key={m.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.payment_method === m.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-100 hover:border-blue-200 bg-white'
                    }`}>
                    <input type="radio" name="payment_method" value={m.id}
                      checked={formData.payment_method === m.id}
                      onChange={() => setFormData(p => ({ ...p, payment_method: m.id as MyanmarPayment }))}
                      className="sr-only" />
                    <div className={`w-10 h-10 bg-gradient-to-br ${m.color} rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm`}>
                      {m.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{m.label}</p>
                      {m.detail && (
                        <p className="text-sm text-blue-600 font-mono">{m.detail.line1}</p>
                      )}
                    </div>
                    {formData.payment_method === m.id && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </label>
                ))}
              </div>

              {/* Payment detail box */}
              {selectedPayment?.detail && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-gray-500 text-sm mb-2 font-medium">Transfer to:</p>
                  <p className="text-gray-800 font-bold font-mono text-lg">{selectedPayment.detail.line1}</p>
                  <p className="text-gray-600 text-sm mt-1">{selectedPayment.detail.line2}</p>
                  <p className="text-blue-500 text-xs mt-3 font-medium">📸 Send payment screenshot to our Telegram after paying</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-blue-50 p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-4">🛒 Order Summary</h2>

              <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-14 h-14 bg-blue-50 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.product.image_url} alt={item.product.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-medium text-sm truncate">{item.product.title}</p>
                      <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-blue-600 font-bold text-sm">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-blue-50 pt-4 space-y-2 mb-5">
                <div className="flex justify-between text-gray-400 text-sm"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Delivery</span><span className="text-emerald-500 font-medium">Free 🎁</span></div>
                <div className="flex justify-between text-gray-800 font-bold text-lg pt-2 border-t border-blue-50">
                  <span>Total</span><span className="text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <button type="button" onClick={handleSubmit} disabled={isSubmitting}
                className="w-full btn-primary py-4 rounded-xl text-base gap-2">
                {isSubmitting
                  ? <><Loader2 className="w-5 h-5 animate-spin" />Placing Order...</>
                  : <>Place Order — ${total.toFixed(2)}</>
                }
              </button>

              <p className="text-gray-400 text-xs text-center mt-3">
                🔒 Your information is secure
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
