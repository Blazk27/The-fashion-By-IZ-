import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Truck, ShoppingBag, MapPin, Clock, CheckCircle, MessageCircle, Sparkles, Heart, Zap } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { Product, STOCK_LOCATIONS } from '../types';
import { loadSettings, loadSettingsFromDB, ShopSettings } from './AdminPage';

export function HomePage() {
  const { featuredProducts } = useProducts();
  const [settings, setSettings] = useState<ShopSettings>(loadSettings());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadSettingsFromDB().then(s => setSettings(s));
  }, []);

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const telegramUrl = settings.telegram_handle
    ? `https://t.me/${settings.telegram_handle.replace('@', '')}`
    : '#';

  const trustBadges = [
    { icon: ShoppingBag, label: 'Quality Products', desc: 'Sourced from Thailand' },
    { icon: Shield, label: 'Secure Payment', desc: 'Safe & encrypted' },
    { icon: Truck, label: 'Fast Delivery', desc: 'Myanmar · Cambodia · Thailand' },
    { icon: Zap, label: 'Best Price', desc: 'Wholesale & Retail' },
  ];

  return (
    <div className="min-h-screen">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden mesh-bg">

        {/* Floating circles decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 left-8 w-64 h-64 rounded-full bg-white/5 blur-3xl animate-float" style={{animationDelay:'0s'}} />
          <div className="absolute top-32 right-12 w-48 h-48 rounded-full bg-blue-300/10 blur-2xl animate-float" style={{animationDelay:'1.5s'}} />
          <div className="absolute bottom-24 left-1/4 w-80 h-80 rounded-full bg-blue-400/8 blur-3xl animate-float" style={{animationDelay:'0.8s'}} />
          <div className="absolute -bottom-10 right-1/4 w-56 h-56 rounded-full bg-white/5 blur-2xl animate-float" style={{animationDelay:'2s'}} />
          {/* Milk drops decorations */}
          <div className="absolute top-1/4 left-16 w-3 h-3 rounded-full bg-white/40 animate-pulse-slow" />
          <div className="absolute top-1/3 right-24 w-2 h-2 rounded-full bg-blue-200/60 animate-pulse-slow" style={{animationDelay:'1s'}} />
          <div className="absolute bottom-1/3 left-1/3 w-4 h-4 rounded-full bg-white/20 animate-pulse-slow" style={{animationDelay:'2s'}} />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 milk-glass px-5 py-2.5 rounded-full mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span className="text-white/90 text-sm font-medium tracking-widest uppercase">
              The Fashion By IZ
            </span>
            <Sparkles className="w-4 h-4 text-blue-200" />
          </div>

          {/* Main Title */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-4 animate-fade-in-up leading-none" style={{animationDelay:'0.1s'}}>
            {settings.shop_name || 'The Fashion'}
            <br />
            <span className="text-gradient-white text-4xl md:text-5xl lg:text-6xl font-medium">
              By IZ
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-blue-100 font-medium mb-6 animate-fade-in-up" style={{animationDelay:'0.2s'}}>
            {settings.shop_tagline || 'Wholesale & Retail Women Clothing'}
          </p>

          {/* Slogans */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 animate-fade-in-up" style={{animationDelay:'0.25s'}}>
            {[settings.slogan1, settings.slogan2, settings.slogan3].filter(Boolean).map((s, i) => (
              <span key={i} className="milk-glass px-4 py-2 rounded-full text-white text-sm font-medium">
                {s}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{animationDelay:'0.3s'}}>
            <Link to="/shop" className="btn-primary text-lg px-10 py-4 rounded-xl gap-3">
              Shop Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer"
              className="btn-outline text-lg px-10 py-4 rounded-xl gap-3">
              <MessageCircle className="w-5 h-5" />
              Telegram
            </a>
            {settings.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer"
                className="btn-outline text-lg px-10 py-4 rounded-xl gap-3">
                📘 Facebook
              </a>
            )}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 mt-14 animate-fade-in-up" style={{animationDelay:'0.4s'}}>
            {[['1000+', 'Products'], ['3', 'Countries'], ['100%', 'Authentic'], ['Free', 'Delivery']].map(([num, label]) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-white">{num}</p>
                <p className="text-blue-200 text-sm mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in" style={{animationDelay:'0.8s'}}>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2 milk-glass">
            <div className="w-1 h-3 bg-white/60 rounded-full animate-pulse-slow" />
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ──────────────────────────────────── */}
      <section className="py-10 bg-white border-b border-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="trust-badge">
                <badge.icon className="trust-badge-icon flex-shrink-0" />
                <div>
                  <p className="text-gray-800 font-semibold text-sm">{badge.label}</p>
                  <p className="text-gray-400 text-xs">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full border border-blue-100 mb-4">
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Shopping Made <span className="text-gradient-gold">Easy</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">Everything you need, delivered to your door across Southeast Asia</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            {[
              { icon: Shield, title: '100% Authentic', desc: 'All products are genuine, sourced directly from verified suppliers in Thailand', color: 'from-blue-500 to-blue-600' },
              { icon: Truck, title: 'Cross-Border Delivery', desc: 'Fast and reliable delivery across Myanmar, Cambodia & Thailand', color: 'from-indigo-500 to-blue-500' },
              { icon: Heart, title: 'Best Price Promise', desc: 'We buy wholesale so you always get the best market prices', color: 'from-sky-500 to-blue-500' },
            ].map((item) => (
              <div key={item.title} className="premium-card p-8 text-center group">
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DELIVERY LOCATIONS ────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full border border-blue-100 mb-4">
              Delivery Areas
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">We Deliver To</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Order from anywhere in Southeast Asia</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {STOCK_LOCATIONS.map((location) => (
              <div key={location.id} className="location-card group">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-5xl">{location.flag}</span>
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{location.displayName}</h3>
                <div className="flex items-center gap-2 text-gray-400 mb-4">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Delivery: <span className="text-blue-600 font-semibold">{location.eta}</span></span>
                </div>
                <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>Available Now</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full border border-blue-100 mb-4">
              Top Picks
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Featured <span className="text-gradient-gold">Products</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">Our most popular items — quality guaranteed</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} onViewDetails={handleViewProduct} />
            ))}
          </div>

          <div className="text-center mt-14">
            <Link to="/shop" className="btn-secondary text-base px-8 py-3.5 rounded-xl gap-2">
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <section className="py-20 mesh-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-blue-300/10 blur-2xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Shop? 🛍️
          </h2>
          <p className="text-blue-100 text-lg mb-8">Browse hundreds of fashion items at wholesale prices</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop" className="btn-primary px-10 py-4 text-lg rounded-xl gap-3">
              Browse All Products <ArrowRight className="w-5 h-5" />
            </Link>
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer"
              className="btn-outline px-10 py-4 text-lg rounded-xl gap-3">
              <MessageCircle className="w-5 h-5" /> Chat with Us
            </a>
          </div>
        </div>
      </section>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedProduct(null); }}
      />
    </div>
  );
}
