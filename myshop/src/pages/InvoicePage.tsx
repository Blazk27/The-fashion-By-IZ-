import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Check, Printer, MessageCircle } from 'lucide-react';
import { Order } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { loadSettings, loadSettingsFromDB } from './AdminPage';

export function InvoicePage() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState(loadSettings());

  const orderNumber = searchParams.get('order');

  useEffect(() => {
    loadSettingsFromDB().then(s => setSettings(s));
  }, []);

  useEffect(() => {
    if (!orderNumber) { setLoading(false); return; }

    const fetchOrder = async () => {
      setLoading(true);
      try {
        // Try Firebase first
        const q = query(collection(db, 'orders'), where('order_number', '==', orderNumber));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          const foundOrder: Order = {
            id: snap.docs[0].id,
            ...docData,
            items: typeof docData.items === 'string' ? JSON.parse(docData.items) : docData.items,
          } as Order;
          setOrder(foundOrder);
        } else {
          // Fallback to localStorage
          const orders = JSON.parse(localStorage.getItem('myshop_orders') || '[]');
          const foundOrder = orders.find((o: Order) => o.order_number === orderNumber);
          if (foundOrder) setOrder(foundOrder);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        // Fallback to localStorage
        const orders = JSON.parse(localStorage.getItem('myshop_orders') || '[]');
        const foundOrder = orders.find((o: Order) => o.order_number === orderNumber);
        if (foundOrder) setOrder(foundOrder);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  const handleCopyOrderId = () => {
    if (order) {
      navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const telegramUrl = settings.telegram_handle
    ? `https://t.me/${settings.telegram_handle.replace('@', '')}`
    : 'https://t.me/thefashion_mm';

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your order...</p>
        </div>
      </div>
    );
  }

  // Order not found
  if (!order) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Order not found</h2>
          <p className="text-gray-500 mb-6">The order you're looking for doesn't exist</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 btn-primary rounded-lg">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-blue-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed! 🎉</h1>
          <p className="text-gray-500">Thank you! We will contact you shortly.</p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center mb-8 no-print">
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-gray-700 rounded-lg hover:bg-blue-50 transition-colors">
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
          <button onClick={handleCopyOrderId}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-gray-700 rounded-lg hover:bg-blue-50 transition-colors">
            {copied ? '✅ Copied!' : '📋 Copy Order ID'}
          </button>
          <a href={telegramUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#0088cc] hover:bg-[#0077b3] text-white rounded-lg transition-colors">
            <MessageCircle className="w-4 h-4" />
            Contact on Telegram
          </a>
        </div>

        {/* Invoice Card */}
        <div className="invoice-print bg-white border border-blue-100 rounded-xl overflow-hidden shadow-sm">

          {/* Invoice Header */}
          <div className="bg-[#1a2580] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">INVOICE</h2>
                <p className="text-blue-200">{settings.shop_name} — {settings.shop_tagline}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-mono text-lg font-bold">{order.order_number}</p>
                <p className="text-blue-200 text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Invoice Body */}
          <div className="p-6 space-y-6">

            {/* Customer + Status */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Customer Details</h3>
                <p className="text-gray-800 font-medium">{order.customer_name}</p>
                <p className="text-gray-500">{order.phone}</p>
                <p className="text-gray-500">{order.address}</p>
                {order.notes && <p className="text-gray-400 text-sm mt-2">Note: {order.notes}</p>}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Order Status</h3>
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  ⏳ {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <p className="text-gray-500 text-sm mt-2">Payment: {order.payment_method.toUpperCase()}</p>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Order Items</h3>
              <div className="border border-blue-100 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="text-left text-gray-500 text-sm font-medium px-4 py-3">Item</th>
                      <th className="text-center text-gray-500 text-sm font-medium px-4 py-3">Qty</th>
                      <th className="text-right text-gray-500 text-sm font-medium px-4 py-3">Price</th>
                      <th className="text-right text-gray-500 text-sm font-medium px-4 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-gray-800">{item.product.title}</td>
                        <td className="px-4 py-3 text-center text-gray-500">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-500">${item.product.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-gray-800 font-medium">${(item.product.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2 text-gray-500"><span>Subtotal</span><span>${order.total.toFixed(2)}</span></div>
                <div className="flex justify-between py-2 text-gray-500"><span>Delivery</span><span className="text-green-500">Free</span></div>
                <div className="flex justify-between py-3 border-t-2 border-blue-600">
                  <span className="text-gray-800 font-semibold">Total</span>
                  <span className="text-blue-600 font-bold text-xl">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Footer */}
          <div className="bg-blue-50 p-4 text-center border-t border-blue-100">
            <p className="text-gray-600 text-sm">Thank you for choosing {settings.shop_name}! 💙</p>
            <p className="text-gray-400 text-xs mt-1">{settings.shop_address}</p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8 no-print">
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 btn-primary rounded-lg">
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
