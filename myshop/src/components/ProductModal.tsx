import { useState } from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product, quantity);
    setTimeout(() => {
      setIsAdding(false);
      onClose();
      setQuantity(1);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white border border-blue-200 rounded-2xl overflow-hidden animate-slide-in-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-blue-50 hover:bg-zinc-700 text-gray-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="aspect-square md:aspect-auto bg-blue-50">
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=No+Image';
              }}
            />
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col">
            {/* Category */}
            <span className="text-sm text-emerald-500 font-medium mb-2">
              {product.category}
            </span>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{product.title}</h2>

            {/* Potency Badges */}
            <div className="flex items-center gap-2 mb-4">
              {product.thc_percent !== '-' && (
                <span className="potency-badge bg-blue-600/20 text-blue-600">
                  Size {product.thc_percent}
                </span>
              )}
              {product.cbd_percent !== '-' && (
                <span className="potency-badge bg-blue-500/20 text-blue-400">
                  Color {product.cbd_percent}
                </span>
              )}
            </div>

            {/* Price */}
            <p className="text-3xl font-bold text-emerald-500 mb-4">
              ${product.price.toFixed(2)}
            </p>

            {/* Description */}
            <p className="text-gray-500 mb-6 flex-1">
              {product.description}
            </p>

            {/* Stock Info */}
            <p className="text-sm text-gray-400 mb-4">
              {product.stock > 0 ? (
                <span className="text-emerald-500">In Stock ({product.stock} available)</span>
              ) : (
                <span className="text-red-500">Out of Stock</span>
              )}
            </p>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 bg-blue-50 hover:bg-zinc-700 text-gray-800 rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-gray-800 font-semibold w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-2 bg-blue-50 hover:bg-zinc-700 text-gray-800 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    isAdding
                      ? 'bg-emerald-600 text-gray-800'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-gray-800'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {isAdding ? 'Added to Cart!' : `Add to Cart - $${(product.price * quantity).toFixed(2)}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
