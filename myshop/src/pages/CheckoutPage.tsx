import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, CreditCard, Wallet, Bitcoin, Check, Loader2, MapPin, Clock, Smartphone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CheckoutFormData, PaymentMethod, Order, CartItem, StockLocation, STOCK_LOCATIONS } from '../types';
import { db, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { loadSettings, loadSettingsFromDB } from './AdminPage';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState(loadSettings());
  useEffect(() => {
    loadSettingsFromDB().then(s => setSettings(s));
  }, []);

  const [formData, setFormData] = useState<CheckoutFormData>({
    customer_name: '',
    phone: '',
    address: '',
    delivery_location: 'myanmar',
    notes: '',
    payment_method: 'cod',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const total = getTotalPrice();

  const generateOrderNumber = () => {
    const t = Date.now().toString(36).toUpperCase();
    const r = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${t}${r}`;
  };

  const validateForm = () => {
    const e: Partial<Record<keyof CheckoutFormData, string>> = {};
    if (!formData.customer_name.trim()) e.customer_name = 'Name is required';
    if (!formData.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^[0-9+\-\s]{8,}$/.test(formData.phone)) e.phone = 'Please enter a valid phone number';
    if (!formData.address.trim()) e.address = 'Delivery address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CheckoutFormData]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const sendTelegramNotification = async (order: Order) => {
    const token = settings.telegram_bot_token || TELEGRAM_BOT_TOKEN;
    const chatId = settings.telegram_chat_id || TELEGRAM_CHAT_ID;
    if (!token || !chatId) return false;
    const loc = STOCK_LOCATIONS.find(l => l.id === order.delivery_location);
    const msg = `🛍️ NEW ORDER: #${order.order_number}\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n👤 ${order.customer_name}\n📱 ${order.phone}\n📍 ${loc?.flag} ${loc?.displayName}\n📝 ${order.address}${order.notes ? `\n💬 ${order.notes}` : ''}\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n🛒 ITEMS:\n${order.items.map((i: CartItem) => `${i.quantity}x ${i.product.title} ($${(i.product.price * i.quantity).toFixed(2)})`).join('\n')}\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n💰 TOTAL: $${order.total.toFixed(2)}\n💳 PAYMENT: ${order.payment_method.toUpperCase()}\n⏰ ${new Date(order.created_at).toLocaleString()}`;
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
    const orderData: Order = {
      id: Date.now().toString(),
      order_number: orderNumber,
      customer_name: formData.customer_name,
      phone: formData.phone,
      address: formData.address,
      delivery_location: formData.delivery_location,
      notes: formData.notes || '',
      items: items as CartItem[],
      total,
      payment_method: formData.payment_method,
      status: 'pending',
      telegram_sent: false,
      created_at: new Date().toISOString(),
    };
    try {
      const ref = await addDoc(collection(db, 'orders'), { ...orderData, items: JSON.stringify(orderData.items) });
      const data = { id: ref.id, ...orderData };
      const error = null;
      if (error) {
        const local = JSON.parse(localStorage.getItem('myshop_orders') || '[]');
        local.push(orderData);
        localStorage.setItem('myshop_orders', JSON.stringify(local));
      }
      const sent = await sendTelegramNotification(orderData);
      // telegram_sent already saved with order
      clearCart();
      navigate(`/invoice?order=${orderNumber}`);
    } catch { console.error('Order failed'); }
    finally { setIsSubmitting(false); }
  };

  const paymentMethods = [
    { id: 'cod', label: 'Cash on Delivery', icon: Wallet, desc: 'Pay when you receive', detail: null },
    { id: 'kpay', label: 'KBZ Pay (KPay)', icon: Smartphone, desc: 'Myanmar mobile payment 🇲🇲', detail: { line1: settings.kpay_number, line2: `Name: ${settings.kpay_name}` } },
    { id: 'wavepay', label: 'Wave Pay', icon: Smartphone, desc: 'Myanmar mobile payment 🇲🇲', detail: { line1: settings.wavepay_number, line2: `Name: ${settings.wavepay_name}` } },
    { id: 'aba', label: 'ABA Bank', icon: CreditCard, desc: 'Cambodia bank transfer 🇰🇭', detail: { line1: `Account: ${settings.aba_account}`, line2: `Name: ${settings.aba_name}` } },
    { id: 'usdt', label: 'USDT TRC20', icon: Bitcoin, desc: 'Crypto payment', detail: { line1: settings.usdt_address, line2: 'TRC20 Network only' } },
  ];

  const selectedPayment = paymentMethods.find(p => p.id === formData.payment_method);

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
          <p className="text-zinc-400 mb-6">Add some products first</p>
          <Link to="/shop" className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="order-2 lg:order-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  <h2 className="text-xl font-semibold text-white">Delivery Country</h2>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {STOCK_LOCATIONS.map((loc) => (
                    <button key={loc.id} type="button" onClick={() => setFormData(p => ({ ...p, delivery_location: loc.id }))}
                      className={`p-4 rounded-xl border text-center transition-all ${formData.delivery_location === loc.id ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-700 hover:border-zinc-600'}`}>
                      <div className="text-3xl mb-1">{loc.flag}</div>
                      <div className="text-white text-sm font-medium">{loc.displayName}</div>
                      <div className="text-amber-500 text-xs mt-1">{loc.eta}</div>
                      {formData.delivery_location === loc.id && <Check className="w-4 h-4 text-amber-500 mx-auto mt-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Your Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Full Name *</label>
                    <input type="text" name="customer_name" value={formData.customer_name} onChange={handleChange}
                      className={`input-field ${errors.customer_name ? 'border-red-500' : ''}`} placeholder="Your full name" />
                    {errors.customer_name && <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Phone *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      className={`input-field ${errors.phone ? 'border-red-500' : ''}`} placeholder="+95 9 xxx xxx xxx" />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Delivery Address *</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} rows={3}
                      className={`input-field ${errors.address ? 'border-red-500' : ''}`} placeholder="Full delivery address" />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Notes (optional)</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="input-field" placeholder="Any special instructions?" />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {paymentMethods.map((m) => (
                    <label key={m.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${formData.payment_method === m.id ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-700 hover:border-zinc-600'}`}>
                      <input type="radio" name="payment_method" value={m.id} checked={formData.payment_method === m.id}
                        onChange={() => setFormData(p => ({ ...p, payment_method: m.id as PaymentMethod }))} className="sr-only" />
                      <div className={`p-2 rounded-lg ${formData.payment_method === m.id ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                        <m.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{m.label}</p>
                        <p className="text-sm text-zinc-400">{m.desc}</p>
                      </div>
                      {formData.payment_method === m.id && <Check className="w-5 h-5 text-amber-500" />}
                    </label>
                  ))}
                </div>

                {/* Payment detail box - shows info from Settings */}
                {selectedPayment?.detail && (
                  <div className="mt-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                    <p className="text-zinc-400 text-sm mb-2">Transfer to:</p>
                    <p className="text-white font-mono font-bold">{selectedPayment.detail.line1}</p>
                    <p className="text-zinc-300 text-sm mt-1">{selectedPayment.detail.line2}</p>
                    <p className="text-amber-500 text-xs mt-2">📸 Send screenshot to our Telegram after payment</p>
                  </div>
                )}
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-600 text-black font-semibold rounded-xl transition-colors text-lg">
                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" />Processing...</> : <>Place Order — ${total.toFixed(2)}</>}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div className="order-1 lg:order-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
              <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                {(() => { const loc = STOCK_LOCATIONS.find(l => l.id === formData.delivery_location); return (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{loc?.flag}</span>
                    <div>
                      <p className="text-white font-medium">{loc?.displayName}</p>
                      <div className="flex items-center gap-1 text-amber-500 text-sm">
                        <Clock className="w-3 h-3" /><span>{loc?.eta} Delivery</span>
                      </div>
                    </div>
                  </div>
                ); })()}
              </div>
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.product.image_url} alt={item.product.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{item.product.title}</p>
                      <p className="text-zinc-400 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-amber-500 font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-800 pt-4 space-y-2">
                <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                <div className="flex justify-between text-zinc-400"><span>Delivery</span><span className="text-emerald-500">Free</span></div>
                <div className="flex justify-between text-white font-semibold text-lg pt-2 border-t border-zinc-800">
                  <span>Total</span><span className="text-amber-500">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
