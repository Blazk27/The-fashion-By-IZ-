import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ShoppingBag, Phone, MapPin } from 'lucide-react';
import { loadSettings, loadSettingsFromDB, ShopSettings } from '../pages/AdminPage';


export function Footer() {
  const [settings, setSettings] = useState<ShopSettings>(loadSettings());

  useEffect(() => {
    loadSettingsFromDB().then(s => setSettings(s));
  }, []);

  const telegramUrl = settings.telegram_handle.startsWith('@')
    ? `https://t.me/${settings.telegram_handle.slice(1)}`
    : `https://t.me/${settings.telegram_handle}`;

  return (
    <footer className="bg-[#1a2580] text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-7 h-7 text-white" />
              <span className="text-white font-bold text-2xl">{settings.shop_name}</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed font-medium mb-3">{settings.shop_tagline}</p>
            {[settings.slogan1, settings.slogan2, settings.slogan3].filter(Boolean).map((s, i) => (
              <p key={i} className="text-blue-100 text-xs mb-1">• {s}</p>
            ))}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2">
              {[['/', 'Home'], ['/shop', 'Shop'], ['/checkout', 'Checkout'], ['/admin', 'Admin']].map(([path, label]) => (
                <li key={path}>
                  <Link to={path} className="text-blue-200 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Contact Us</h3>
            <div className="space-y-3">
              {settings.phone_number && (
                <a href={`tel:${settings.phone_number.replace(/\s/g, '')}`}
                  className="flex items-start gap-2 text-blue-200 hover:text-white transition-colors text-sm">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{settings.phone_number}</span>
                </a>
              )}
              {settings.shop_address && (
                <div className="flex items-start gap-2 text-blue-200 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{settings.shop_address}</span>
                </div>
              )}
              {settings.telegram_handle && (
                <a href={telegramUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#0088cc] hover:bg-[#0077b3] text-white rounded-lg transition-colors w-fit text-sm">
                  <MessageCircle className="w-4 h-4" />{settings.telegram_handle}
                </a>
              )}
              {settings.tiktok_url && (
                <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm">
                  <span className="text-lg">🎵</span>
                  <span className="break-all">{settings.tiktok_url.replace('https://www.tiktok.com/', '')}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-blue-400/30 pt-6 text-center">
          <p className="text-blue-300 text-sm">© {new Date().getFullYear()} {settings.shop_name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
