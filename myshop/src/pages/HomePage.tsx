import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Truck, ShoppingBag, MapPin, Clock, CheckCircle, MessageCircle, Send, Zap } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { Product, STOCK_LOCATIONS } from '../types';
import { loadSettings, loadSettingsFromDB, ShopSettings } from './AdminPage';

export function HomePage() {
  const { featuredProducts } = useProducts();
  const [settings, setSettings] = useState<ShopSettings>(loadSettings());
  useEffect(() => {
    loadSettingsFromDB().then(s => setSettings(s));
  }, []);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const trustBadges = [
    { icon: ShoppingBag, label: 'Quality Products', desc: 'Sourced from trusted suppliers' },
    { icon: Shield, label: 'Secure Payment', desc: 'Safe & encrypted transactions' },
    { icon: Truck, label: 'Fast Delivery', desc: 'Myanmar, Cambodia & Thailand' },
    { icon: Zap, label: 'Best Price', desc: 'Wholesale price, retail quality' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1580] via-[#0d1a80] to-[#0a1060]" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-700/15 rounded-full blur-[100px]" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050d40_80%)]" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/30 rounded-full mb-10 animate-fade-in-up">
            <span className="text-white text-sm font-medium tracking-wide uppercase">
              🛍️ Fashion & Lifestyle — Myanmar · Cambodia · Thailand
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {settings.shop_name || 'The Fashion'}
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-blue-200 mb-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            {settings.shop_tagline}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: '0.18s' }}>
            {[settings.slogan1, settings.slogan2, settings.slogan3].filter(Boolean).map((s, i) => (
              <span key={i} className="px-4 py-1.5 bg-white/15 border border-white/25 rounded-full text-white text-sm font-medium">{s}</span>
            ))}
          </div>

          <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Wholesale & Retail Women Clothing — Quality, Price, Service.
            <span className="text-blue-300"> Made in Thailand 🇹🇭</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-3 px-10 py-4 btn-primary text-lg rounded-xl"
            >
              Shop Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href={`https://t.me/${settings.telegram_handle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-10 py-4 btn-outline text-lg rounded-xl"
            >
              <MessageCircle className="w-5 h-5" />
              Contact via Telegram
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="w-8 h-14 border-2 border-white/30 rounded-full flex justify-center pt-3">
            <div className="w-1.5 h-4 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 bg-white border-y border-blue-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge, index) => (
              <div key={index} className="trust-badge">
                <badge.icon className="trust-badge-icon" />
                <div>
                  <div className="text-white font-medium text-sm">{badge.label}</div>
                  <div className="text-zinc-500 text-xs">{badge.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="premium-card p-8 text-center group">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">100% Authentic</h3>
              <p className="text-gray-500">All products are genuine and sourced directly from verified suppliers</p>
            </div>
            <div className="premium-card p-8 text-center group">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Truck className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Cross-Border Delivery</h3>
              <p className="text-gray-500">Fast and reliable delivery across Myanmar, Cambodia & Thailand</p>
            </div>
            <div className="premium-card p-8 text-center group">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Star className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Best Price</h3>
              <p className="text-gray-500">We buy wholesale so you get the best prices on the market</p>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Locations */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 border border-amber-500/30 rounded-full mb-6">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 text-sm font-medium">Delivery Areas</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">We Deliver To</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Order from anywhere in Southeast Asia. We deliver fast and safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STOCK_LOCATIONS.map((location) => (
              <div key={location.id} className="location-card group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-5xl">{location.flag}</span>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{location.displayName}</h3>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Delivery: <span className="text-blue-600 font-medium">{location.eta}</span></span>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Available Now</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 border border-amber-500/30 rounded-full mb-6">
              <Star className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 text-sm font-medium">Top Picks</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Featured Products</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Our most popular items — quality guaranteed, prices you'll love
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={handleViewProduct}
              />
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-10 py-4 btn-secondary text-lg rounded-xl"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
}
