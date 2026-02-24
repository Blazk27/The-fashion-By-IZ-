import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, MessageCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PRODUCT_CATEGORIES } from '../types';
import { loadSettings, loadSettingsFromDB, ShopSettings } from '../pages/AdminPage';


export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const location = useLocation();
  const { getTotalItems, setIsCartOpen } = useCart();
  const [settings, setSettings] = useState<ShopSettings>(loadSettings());
  useEffect(() => {
    loadSettingsFromDB().then(s => setSettings(s));
  }, []);
  const totalItems = getTotalItems();
  const isActive = (path: string) => location.pathname === path;
  const telegramUrl = settings.telegram_handle.startsWith('@')
    ? `https://t.me/${settings.telegram_handle.slice(1)}`
    : `https://t.me/${settings.telegram_handle}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-blue-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center gap-2">
              <img src="/logo-uploaded.png" alt={settings.shop_name}
                className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover shadow-md"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className="text-blue-800 font-bold text-lg hidden sm:block">{settings.shop_name}</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-blue-600' : 'text-zinc-300 hover:text-blue-700'}`}>Home</Link>
            <Link to="/shop" className={`text-sm font-medium transition-colors ${isActive('/shop') ? 'text-blue-600' : 'text-zinc-300 hover:text-blue-700'}`}>Shop</Link>
            <div className="relative">
              <button onClick={() => setIsCategoryOpen(!isCategoryOpen)} className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors">
                Categories
                <svg className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isCategoryOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-blue-100 rounded-lg shadow-xl py-2 animate-fade-in">
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <Link key={cat} to={`/shop?category=${cat}`} onClick={() => setIsCategoryOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">{cat}</Link>
                  ))}
                </div>
              )}
            </div>
            <Link to="/admin" className={`text-sm font-medium transition-colors ${isActive('/admin') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-700'}`}>Admin</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#0088cc] hover:bg-[#0077b3] text-white rounded-lg transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{settings.telegram_handle}</span>
            </a>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-600 hover:text-blue-700 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">{totalItems}</span>
              )}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-gray-600 hover:text-blue-700 transition-colors">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-100 animate-fade-in bg-white">
            <nav className="flex flex-col gap-2">
              {[['/', 'Home'], ['/shop', 'Shop'], ['/admin', 'Admin']].map(([path, label]) => (
                <Link key={path} to={path} onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${isActive(path) ? 'bg-amber-500/20 text-amber-500' : 'text-zinc-300 hover:bg-zinc-800'}`}>{label}</Link>
              ))}
              <div className="pt-2 border-t border-zinc-800">
                <p className="px-4 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">Categories</p>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <Link key={cat} to={`/shop?category=${cat}`} onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-6 py-2 text-zinc-300 hover:bg-zinc-800 transition-colors">{cat}</Link>
                ))}
              </div>
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 mt-2 bg-[#0088cc] text-white rounded-lg">
                <MessageCircle className="w-4 h-4" /><span>Contact: {settings.telegram_handle}</span>
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
