import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();

  if (!isCartOpen) return null;

  const total = getTotalPrice();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[60] animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-blue-100 z-[70] animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-gray-800">Your Cart</h2>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 text-sm font-medium rounded-full">
              {items.length} items
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-zinc-700 mb-4" />
              <p className="text-gray-500 mb-2">Your cart is empty</p>
              <Link
                to="/shop"
                onClick={() => setIsCartOpen(false)}
                className="text-emerald-500 hover:text-emerald-400 font-medium"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-4 p-3 bg-blue-50/50 rounded-lg"
              >
                {/* Image */}
                <div className="w-20 h-20 bg-blue-50 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.product.image_url}
                    alt={item.product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=No+Image';
                    }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-800 font-medium truncate">{item.product.title}</h3>
                  <p className="text-gray-400 text-sm">{item.product.category}</p>
                  <p className="text-emerald-500 font-semibold mt-1">
                    ${item.product.price.toFixed(2)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 bg-zinc-700 hover:bg-zinc-600 text-gray-800 rounded transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-gray-800 font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 bg-zinc-700 hover:bg-zinc-600 text-gray-800 rounded transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-red-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-blue-100 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-xl font-bold text-gray-800">${total.toFixed(2)}</span>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Link
                to="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="block w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-gray-800 text-center font-semibold rounded-lg transition-colors"
              >
                Proceed to Checkout
              </Link>
              <button
                onClick={() => {
                  clearCart();
                  setIsCartOpen(false);
                }}
                className="w-full py-2 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
