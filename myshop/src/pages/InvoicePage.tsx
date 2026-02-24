import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Check, Printer, MessageCircle, Download, Copy } from 'lucide-react';
import { Order } from '../types';

export function InvoicePage() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  const orderNumber = searchParams.get('order');

  useEffect(() => {
    if (orderNumber) {
      const orders = JSON.parse(localStorage.getItem('myshop_orders') || '[]');
      const foundOrder = orders.find((o: Order) => o.order_number === orderNumber);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    }
  }, [orderNumber]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyOrderId = () => {
    if (order) {
      navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Order not found</h2>
          <p className="text-zinc-400 mb-6">The order you're looking for doesn't exist</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Order Received!</h1>
          <p className="text-zinc-400">
            Thank you for your order. We'll contact you shortly.
          </p>
        </div>

        {/* Order Actions */}
        <div className="flex flex-wrap gap-3 justify-center mb-8 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
          <a
            href="https://t.me/SOS_KH_27"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#0088cc] hover:bg-[#0077b3] text-white rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Contact on Telegram
          </a>
        </div>

        {/* Invoice */}
        <div className="invoice-print bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-emerald-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">INVOICE</h2>
                <p className="text-white/80">MyShop - Sihanoukville Online Shop</p>
              </div>
              <div className="text-right">
                <p className="text-white font-mono text-lg font-bold">{order.order_number}</p>
                <p className="text-white/80 text-sm">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Body */}
          <div className="p-6 space-y-6">
            {/* Customer Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  Customer Details
                </h3>
                <p className="text-white font-medium">{order.customer_name}</p>
                <p className="text-zinc-400">{order.phone}</p>
                <p className="text-zinc-400">{order.address}</p>
                {order.notes && (
                  <p className="text-zinc-500 text-sm mt-2">Note: {order.notes}</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  Order Status
                </h3>
                <span className="inline-flex items-center px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full text-sm font-medium">
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <p className="text-zinc-400 text-sm mt-2">
                  Payment: {order.payment_method.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">
                Order Items
              </h3>
              <div className="border border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-zinc-800">
                    <tr>
                      <th className="text-left text-zinc-400 text-sm font-medium px-4 py-3">
                        Item
                      </th>
                      <th className="text-center text-zinc-400 text-sm font-medium px-4 py-3">
                        Qty
                      </th>
                      <th className="text-right text-zinc-400 text-sm font-medium px-4 py-3">
                        Price
                      </th>
                      <th className="text-right text-zinc-400 text-sm font-medium px-4 py-3">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-white">{item.product.title}</td>
                        <td className="px-4 py-3 text-center text-zinc-400">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-zinc-400">
                          ${item.product.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-white font-medium">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2 text-zinc-400">
                  <span>Subtotal</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 text-zinc-400">
                  <span>Delivery</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-emerald-500">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-emerald-500 font-bold text-xl">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Footer */}
          <div className="bg-zinc-800 p-4 text-center">
            <p className="text-zinc-400 text-sm">
              Thank you for choosing MyShop!
            </p>
            <p className="text-zinc-500 text-xs mt-1">
              Contact us: @SOS_KH_27 | Sihanoukville, Cambodia
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8 no-print">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
