import { useState } from 'react';
import { Plus, Ruler, Palette } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, 1);
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product);
    }
  };

  if (product.stock <= 0) {
    return null;
  }

  return (
    <div className="product-card bg-white border border-blue-100 rounded-xl overflow-hidden group cursor-pointer" onClick={handleViewDetails}>
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-blue-50">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=No+Image';
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <button className="px-4 py-2 bg-white/20 backdrop-blur-sm text-gray-800 text-sm font-medium rounded-lg hover:bg-white/30 transition-colors">
            View Details
          </button>
        </div>

        {product.is_featured && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-black text-xs font-bold rounded">
            HOT
          </div>
        )}

        <div className="absolute top-3 right-3 px-2 py-1 bg-white/80 text-gray-600 text-xs font-medium rounded">
          {product.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-gray-800 font-semibold mb-2 truncate">{product.title}</h3>

        {/* Size / Color badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {product.thc_percent && product.thc_percent !== '-' && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-zinc-700/50 text-gray-600 text-xs rounded">
              <Ruler className="w-3 h-3" />
              {product.thc_percent}
            </span>
          )}
          {product.cbd_percent && product.cbd_percent !== '-' && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-zinc-700/50 text-gray-600 text-xs rounded">
              <Palette className="w-3 h-3" />
              {product.cbd_percent}
            </span>
          )}
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-emerald-500">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isAdding
                ? 'bg-emerald-600 text-gray-800'
                : 'bg-emerald-500 hover:bg-emerald-600 text-gray-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            {isAdding ? 'Added!' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
