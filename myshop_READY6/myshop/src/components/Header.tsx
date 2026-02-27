import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PRODUCT_CATEGORIES } from '../types';
import { loadSettings, loadSettingsFromDB, ShopSettings } from '../pages/AdminPage';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { getTotalItems, setIsCartOpen } = useCart();
  const [settings, setSettings] = useState<ShopSettings>(loadSettings());
  const totalItems = getTotalItems();
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    loadSettingsFromDB().then(s => setSettings(s));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const telegramUrl = settings.telegram_handle
    ? `https://t.me/${settings.telegram_handle.replace('@', '')}`
    : '#';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo-uploaded.png" alt={settings.shop_name}
              className="w-10 h-10 md:w-11 md:h-11 rounded-xl object-cover shadow-md group-hover:shadow-blue-200 transition-shadow"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div className="hidden sm:block">
              <p className={`font-bold text-base leading-tight transition-colors ${scrolled ? 'text-gray-800' : 'text-white'}`}>
                {settings.shop_name}
              </p>
              <p className={`text-xs leading-tight transition-colors ${scrolled ? 'text-blue-500' : 'text-blue-200'}`}>
                By IZ
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[['/', 'Home'], ['/shop', 'Shop']].map(([path, label]) => (
              <Link key={path} to={path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(path)
                    ? scrolled ? 'bg-blue-50 text-blue-600' : 'bg-white/15 text-white'
                    : scrolled ? 'text-gray-600 hover:text-blue-600 hover:bg-blue-50' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}>
                {label}
              </Link>
            ))}

            {/* Categories Dropdown */}
            <div className="relative">
              <button onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                  scrolled ? 'text-gray-600 hover:text-blue-600 hover:bg-blue-50' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}>
                Categories
                <svg className={`w-3.5 h-3.5 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isCategoryOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-blue-50 rounded-xl shadow-xl shadow-blue-100/50 py-2 animate-fade-in-down">
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <Link key={cat} to={`/shop?category=${cat}`} onClick={() => setIsCategoryOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#0088cc] hover:bg-[#0077b3] text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
              <MessageCircle className="w-4 h-4" />
              {settings.telegram_handle || '@thefashion_mm'}
            </a>

            <button onClick={() => setIsCartOpen(true)}
              className={`relative p-2.5 rounded-xl transition-all ${scrolled ? 'text-gray-600 hover:bg-blue-50 hover:text-blue-600' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2.5 rounded-xl transition-all ${scrolled ? 'text-gray-600 hover:bg-blue-50' : 'text-white hover:bg-white/10'}`}>
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-50 bg-white rounded-b-2xl shadow-lg animate-fade-in-down">
            <nav className="flex flex-col gap-1 px-2">
              {[['/', 'Home'], ['/shop', 'Shop'], ['/admin', 'Admin']].map(([path, label]) => (
                <Link key={path} to={path} onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(path) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}>
                  {label}
                </Link>
              ))}
              <div className="pt-2 px-2">
                <a href={telegramUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 bg-[#0088cc] text-white text-sm font-medium rounded-xl">
                  <MessageCircle className="w-4 h-4" />
                  {settings.telegram_handle || 'Contact on Telegram'}
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
