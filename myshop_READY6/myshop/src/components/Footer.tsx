import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Phone, MapPin, Heart } from 'lucide-react';
import { loadSettings, loadSettingsFromDB, ShopSettings } from '../pages/AdminPage';

export function Footer() {
  const [settings, setSettings] = useState<ShopSettings>(loadSettings());

  useEffect(() => {
    loadSettingsFromDB().then(s => setSettings(s));
  }, []);

  const telegramUrl = settings.telegram_handle
    ? `https://t.me/${settings.telegram_handle.replace('@', '')}`
    : '#';

  return (
    <footer className="mesh-bg text-white relative overflow-hidden">
      {/* Top wave */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-white/40 to-blue-400 opacity-30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo-uploaded.png" alt={settings.shop_name}
                className="w-12 h-12 rounded-xl object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div>
                <p className="font-bold text-xl text-white">{settings.shop_name}</p>
                <p className="text-blue-200 text-sm">By IZ</p>
              </div>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed mb-3">{settings.shop_tagline}</p>
            {[settings.slogan1, settings.slogan2, settings.slogan3].filter(Boolean).map((s, i) => (
              <p key={i} className="text-blue-300 text-xs mb-1">• {s}</p>
            ))}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-5 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3">
              {[['/', 'Home'], ['/shop', 'Shop'], ['/checkout', 'Checkout'], ['/admin', 'Admin']].map(([path, label]) => (
                <li key={path}>
                  <Link to={path} className="text-blue-200 hover:text-white text-sm transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:bg-white transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-base mb-5 uppercase tracking-wider">Contact Us</h3>
            <div className="space-y-3">
              {settings.phone_number && (
                <a href={`tel:${settings.phone_number.replace(/\s/g, '')}`}
                  className="flex items-start gap-3 text-blue-200 hover:text-white transition-colors text-sm group">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="mt-1.5">{settings.phone_number}</span>
                </a>
              )}
              {settings.shop_address && (
                <div className="flex items-start gap-3 text-blue-200 text-sm">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="mt-1.5">{settings.shop_address}</span>
                </div>
              )}
              {settings.telegram_handle && (
                <a href={telegramUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm group">
                  <div className="w-8 h-8 bg-[#0088cc] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#0077b3] transition-colors">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-blue-200 group-hover:text-white transition-colors">{settings.telegram_handle}</span>
                </a>
              )}
              {settings.tiktok_url && (
                <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm group">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                    <span className="text-base">🎵</span>
                  </div>
                  <span className="text-blue-200 group-hover:text-white transition-colors text-xs break-all">
                    TikTok
                  </span>
                </a>
              )}
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm group">
                  <div className="w-8 h-8 bg-[#1877f2] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:opacity-80 transition-opacity">
                    <span className="text-base">📘</span>
                  </div>
                  <span className="text-blue-200 group-hover:text-white transition-colors text-sm">
                    Facebook Page
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-blue-300 text-sm">© {new Date().getFullYear()} {settings.shop_name}. All rights reserved.</p>
          <p className="text-blue-300 text-sm flex items-center gap-1.5">
            Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> in Myanmar
          </p>
        </div>
      </div>
    </footer>
  );
}
